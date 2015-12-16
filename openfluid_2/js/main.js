Ext.namespace("GEOR.Addons");

var openfluid = {
    geoworkspace : {
        list: [],
        WSField: null,
        WSCapabilities: [],
        WSLayersObject: [],
        GetWMSLayers: function(URL_geoserver, ws) {
            var UrlWs = URL_geoserver + ws + "/ows";
            var wmsCapabilitiesFormat = new OpenLayers.Format.WMSCapabilities();
            var onLayerLoadError = function() { alert("!!!"); }
            
            openfluid.geoworkspace.WSCapabilities.length = 0,
            openfluid.geoworkspace.WSLayersObject.length = 0,
            
            OpenLayers.Request.GET({
                url : UrlWs,
                params : {
                    SERVICE: 'WMS',
                    VERSION: "1.3.0", // For example, '1.1.1'
                    REQUEST: 'GetCapabilities'
                },
                success: function(r){
                    var doc = r.responseXML;
                    if (!doc || !doc.documentElement) {
                        doc = r.responseText;
                    }

                    var c = wmsCapabilitiesFormat.read(doc);
                    if (!c || !c.capability) {
                        onLayerLoadError();
                        return;
                    }       

                    // Here is result, do whatever you want with it
                    var n_layers = c.capability.layers.length;
                    var Cap = c.capability;
                    
                    // Ajouter l'objet openlayer capabilities response to "openfluid.geoworkspace.WSCapabilities"
                    openfluid.geoworkspace.WSCapabilities.push(Cap);


                    for (var i = 0; i < n_layers; i++) {
                        var couche = c.capability.layers[i].name;                       
                        openfluid.geoworkspace.WSLayersObject.push(couche);
                        console.log(couche)
                    }
                },
                failure : function(r) {
                    GEOR.util.errorDialog({
                        msg: OpenLayers.i18n('Server unavailable')
                    });
                },
                callback : function(success){
                    console.log("nombre de couches dans "+ws+" = "+openfluid.geoworkspace.WSLayersObject.length+1)
                },
            });

        },
    },
	inputs : {
		list : [],
		forXmlPost : [],
		scrollwms : {
			list : [],
			addScrollwms : function(Scrollwms,addObj) {
				openfluid.inputs.scrollwms[Scrollwms] = {obj : null} 
				openfluid.inputs.scrollwms[Scrollwms].obj = addObj;
				openfluid.inputs.scrollwms[Scrollwms].objForWindowInput = null;
				openfluid.inputs.scrollwms[Scrollwms].scrollwms = null;
				openfluid.inputs.scrollwms[Scrollwms].refreshedObjForWindowInput = null;
			},
		},
        scroll : {
			list : [],
			addScroll : function(addScrollID,addObj) {
				openfluid.inputs.scroll[addScrollID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.scroll[addScrollID].obj = addObj;
				openfluid.inputs.scroll[addScrollID].objForWindowInput = null;
			}
		},
		checkbox : {
			list : [],
			addCheckbox : function(addCheckboxID,addObj) {
				openfluid.inputs.checkbox[addCheckboxID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.checkbox[addCheckboxID].obj = addObj;
				openfluid.inputs.checkbox[addCheckboxID].objForWindowInput = null;
			}
		},
		param : {
			list : [],
			addParam : function(addParamID,addObj) {
				openfluid.inputs.param[addParamID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.param[addParamID].obj = addObj;
				openfluid.inputs.param[addParamID].objForWindowInput = null;
			}
		},
		coordxy : {
			list : [],
			addCoordxy : function(Coordxy,addObj) {
				openfluid.inputs.coordxy[Coordxy] = {obj : null} 
				openfluid.inputs.coordxy[Coordxy].obj = addObj;
				openfluid.inputs.coordxy[Coordxy].objForWindowInput = null;
				openfluid.inputs.coordxy[Coordxy].coordxyStore = null;
			}
		},
		gml : {
			list : [],
			addGml : function(Gml,addObj) {
				openfluid.inputs.gml[Gml] = {obj : null} 
				openfluid.inputs.gml[Gml].obj = addObj;
				openfluid.inputs.gml[Gml].objForWindowInput = null;
				openfluid.inputs.gml[Gml].gmlValue = null;
			}
		}
	},
	outputs : {
		list : [],
		forXmlResponse : [],
		scroll : {
			list : []
		},
		param : {
			list : [],
            addParam : function(addParamID,addObj) {
				openfluid.outputs.param[addParamID] = {paramValue : null} // ["param"+addParam] for dynamic var obj
				openfluid.outputs.param[addParamID].paramValue = addObj;
			}
		},
		wms : {
			list : [],
			addWms : function(addWmsID,addObj) {
				openfluid.outputs.wms[addWmsID] = {wmsValue : null} // ["param"+addParam] for dynamic var obj
				openfluid.outputs.wms[addWmsID].wmsValue = addObj;
			}
		}
	}
}

var noglob_execute_on_off = 0;
var noglob_regionContent = "";
var noglob_myPanel = "";
var noglob_liste = "";

GEOR.Addons.openfluid_2 = function(map, options) {
    this.map = map;
    this.options = options;
};

GEOR.Addons.openfluid_2.prototype = {
    win: null,
    item: null,
    WPS_URL: null,
    WPS_identifier: null,
    show_help: null,
    win_help: null,
    layerStore: null,
    Help_URL: null,
    Metadata_URL: null,
    globalWidth: null,
    wpsInitialized: false,

    init: function(record) {
        var lang = OpenLayers.Lang.getCode();
        URL_WS = this.options.URL_WS;
        URL_cgi = this.options.URL_cgi;
        WPS_URL = this.options.WPS_URL;
        WPS_identifier = this.options.WPS_identifier;
        Help_URL = this.options.Help_URL;
        Metadata_URL = this.options.Metadata_URL;
        globalWidth = this.options.globalWidth;
        layerStore = Ext.getCmp("mappanel").layers;

        if (this.wpsInitialized === false) {
            this.describeProcess(WPS_URL, WPS_identifier);
        };
        mask_loader = new Ext.LoadMask(Ext.getBody(), {
            msg: OpenLayers.i18n("Processing ..."),
        });
        this.item = new Ext.menu.Item({
            text: record.get("title")[lang],
            qtip: record.get("description")[lang],
            iconCls: 'process_time_icon',
            handler: this.showWindow,
            scope: this
        });
        return this.item;
    },
    
    
    GetWorkspaces : function(){
        
        Ext.Ajax.request({
              method: 'GET',
              loadMask: true,
              scope: this,
              url: URL_cgi,
              success: function (response, request) {
                //Ext.MessageBox.alert('success', response.responseText);
                var doc = response.responseXML;           
                var longeur = doc.activeElement.childElementCount;

                for (var i = 1; i < longeur; i++) {
                    var ws = doc.getElementsByTagName("name")[i].firstChild.nodeValue;
                    //console.log("ws "+i+" = "+ ws);
                    openfluid.geoworkspace.list[i-1] = ws;
                }
                console.log(openfluid.geoworkspace.list);
            },
            failure: function (response, request) {
                Ext.MessageBox.alert('failure', response.responseText);
            }
        });
    },
    
    /** -----------------------------------------------------------------------------
        Describe process    	
        ----------------------------------------------------------------------------- */
    describeProcess: function(url, identifier) {
        this.GetWorkspaces();
        var onDescribeP = this.onDescribeProcess;
        OpenLayers.Request.GET({
            url: url, // Url of the pywps.cgi (manifest.js)
            params: {
                "SERVICE": "WPS",
                "VERSION": "1.0.0",
                "REQUEST": "DescribeProcess",
                "IDENTIFIER": identifier // Identifier of the WPS (manifest.js)
            },
            success: function(response) {
                var wpsProcess = new OpenLayers.Format.WPSDescribeProcess().read(response.responseText).processDescriptions[identifier]; // wpsProcess = [object Object] 

                // ----------------------------------------------------------------------
                // Course inputs
                // ----------------------------------------------------------------------
                //Recovery of identifiers (ie the names of inputs) extracted from python and stores in the noglob_table "table"
                for (i in wpsProcess.dataInputs) { // List every input from the describe process query
					openfluid.inputs.list.push(wpsProcess.dataInputs[i].identifier);
                }
                var index = openfluid.inputs.list.indexOf(undefined);
				
                if (index > -1) {
                    openfluid.inputs.list.splice(index, 1);
                } // Removing undefined values 
                for (i = 0; i < openfluid.inputs.list.length; i++) {
                    switch (true) {
                        case (openfluid.inputs.list[i].slice(0, 13) == "L_input_param"):
							openfluid.inputs.param.list.push(openfluid.inputs.list[i]);
                            break;
                        case (openfluid.inputs.list[i].slice(0, 11) == "L_input_wms"):
                            openfluid.inputs.scrollwms.list.push(openfluid.inputs.list[i]);
                            break;
                        case (openfluid.inputs.list[i].slice(0, 14) == "L_input_scroll"):
							openfluid.inputs.scroll.list.push(openfluid.inputs.list[i]);
                            break;
                        case (openfluid.inputs.list[i].slice(0, 15) == "L_input_coordxy"):
							openfluid.inputs.coordxy.list.push(openfluid.inputs.list[i]);
                            break;
                        case (openfluid.inputs.list[i].slice(0, 11) == "C_input_gml"):
							openfluid.inputs.gml.list.push(openfluid.inputs.list[i]);
                            break;
                        case (openfluid.inputs.list[i].slice(0, 16) == "L_input_checkbox"):
							openfluid.inputs.checkbox.list.push(openfluid.inputs.list[i]);
                            break;						
                    }
                }
								
                // ----------------------------------------------------------------------
                // Course outputs
                // ----------------------------------------------------------------------
                // List the outputs included in the DescribeProcess query and store them in the noglob_table "noglob_tableOutputs"
                for (i in wpsProcess.processOutputs) {
					openfluid.outputs.list.push(wpsProcess.processOutputs[i].identifier);
                }
                if (openfluid.outputs.list.indexOf(undefined) > -1) {
                    openfluid.outputs.list.splice(openfluid.outputs.list.indexOf(undefined), 1);
                }
                for (i = 0; i < openfluid.outputs.list.length; i++) {
                    if (openfluid.outputs.list[i].slice(0, 12) == "L_output_wms") {
						openfluid.outputs.wms.list.push(openfluid.outputs.list[i]);
                    } 
					else if (openfluid.outputs.list[i].slice(0, 14) == "L_output_param") {
                        //noglob_table_L_output_param.push(openfluid.outputs.list[i]);
						openfluid.outputs.param.list.push(openfluid.outputs.list[i]);
                    }
                }
                onDescribeP(wpsProcess);
            },
            failure: function() {
                GEOR.util.errorDialog({
                    msg: OpenLayers.i18n('Server unavailable')
                });
            }
        });
    },
    
    /** -----------------------------------------------------------------------------
        onDescribe process   	
        ----------------------------------------------------------------------------- */
    onDescribeProcess: function(process) {
        // onDescribeProcess lists the necessary inputs
        findDataInputsByIdentifier = function(datainputs, identifier) {
            var datainput, i;
            for (i = 0; i < datainputs.length; i++) {
                if (datainputs[i].identifier === identifier) {
                    datainput = datainputs[i]; // console.log(datainputs[i]) =  Object { maxOccurs=1, minOccurs=0, identifier="L_input_param1", plus...}
                    break;
                }
            }
            return datainput;
        };

        // ----------------------------------------------------------------------
        // Data inputs param 		
        // ----------------------------------------------------------------------
	    for (i = 0; i < openfluid.inputs.param.list.length; i++) {	
            var name_inputs = openfluid.inputs.param.list[i];
			openfluid.inputs.param.addParam(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
		}
		
        // ----------------------------------------------------------------------
        // Data input WMS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WMS input WMS -- openfluid.inputs.scrollwms.list
		for (i = 0; i < openfluid.inputs.scrollwms.list.length; i++) {
            var name_inputs = openfluid.inputs.scrollwms.list[i];
            openfluid.inputs.scrollwms.addScrollwms(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
		}

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        for (i = 0; i < openfluid.inputs.scroll.list.length; i++) {
            var name_inputs = openfluid.inputs.scroll.list[i]; 
			openfluid.inputs.scroll.addScroll(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
			trashArray = [];
            for (var k in openfluid.inputs.scroll[name_inputs].obj.literalData.allowedValues) {
					trashArray.push(k);
            }
			openfluid.inputs.scroll[name_inputs].obj.literalData.allowedValues.list = [];
			openfluid.inputs.scroll[name_inputs].obj.literalData.allowedValues.list = trashArray;
        }
		
        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
		for (i = 0; i < openfluid.inputs.coordxy.list.length; i++) {
            var name_inputs = openfluid.inputs.coordxy.list[i];
            openfluid.inputs.coordxy.addCoordxy(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs Checkbox 
        // ----------------------------------------------------------------------		
	    for (i = 0; i < openfluid.inputs.checkbox.list.length; i++) {
            var name_inputs = openfluid.inputs.checkbox.list[i];
			openfluid.inputs.checkbox.addCheckbox(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs GML 
        // ----------------------------------------------------------------------		
	    for (i = 0; i < openfluid.inputs.gml.list.length; i++) {
            var name_inputs = openfluid.inputs.gml.list[i];
			openfluid.inputs.gml.addGml(name_inputs,findDataInputsByIdentifier(process.dataInputs, name_inputs));
		}
        this.wpsInitialized = true;
    },
    /** -----------------------------------------------------------------------------
    Input window 	
    ----------------------------------------------------------------------------- */
    createWindow: function() {
        var onWSSelect = function (v) {
            this.onWSSelect(v)
        }
        FIELD_WIDTH = 150, 
        base = {
            forceSelection: true,
            editable: true,
            allowBlank: true,
            triggerAction: 'all',
            mode: 'local',
            labelSeparator: OpenLayers.i18n("labelSeparator"),
            valueField: 'value',
            displayField: 'text',
            labelWidth: 200
        };
        
		//noglob_table_input_param = [];
        // ----------------------------------------------------------------------
        // Parameter inputs
        // ----------------------------------------------------------------------
		openfluid.inputs.param.windowInput = [];
		//var noglob_table_input_param_splitPanel1 = [];
		//var noglob_table_input_param_splitPanel2 = [];
		for (i = 0; i < openfluid.inputs.param.list.length; i++) {
            var name_inputs = openfluid.inputs.param.list[i];
            openfluid.inputs.param[name_inputs].objForWindowInput = new Ext.form.TextField({ //this.champ_pour_input_param1 = new Ext.form.TextField({
                fieldLabel: openfluid.inputs.param[name_inputs].obj.title,//wps_Config_param1.input_param1_fromPython.title,
                name: "uselessname"+i,
                width: FIELD_WIDTH,
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                allowDecimals: true
            });
			openfluid.inputs.param.windowInput.push(openfluid.inputs.param[name_inputs].objForWindowInput);
        }

        // ----------------------------------------------------------------------
        // WorkSpaces field
        // ----------------------------------------------------------------------		       
        // PART 1
        openfluid.geoworkspace.WSField = new Ext.form.ComboBox(Ext.apply({
            name: "WS",
            editable: false,
            fieldLabel: "Workspaces list",
            emptyText: "Chose a workspace",
            width: FIELD_WIDTH,
            triggerAction:'all',
            store : openfluid.geoworkspace.list,
            listeners: {
                'select': function(records) { // select : quand a choisi un champ de la cbbox
                    var ws = records.value;
                    openfluid.geoworkspace.GetWMSLayers(URL_WS, ws);
                }
            },
        }, base));
        
        // ----------------------------------------------------------------------
        // WMS inputs
        // ----------------------------------------------------------------------		       
        // PART 1
		layer_noglob_liste_WFS = [];
		openfluid.inputs.scrollwms.windowInput = [];
        var noglob_addComboxFieldItemsWFS = function() { // Fonctionne pour le WMS et WFS, sert a editer layer_noglob_liste_WFS
            //var empty = true;
            layerStore.each(function(record) {
                var layer = record.get('layer');
                var queryable = record.get('queryable');
                var hasEquivalentWFS = record.hasEquivalentWFS();
                if (queryable && hasEquivalentWFS) {
                    //empty = false;

                    var ObjectRecordType = Ext.data.Record.create(['text', 'value']);
                    var rec = new ObjectRecordType({
                        text: layer.name,
                        value: record
                    })

                    noglob_liste = [rec.data.text, rec.data.value];
                    layer_noglob_liste_WFS.push(noglob_liste);
                }
            });
			return layer_noglob_liste_WFS;
        };
        noglob_addComboxFieldItemsWFS();
        warningMsg_wms = {
            border: false,
            iconCls: 'grey_warn',
            msg: 'Seuls les WMS déjà chargés avant la première ouverture de l\'addon seront utilisables.'
        };

        
		tmpStore = new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
					//,storeId: 'myStore'
                });
        
		// PART 2
		for (i = 0; i < openfluid.inputs.scrollwms.list.length; i++) {
            var name_inputs = openfluid.inputs.scrollwms.list[i];
			openfluid.inputs.scrollwms[name_inputs].objForWindowInput =	new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: openfluid.inputs.scrollwms[name_inputs].obj.title,
                emptyText: openfluid.inputs.scrollwms[name_inputs].obj.abstract,
                width: FIELD_WIDTH,
                store: tmpStore,
				listeners: {
				}				
            }, base));
			openfluid.inputs.scrollwms.windowInput.push(openfluid.inputs.scrollwms[name_inputs].objForWindowInput);
        }
        
        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
		openfluid.inputs.scroll.windowInput = [];
		for (i = 0; i < openfluid.inputs.scroll.list.length; i++) {
            var name_inputs = openfluid.inputs.scroll.list[i];
            
			openfluid.inputs.scroll[name_inputs].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
				width: FIELD_WIDTH, // line 1203
				fieldLabel:openfluid.inputs.scroll[name_inputs].obj.title, 
				name:'division'+i,
                value: openfluid.inputs.scroll[name_inputs].obj.literalData.allowedValues.list[0],
				store: openfluid.inputs.scroll[name_inputs].obj.literalData.allowedValues.list,
				editable: false,
				triggerAction:'all',
						}, base));	
			openfluid.inputs.scroll.windowInput.push(openfluid.inputs.scroll[name_inputs].objForWindowInput);
        }
        
        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
		openfluid.inputs.gml.windowInput = [];
// Valable pour un seul GML en entrée !
        if (openfluid.inputs.gml.list.length >= 1) {

//            for (var i = 0; i < openfluid.inputs.gml.list.length; i++) {
    var name_inputs = openfluid.inputs.gml.list[0];
//    console.log(name_inputs);
//                toComptGMLInputs.IdGML[i] = name_inputs;
//                openfluid.inputs.gml.windowInput.push(toComptGMLInputs);
                tmpwindowgml = {
                    width: 0,
                    id: name_inputs,
//                    xtype: 'textfield',
                    xtype: 'fileuploadfield',
//                    inputType: 'file',
                    fieldLabel: openfluid.inputs.gml[name_inputs].obj.title,
//                    fileUpload: true,
                    buttonText: '',
                    labelSeparator: OpenLayers.i18n("labelSeparator"),
                    allowBlank: false,
                    listeners: {
//                        'beforerender': function() { // beforerender est juste au moment d ouvrir la fenetre avant qu elle saffiche
//                           console.log('beforerender');
//                        },
                        fileselected: function(fb, v) {
                            var file = fb.fileInput.dom.files[0];
                            var myfilename = v;
                            var reader = new FileReader();
                            reader.onload = function(e) {
//                                console.log(e.target.result);
                                console.log('ajout gml '+i);
                                openfluid.inputs.gml[tmpwindowgml.id].gmlValue = e.target.result; // flag : i undefined
                                if (myfilename.search('.gml') != -1) {
                                    
                                } else {
                                    GEOR.util.errorDialog({
                                        title: "Erreur de format",
                                        msg: "Veuillez choisir un format GML."
                                    });
                                }
                            };
                            reader.readAsText(file, "UTF-8");
                            console.log(openfluid.inputs.gml[tmpwindowgml.id].gmlValue);
                        }
                    }
                }
                openfluid.inputs.gml.windowInput.push(tmpwindowgml);
//            }
        }
       
        // PART 2 GML Window
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: true,
//            labelWidth: 150, // xtype: 'filefield',
            labelWidth: 0, // for xtype: 'fileuploadfield',
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                openfluid.inputs.gml.windowInput,
            ]
        });

        var fileWindow = new Ext.Window({
            closable: true,
            width: 320,
            title: "Parcourir",
            border: false,
            plain: true,
            region: 'center',
            items: [
                fileLoadForm
            ]
        });
        fileWindow.render(Ext.getBody());

        // ----------------------------------------------------------------------
        // Coordinate inputs
        // ----------------------------------------------------------------------
        // PART 1  
        var defControl = function() {
            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },
                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                    OpenLayers.Control.prototype.initialize.apply(this, arguments);
                    this.handler = new OpenLayers.Handler.Click(this, {
                        'click': this.trigger
                    }, this.handlerOptions);
                },
                trigger: function(e) {
                    var lonlat = map.getLonLatFromPixel(e.xy);
                    clickbv.deactivate();
					for (i = 0; i < openfluid.inputs.coordxy.list.length; i++) {
                        var name_inputs = openfluid.inputs.coordxy.list[i];
							openfluid.inputs.coordxy[name_inputs].coordxyStore = lonlat.lat; 
							alert("Input 1 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
							log_coord = 0;
					}
                }
            })
        };

        // PART 2
        defControl();
        map = this.map;
        clickbv = new OpenLayers.Control.Click();
        map.addControl(clickbv);

		openfluid.inputs.coordxy.windowInput = [];
		for (i = 0; i < openfluid.inputs.coordxy.list.length; i++) {
            var name_inputs = openfluid.inputs.coordxy.list[i];
            openfluid.inputs.coordxy[name_inputs].objForWindowInput = new Ext.Button({
                iconCls: 'add_icon',
                text: openfluid.inputs.coordxy[name_inputs].obj.title, //OpenLayers.i18n(noglob_coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = i;
                },
                scope: this
            });
			openfluid.inputs.coordxy.windowInput.push(openfluid.inputs.coordxy[name_inputs].objForWindowInput);
		}
		
        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
		openfluid.inputs.checkbox.windowInput = [];
		for (i = 0; i < openfluid.inputs.checkbox.list.length; i++) {
            var name_inputs = openfluid.inputs.checkbox.list[i];
			openfluid.inputs.checkbox[name_inputs].objForWindowInput = new Ext.form.Checkbox({ // flag
					id: 'checkbox'+i,
					width: 5,
					xtype: 'checkbox',
					fieldLabel: openfluid.inputs.checkbox[name_inputs].obj.title,
					checked: true
            });
			openfluid.inputs.checkbox.windowInput.push(openfluid.inputs.checkbox[name_inputs].objForWindowInput);
		}
        
        // ----------------------------------------------------------------------
        // Tab (in progress)
        // ----------------------------------------------------------------------		
        
        var onglet_scrollWS = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Choix de l'espace de travail"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: false,
            plain: true,
            buttonAlign: 'right',
            autoScroll: true, 
            items: [{
                xtype: 'form',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
                    openfluid.geoworkspace.WSField,
                ]
            }]
        };
        
        
        if (openfluid.inputs.scrollwms.list.length == 0){ 
            var v_collapsed0 = true; //fermé
        }else{
            v_collapsed0 = false; //ouvert
        }
        
        if (openfluid.inputs.scroll.list.length == 0){
            var v_collapsed1 = true;
        }else{
            v_collapsed1 = false;
        }
        
        if (openfluid.inputs.checkbox.list.length == 0){
            var v_collapsed2 = true;
        }else{
            v_collapsed2 = false;
        }
        
        if (openfluid.inputs.param.list.length == 0){
            var v_collapsed3 = true;
        }else{
            v_collapsed3 = false;
        }
        
        if (openfluid.inputs.coordxy.list.length == 0){
            var v_collapsed4 = true;
        }else{
            v_collapsed4 = false;
        }
        
        if (openfluid.inputs.gml.list.length == 0){
            var v_collapsed5 = true;
        }else{
            v_collapsed5 = false;
        }
        
        var onglet_scroll = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Valeurs permises au choix"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: v_collapsed1,
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            bodyStyle: { maxHeight: '90px' },
            items: [{
                xtype: 'form',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
//				    openfluid.inputs.param.windowInput,
					openfluid.inputs.scroll.windowInput,
                ]
            }]
        };
        
        var onglet_checkbox = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Paramétrage 0/1"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: v_collapsed2,
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            bodyStyle: { maxHeight: '120px' },
            items: [{
                xtype: 'form',
                labelWidth: 300,
                bodyStyle: "padding:10px;",
                items: [
					openfluid.inputs.checkbox.windowInput,
                ]
            }]
        };
        var onglet_param = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Paramétrage text en entrée"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: v_collapsed3,
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            bodyStyle: { maxHeight: '90px' },
            items: [{
                xtype: 'form',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
					openfluid.inputs.param.windowInput,
                ]
            }]
        };
        var onglet_coordxy = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Choix d'un mpoint sur la carte"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: v_collapsed4,
            plain: true,
            buttonAlign: 'right',
            items: [{
                xtype: 'form',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
					openfluid.inputs.coordxy.windowInput,
                ]
            }]
        };
        var onglet_gml = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Uploader un fichier GML"),
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: v_collapsed5,
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            bodyStyle: { maxHeight: '90px' },
            items: [{
                xtype: 'form',
                //labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
					fileLoadForm
                ]
            }]
        };
		
        noglob_regionContent = new Ext.Panel({ //new Ext.form.Panel({ is not a constructor
                title: OpenLayers.i18n("Résultats text"),
                //frame: true, // TEST
                //closable: false,
                activate: true,
                region: 'south',
                collapsible: true,
                collapsed: false,
                split: true,
                plain: true,
                autoScroll: true,
                bodyStyle: { maxHeight: '90px' },
        });

        // ----------------------------------------------------------------------
        // Window : fields and buttons
        // ----------------------------------------------------------------------
		addRefresh = {};
		var wmsbox = {};
		if (openfluid.inputs.scrollwms.list.length > 0) {	
			addRefresh = 	{ 
					text : 'Rafraichir',
					tooltip:'Rafraichir les couches chargees',
					iconCls: 'arrow_refresh',//'add',
					handler: 
					//----------------------------------------------------------------------
					//Refresh wmsLayers
					//----------------------------------------------------------------------
					
						function() {
							layer_noglob_liste_WFS = [];
							noglob_addComboxFieldItemsWFS();					
							// Create refresh wms inputs
							for (i = 0; i < openfluid.inputs.scrollwms.list.length; i++) {
                                var name_inputs = openfluid.inputs.scrollwms.list[i];
                                openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput = new Ext.form.ComboBox({
								name: "wms",
								fieldLabel: openfluid.inputs.scrollwms[name_inputs].obj.title,
								emptyText: openfluid.inputs.scrollwms[name_inputs].obj.abstract,
								width: FIELD_WIDTH,
								store: new Ext.data.SimpleStore({
									fields: ['text', 'value'],
									data: layer_noglob_liste_WFS
								}),
								forceSelection: true,
								editable: false,
								allowBlank: true,
								triggerAction: 'all',
								mode: 'local',
								valueField: 'value',
								displayField: 'text',
								labelWidth: 200				
							});
							}

							// Remove all WMS inputs in the window
							for (i = 0; i < openfluid.inputs.scrollwms.list.length; i++) {
                                console.log(Ext.getCmp('reportGraphArea'));
								for (var key in Ext.getCmp('reportGraphArea').items.items) { // flag il reste bloque sur les selection scrollwms du premer pas des rafraichis
									if (Ext.getCmp('reportGraphArea').items.items.hasOwnProperty(key)) {
										if (Ext.getCmp('reportGraphArea').items.items[key].name == "wms") { // si en trouve un
											Ext.getCmp('reportGraphArea').remove(Ext.getCmp('reportGraphArea').items.items[key],true); // le retire
										}
									}
								}
							}
							// Add refresh wms inputs
							for (i = 0; i < openfluid.inputs.scrollwms.list.length; i++) {
var name_inputs = openfluid.inputs.scrollwms.list[i];
										Ext.getCmp('reportGraphArea').add(openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput); // ajoute un nouveau
										}

							// Reload window
							noglob_myPanel.hide();  
							noglob_myPanel.show();						
						}
					}
					//----------------------------------------------------------------------
					wmsbox = {
                        closable: true,
                        closeAction: 'hide', //FAIL noglob_myPanel.hide,
                        title: OpenLayers.i18n("Couches WMS"),
                        closable: false,
                        activate: true,
                        collapsible: true,
                        collapsed: v_collapsed0,
                        plain: true,
                        buttonAlign: 'right',
                        autoScroll: true,
                        bodyStyle: { maxHeight: '90px' },
                        tbar:['->', addRefresh], // Pour aligner a droite: tbar:['->', {
                        items: [{
                            xtype: 'form',
                            labelWidth: 200,
                            bodyStyle: "padding:10px;",
                            items: [
                                openfluid.inputs.scrollwms.windowInput
                            ]
                        }],							
					};
				};
        
		noglob_myPanel = new Ext.Window({
            // Config globale
            title: OpenLayers.i18n("addon_wpsmaker_title"),
            closable: true,
            closeAction: 'hide', 
            width: globalWidth*1.3, // auto provoque un bug de largeur sur Chrome
			y: '30px',
			x: '0%',
            iconCls: 'windo_icon',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            items: [
                onglet_scrollWS,
                wmsbox,	
                onglet_scroll,
                onglet_checkbox,
                onglet_param,
                onglet_gml,
                noglob_regionContent
                ],
            // Creation/Ajout des boutons
            fbar: ['->', {
                text: OpenLayers.i18n("Fermer"),
                handler: function() {
                    this.win.hide();
                },
                scope: this
            }, {
                text: OpenLayers.i18n("Aide"),
                handler: function() {
                    window.open(Help_URL);
                },
                scope: this
            }, /*{
                text: OpenLayers.i18n("Métadonnées"),
                handler: function() {
                    window.open(Metadata_URL);
                },
                scope: this
            },*/ {
                text: OpenLayers.i18n("Exécuter"),
                handler: this.ExecuteWps,
                scope: this
            }],
		   noglob_listeners:{
				hide:this.destroy,
				scope:this
			},			
        });	
		return noglob_myPanel;
		
    },
    /** -----------------------------------------------------------------------------
        ExecuteWps
        ----------------------------------------------------------------------------- */
    // Send the input fields in the window
    ExecuteWps: function() {
        mask_loader.show();
		openfluid.inputs.forXmlPost = []; // reset sinon ne peut pas rechoisir
        // ----------------------------------------------------------------------
        // Inputs Param
        // ----------------------------------------------------------------------
		//noglob_tableList_input_forXml = [];
        for (var i = 0; i < openfluid.inputs.param.list.length; i++) { 
            var name_inputs = openfluid.inputs.param.list[i];
            tmpForXml = {
                identifier: name_inputs,
                data: {
                    literalData: {
                        value: openfluid.inputs.param[name_inputs].objForWindowInput.getValue()
                    }
                }
            }
            if (openfluid.inputs.param[name_inputs].objForWindowInput.getValue() != "") {
                openfluid.inputs.forXmlPost.push(tmpForXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs WMS
        // ----------------------------------------------------------------------
		for (var i = 0; i < openfluid.inputs.scrollwms.list.length; i++) { //openfluid.inputs.param['param'+i].objForWindowInput
			// si pas de refresh l'objet est null
            var name_inputs = openfluid.inputs.scrollwms.list[i];
			if (openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput === null) {
				// si vide 
				if (openfluid.inputs.scrollwms[name_inputs].objForWindowInput.getValue() == "") {
					tmpValue = "null"
				}
				// si select
				if (openfluid.inputs.scrollwms[name_inputs].objForWindowInput.getValue() != "") {
					tmpValue = openfluid.inputs.scrollwms[name_inputs].objForWindowInput.getValue().data.WFS_URL + openfluid.inputs.scrollwms[name_inputs].objForWindowInput.getValue().data.WFS_typeName;
				}
			}
			//si refresh
			else if (openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput !== null){
				// si vide 
				if (openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput.getValue() == "") {
					//console.log('refresh - vide')
					tmpValue = "null2";
				}
				// si select
				if (openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput.getValue() != "") {
					tmpValue = openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput.getValue().data.WFS_URL + openfluid.inputs.scrollwms[name_inputs].refreshedObjForWindowInput.getValue().data.WFS_typeName;
				}
			}	
			var tmpforXml = {
				identifier: name_inputs,
				data: {
					literalData: {value: tmpValue}
				}
			}
			openfluid.inputs.forXmlPost.push(tmpforXml);
		}
        // ----------------------------------------------------------------------
        // Inputs Combobox
        // ----------------------------------------------------------------------
        if (openfluid.inputs.scroll.list.length > 0) {
			for (var i = 0; i < openfluid.inputs.scroll.list.length; i++) {
                var name_inputs = openfluid.inputs.scroll.list[i];
                 openfluid.inputs.scroll[name_inputs].objForXml = {
                    identifier: name_inputs,
                    data: {
                        literalData: {
                            value: openfluid.inputs.scroll[name_inputs].objForWindowInput.getValue()
                        }
                    }
                }
				openfluid.inputs.forXmlPost.push(openfluid.inputs.scroll[name_inputs].objForXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs Coordinates
        // ----------------------------------------------------------------------
        if (openfluid.inputs.coordxy.list.length > 0) {
			for (var i = 0; i < openfluid.inputs.coordxy.list.length; i++) {
                var name_inputs = openfluid.inputs.coordxy.list[i];
				openfluid.inputs.coordxy[name_inputs].objForXml = {
					identifier: name_inputs,
					data: {
						literalData: {
							value: openfluid.inputs.coordxy[name_inputs].coordxyStore
						}
					}
				}
				if (openfluid.inputs.coordxy[name_inputs].coordxyStore != null) {
					openfluid.inputs.forXmlPost.push(openfluid.inputs.coordxy[name_inputs].objForXml);
				}
			}
		}
        // ----------------------------------------------------------------------
        // Inputs GML
        // ----------------------------------------------------------------------
        if (openfluid.inputs.gml.list.length > 0) {
            console.log(openfluid.inputs.gml.list.length);
			for (var i = 0; i < openfluid.inputs.gml.list.length; i++) {
                console.log(i);
                var name_inputs = openfluid.inputs.gml.list[i];
				var tmpGMLforXml = {
					identifier: name_inputs,
					data: {
						complexData: {
							value: openfluid.inputs.gml[name_inputs].gmlValue //gmlValue1
						}
					}
				}
                console.log(openfluid.inputs.gml[name_inputs]);
				if (typeof(openfluid.inputs.gml[name_inputs].gmlValue) == "string") {
					openfluid.inputs.forXmlPost.push(tmpGMLforXml);
				}
			}
        }
        // ----------------------------------------------------------------------
        // Inputs Checkbox
        // ----------------------------------------------------------------------
        for (var i = 0; i < openfluid.inputs.checkbox.list.length; i++) {
            var name_inputs = openfluid.inputs.checkbox.list[i];
            var tmpForXml = {
                identifier: name_inputs,
                data: {
                    literalData: {
                        value: openfluid.inputs.checkbox[name_inputs].objForWindowInput.getValue()
                    }
                }
            }
			openfluid.inputs.forXmlPost.push(tmpForXml);
        }
		
        // Test if all fields are filled (except those by default)
        var champs_restant = openfluid.inputs.list.length - openfluid.inputs.forXmlPost.length;
        if (openfluid.inputs.list.length == openfluid.inputs.forXmlPost.length) {

            // ----------------------------------------------------------------------
            // Outputs WMS
            // ----------------------------------------------------------------------
            tableList_output_forXml = [];
            for (var i = 0; i < openfluid.outputs.wms.list.length; i++) {
                var name_outputs = openfluid.outputs.wms.list[i];
                L_output_wms_forXml = {
                    asReference: false,
                    identifier: name_outputs
                };
				openfluid.outputs.forXmlResponse.push(L_output_wms_forXml);
            }

            // ----------------------------------------------------------------------
            // Outputs Param
            // ----------------------------------------------------------------------
			for (var i = 0; i < openfluid.outputs.param.list.length; i++) {
                var name_outputs = openfluid.outputs.param.list[i];
                L_output_param_forXml = {
                    asReference: false,
                    identifier: name_outputs
                }; 
				openfluid.outputs.forXmlResponse.push(L_output_param_forXml);
			}
            // ----------------------------------------------------------------------
            // Sends the query
            // ----------------------------------------------------------------------
            console.log("Une requête XML a été envoyée : ");

            var wpsFormat = new OpenLayers.Format.WPSExecute();
            // Creation de la requete XML
            var xmlString = wpsFormat.write({
                identifier: WPS_identifier,
                dataInputs: openfluid.inputs.forXmlPost, //noglob_tableList_input_forXml,
                responseForm: {
                    responseDocument: {
                        storeExecuteResponse: true,
                        lineage: false,
                        status: false,
                        outputs: openfluid.outputs.forXmlResponse
                    }
                }
            });

            if (noglob_execute_on_off == 0) {
                noglob_execute_on_off = 1;
                OpenLayers.Request.POST({
                    url: WPS_URL, // var contenant l'adresse recuperee auparavant dans le manifest.json
                    data: xmlString,
                    success: this.onExecuted,
                    failure: this.onError
                });
            }
        }
		else {
            mask_loader.hide();
            GEOR.util.infoDialog({
                msg: "Veuillez remplir tous les champs requis (il en reste " + champs_restant + ")."
            });
        }
        this.win.hide();
    },

    /** -----------------------------------------------------------------------------
        onExecuted
        ----------------------------------------------------------------------------- */
    onExecuted: function(resp) {
        mask_loader.hide();
        var getStatusExecute = function(dom) {
            var test = (dom[0].firstElementChild || dom[0].firstChild);
            return (test.nodeName == "wps:ProcessSucceeded") ? "success" : "fail";
        };
        var wpsNS = "http://www.opengis.net/wps/1.0.0";
        var owsNS = "http://www.opengis.net/ows/1.1";
        var format = new OpenLayers.Format.XML();
        var dom = format.read(resp.responseText);
        var domStatus = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(dom, "http://www.opengis.net/wps/1.0.0", "Status");
        if (getStatusExecute(domStatus) === "success") {
            // procOutputsDom Contient tout les objets
            var procOutputsDom = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(dom, wpsNS, "ProcessOutputs"); 

            // Stocke les objets outputs dans outputs, s'ils existent (length)
            var outputs = null; // Initialise la variable
            if (procOutputsDom.length) {
                outputs = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(procOutputsDom[0], wpsNS, "Output");
            } // La var outputs contient tout les objets outputs
            for (var i = 0; i < openfluid.outputs.list.length; i++) { // Invariable
                var identifier = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], owsNS, "Identifier")[0].firstChild.nodeValue; 
                var literalData = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], wpsNS, "LiteralData"); 
                // ----------------------------------------------------------------------
                // Outputs WMS 
                // ----------------------------------------------------------------------
				for (var j = 0; j < openfluid.outputs.wms.list.length; j++) {
                    var name_outputs = openfluid.outputs.wms.list[j];
                // Recover data from the output sent by the WPS server
					if (identifier == name_outputs) {
						openfluid.outputs.wms.addWms(name_outputs,literalData[0].firstChild.nodeValue);
					}
				}
				
                // ----------------------------------------------------------------------
                // Outputs Param 
                // ----------------------------------------------------------------------
                for (var k = 0; k < openfluid.outputs.param.list.length; k++) {
                    var name_outputs = openfluid.outputs.param.list[k];
					if (identifier == name_outputs) { // flag prob avec le i, peut etre en redondance car deja un i dans la boucle ??,
						openfluid.outputs.param.addParam(name_outputs,literalData[0].firstChild.nodeValue);
					}
					noglob_execute_on_off = 0; // Limite le nombre de process wps a la fois
				}
			}	
        }
        // ----------------------------------------------------------------------
        // Add WMS layer 
        // ----------------------------------------------------------------------
		
        // PART 1 : Load wms layer from recovered data	
        GEOR.waiter.show(); // Barre bleu de chargement      

        // Dynamic variabls
        var layerUrlparse = [];
        var layerNameparse = [];
        var wmsdyn = [];
        var c = [];
        var layerRecord = [];
        var clone_layer = [];
        var mapforzoom = [];
        var llbbox = [];

        if (openfluid.outputs.wms.list.length >= 1) {
            // Add wms outputs layers dynamicly
            for (i = 0; i < openfluid.outputs.wms.list.length; i++) {
                var name_outputs = openfluid.outputs.wms.list[i]; 
                    layerUrlparse[i] = openfluid.outputs.wms[name_outputs].wmsValue.substr(0, openfluid.outputs.wms[name_outputs].wmsValue.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
                    layerNameparse[i] = openfluid.outputs.wms[name_outputs].wmsValue.substring(openfluid.outputs.wms[name_outputs].wmsValue.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 

                    console.log("Une couche WMS a été ajoutée :");
                    console.log(" - URL : " + layerUrlparse[i]);
                    console.log(" - Nom : " + layerNameparse[i]); //console.log("    - Entrepot :"+entrepotName);		

                // PART 2 : Ajout du WMS	
                    wmsdyn[i] = new OpenLayers.Layer.WMS(name_outputs,
                            layerUrlparse[i], 
                            {'layers': layerNameparse[i],transparent: true} //, transparent: true, format: 'image/gif'
                            //,{isBaseLayer: true}
                            );

                    c[i] = GEOR.util.createRecordType();

                    layerRecord[i] = new c[i]({
                        layer: wmsdyn[i],
                        name: layerNameparse[i], 
                        type: "WMS"
                    });

                    clone_layer[i] = layerRecord[i].clone(); 
                    clone_layer[i].get("layer").setName(layerNameparse[i]);
                    layerStore.addSorted(clone_layer[i]);
            }
            // Zoom sur le premier wms charge

            /**
             * Method: zoomToLayerRecordExtent from GEOR.managelayers
             *
             * Parameters:
             * r - {GeoExt.data.LayerRecord}
             */
            var zoomToLayerRecordExtent = function(r) {
                var map = r.get('layer').map,
                    mapSRS = map.getProjection(),
                    zoomed = false,
                    bb = r.get('bbox');

                for (var key in bb) {
                    if (!bb.hasOwnProperty(key)) {
                        continue;
                    }
                    if (key === mapSRS) {
                        map.zoomToExtent(
                            OpenLayers.Bounds.fromArray(bb[key].bbox)
                        );
                        zoomed = true;
                        break;
                    }
                }
                if (!zoomed) {
                    // use llbbox
                    var llbbox = OpenLayers.Bounds.fromArray(
                        r.get('llbbox')
                    );
                    llbbox.transform(
                        new OpenLayers.Projection('EPSG:4326'),
                        map.getProjectionObject()
                    );
                    map.zoomToExtent(llbbox);
                }
            };
            
            var first_layer_r = clone_layer[0]
            
            // Get it from the WMS GetCapabilities document
            GEOR.ows.hydrateLayerRecord(first_layer_r, {
                success: function() {
                    zoomToLayerRecordExtent(first_layer_r);
                },
                failure: function() {
                    GEOR.util.errorDialog({
                        msg: tr("Impossible to get layer extent")
                    });
                },
            scope: this
            });
        }
		
        // ----------------------------------------------------------------------
        // Display all wps text outputs (L_output_param) on panel
        // ----------------------------------------------------------------------		
        var TextOut = [];
        for (var i = 0; i < openfluid.outputs.param.list.length; i++) {
            var name_outputs = openfluid.outputs.param.list[i]; 
            var num = i+1;
            var n = num.toString(); 
			TextOut[i] = '<br>' + n +' - ' + openfluid.outputs.param[name_outputs].paramValue.replace(/(\r\n|\n|\r)/gm,"<br>") + '<br>';
        }
        noglob_regionContent.update(TextOut);
        noglob_myPanel.show();
        GEOR.waiter.hide();
        // ----------------------------------------------------------------------
        // WMC
        // ----------------------------------------------------------------------
		setTimeout(function() { // la fonction se declence 20 seconde apres ?
			// Creation du WMC vierge
			var parserWMC = new OpenLayers.Format.WMC({
                layerOptions: {
                    // to prevent automatic restoring of PNG rather than JPEG:
                    noMagic: true
                }
            });
			// Create WMC
			var writeWMC = parserWMC.write(this.map);
			// Set wms to queryable
			var writeWMCbis = writeWMC.replace('</Extension></Layer><Layer queryable="0"', '</Extension></Layer><Layer queryable="1"');
			var writeWMCbis1 = writeWMCbis.replace(/General.*General/, 'General><Window width="1293" height="765" /><BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title /><Extension>  <ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-357823.236499999999" miny="5037008.69390000030" maxx="1313632.36280000000" maxy="7230727.37710000016" /></Extension></General');
			
			layerStore2 = Ext.getCmp("mappanel").layers;	
			var huhu6 = GEOR.wmc.write(layerStore2); //  ok
		},20250);
    },

    /** -----------------------------------------------------------------------------
        onError
        ----------------------------------------------------------------------------- */
    onError: function(process) {
        mask_loader.hide();
        GEOR.util.infoDialog({
            msg: "Echec dans l'execution du processus !<br>\n" + "Raison : " + process.exception.text
        });
    },

    /** -----------------------------------------------------------------------------
        showWindow
        ----------------------------------------------------------------------------- */
    showWindow: function() {
        if (!this.win) {
			this.win = this.createWindow();		
        }
        this.win.show();
    },

    /** -----------------------------------------------------------------------------
        destroy
        ----------------------------------------------------------------------------- */
    destroy: function() {
        this.win.hide();
        this.map = null;
		//console.log('hide');
    },

};