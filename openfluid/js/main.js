Ext.namespace("GEOR.Addons");

var openfluid = {
	inputs : {
		list : [],
		forXmlPost : [],
		scroll : {
			list : [],
			addScroll : function(addScrollID,addObj) {
				openfluid.inputs.scroll["scroll"+addScrollID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.scroll["scroll"+addScrollID].obj = addObj;
				openfluid.inputs.scroll["scroll"+addScrollID].objForWindowInput = null;
			}
		},
		checkbox : {
			list : [],
			addCheckbox : function(addCheckboxID,addObj) {
				openfluid.inputs.checkbox["checkbox"+addCheckboxID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.checkbox["checkbox"+addCheckboxID].obj = addObj;
				openfluid.inputs.checkbox["checkbox"+addCheckboxID].objForWindowInput = null;
			}
		},
		param : {
			list : [],
			addParam : function(addParamID,addObj) {
				openfluid.inputs.param["param"+addParamID] = {obj : null} // ["param"+addParam] for dynamic var obj
				openfluid.inputs.param["param"+addParamID].obj = addObj;
				openfluid.inputs.param["param"+addParamID].objForWindowInput = null;
			}
		},
		coordxy : {
			list : [],
			addCoordxy : function(Coordxy,addObj) {
				openfluid.inputs.coordxy["coordxy"+Coordxy] = {obj : null} 
				openfluid.inputs.coordxy["coordxy"+Coordxy].obj = addObj;
				openfluid.inputs.coordxy["coordxy"+Coordxy].objForWindowInput = null;
				openfluid.inputs.coordxy["coordxy"+Coordxy].coordxyStore = null;
			}
		},
		scrollwms : {
			list : [],
			addScrollwms : function(Scrollwms,addObj) {
				openfluid.inputs.scrollwms["scrollwms"+Scrollwms] = {obj : null} 
				openfluid.inputs.scrollwms["scrollwms"+Scrollwms].obj = addObj;
				openfluid.inputs.scrollwms["scrollwms"+Scrollwms].objForWindowInput = null;
				openfluid.inputs.scrollwms["scrollwms"+Scrollwms].scrollwms = null;
				openfluid.inputs.scrollwms["scrollwms"+Scrollwms].refreshedObjForWindowInput = null;
			},
		},
		gml : {
			list : [],
			addGml : function(Gml,addObj) {
				openfluid.inputs.gml["gml"+Gml] = {obj : null} 
				openfluid.inputs.gml["gml"+Gml].obj = addObj;
				openfluid.inputs.gml["gml"+Gml].objForWindowInput = null;
				openfluid.inputs.gml["gml"+Gml].gmlValue = null;
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
		},
		wms : {
			list : [],
			addWms : function(addWmsID,addObj) {
				openfluid.outputs.wms["wms"+addWmsID] = {wmsValue : null} // ["param"+addParam] for dynamic var obj
				openfluid.outputs.wms["wms"+addWmsID].wmsValue = addObj;
				openfluid.outputs.wms["wms"+addWmsID].wmsdyn = null;
				openfluid.outputs.wms["wms"+addWmsID].layerclone = null;
				openfluid.outputs.wms["wms"+addWmsID].name = null;
				openfluid.outputs.wms["wms"+addWmsID].layer = null;
				openfluid.outputs.wms["wms"+addWmsID].cReccord = null;
				openfluid.outputs.wms["wms"+addWmsID].lReccord = null;
				openfluid.outputs.wms["wms"+addWmsID].clone = null;
			}
		}
	}
}

var noglob_execute_on_off = 0;
var noglob_regionContent = "";
var noglob_myPanel = "";
var noglob_liste = "";

GEOR.Addons.openfluid = function(map, options) {
    this.map = map;
    this.options = options;
};

GEOR.Addons.openfluid.prototype = {
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
    /** -----------------------------------------------------------------------------
        Describe process    	
        ----------------------------------------------------------------------------- */
    describeProcess: function(url, identifier) {
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
                var wpsProcess = new OpenLayers.Format.WPSDescribeProcess().read(response.responseText).processDescriptions[identifier]; // wpsProcess = [object Object] //console.log ("wpsProcess = "+wpsProcess) ; // console.log("wpsProcess.dataInputs = "+wpsProcess.dataInputs)
                console.log(wpsProcess);

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
                console.log("Le WPS utilise " + openfluid.inputs.list.length + " input(s) : " + openfluid.inputs.list);
                console.log("    - " + openfluid.inputs.param.list.length + " input(s) de paramètre : " + openfluid.inputs.param.list);
                console.log("    - " + openfluid.inputs.scrollwms.list.length + " input(s) de WMS : " + openfluid.inputs.scrollwms.list);
                console.log("    - " + openfluid.inputs.scroll.list.length + " input(s) de scroll : " + openfluid.inputs.scroll.list);
                console.log("    - " + openfluid.inputs.coordxy.list.length + " input(s) de coordonnées xy : " + openfluid.inputs.coordxy.list);
                console.log("    - " + openfluid.inputs.gml.list.length + " input(s) de gml : " + openfluid.inputs.gml.list);
				console.log("    - " + openfluid.inputs.checkbox.list.length + " input(s) de checkbox : " + openfluid.inputs.checkbox.list);
				
				
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
                console.log("Le WPS retourne " + openfluid.outputs.list.length + " output(s) : " + openfluid.outputs.list);
                console.log("    - " + openfluid.outputs.param.list.length + " output(s) de paramètre : " + openfluid.outputs.param.list);
                console.log("    - " + openfluid.outputs.wms.list.length + " output(s) de wms : " + openfluid.outputs.wms.list);

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
	    for (i = 1; i <= openfluid.inputs.param.list.length; i++) {	 
			openfluid.inputs.param.addParam(i,findDataInputsByIdentifier(process.dataInputs, "L_input_param"+i));
		}
		
        // ----------------------------------------------------------------------
        // Data input WMS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WMS input WMS -- openfluid.inputs.scrollwms.list
		for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) {
            openfluid.inputs.scrollwms.addScrollwms(i,findDataInputsByIdentifier(process.dataInputs, "L_input_wms"+i));
		}

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        for (i = 1; i <= openfluid.inputs.scroll.list.length; i++) {
			openfluid.inputs.scroll.addScroll(i,findDataInputsByIdentifier(process.dataInputs, "L_input_scroll"+i));
			trashArray = [];
            for (var k in openfluid.inputs.scroll["scroll"+i].obj.literalData.allowedValues) {
					trashArray.push(k);
            }
			openfluid.inputs.scroll["scroll"+i].obj.literalData.allowedValues.list = [];
			openfluid.inputs.scroll["scroll"+i].obj.literalData.allowedValues.list = trashArray;
        }
		
        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
		for (i = 1; i <= openfluid.inputs.coordxy.list.length; i++) {
            openfluid.inputs.coordxy.addCoordxy(i,findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy"+i));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs Checkbox 
        // ----------------------------------------------------------------------		
	    for (i = 1; i <= openfluid.inputs.checkbox.list.length; i++) {	 
			openfluid.inputs.checkbox.addCheckbox(i,findDataInputsByIdentifier(process.dataInputs, "L_input_checkbox"+i));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs GML 
        // ----------------------------------------------------------------------		
	    for (i = 1; i <= openfluid.inputs.gml.list.length; i++) {	 
			openfluid.inputs.gml.addGml(i,findDataInputsByIdentifier(process.dataInputs, "C_input_gml"+i));
		}
		
        this.wpsInitialized = true;
    },
    /** -----------------------------------------------------------------------------
            Input window 	
            ----------------------------------------------------------------------------- */
    createWindow: function() {
		//noglob_table_input_param = [];
        // ----------------------------------------------------------------------
        // Parameter inputs
        // ----------------------------------------------------------------------
		openfluid.inputs.param.windowInput = [];
		var noglob_table_input_param_splitPanel1 = [];
		var noglob_table_input_param_splitPanel2 = [];
		for (i = 1; i <= openfluid.inputs.param.list.length; i++) {
            openfluid.inputs.param['param'+i].objForWindowInput = new Ext.form.TextField({ //this.champ_pour_input_param1 = new Ext.form.TextField({
                fieldLabel: openfluid.inputs.param['param'+i].obj.title,//wps_Config_param1.input_param1_fromPython.title,
                name: "uselessname"+i,
                width: 40,
                /*maxValue: 298,
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                //value: 'test',//value: wps_Config_param1.input_param1_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            //noglob_table_input_param.push(openfluid.inputs.param['param'+i].objForWindowInput);
			openfluid.inputs.param.windowInput.push(openfluid.inputs.param['param'+i].objForWindowInput);
        }
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
            html: '<img src="http://91.121.171.75/grey_warn.png"> Seuls les WMS déjà chargés avant la première ouverture de l\'addon seront utilisables.'
        };

        
		tmpStore = new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
					//,storeId: 'myStore'
                });
		// PART 2
		for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) {
        //if (openfluid.inputs.scrollwms.list.length >= 1) {
            FIELD_WIDTH = 60, 
                base = {
                    forceSelection: true,
                    editable: true,
                    allowBlank: true,
                    triggerAction: 'all',
                    mode: 'local',
                    labelSeparator: OpenLayers.i18n("labelSeparator"),
                    valueField: 'value',
                    displayField: 'text',
                    labelWidth: 10
					//,lastQuery: ''
                };

			openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput =	new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: openfluid.inputs.scrollwms['scrollwms'+i].obj.title,
                emptyText: openfluid.inputs.scrollwms['scrollwms'+i].obj.abstract,
                width: FIELD_WIDTH,
                store: tmpStore,
				listeners: {
					'beforequery': function() { // beforequery : Quand clic sur combobox
							   //console.log('beforequery');
						 },
					'beforerender': function() { // beforerender est juste au moment d ouvrir la fenetre avant qu elle saffiche
							   //console.log('beforerender');
						 },
					'select': function(combo, records, eOpts) { // select : quand a choisi un champ de la cbbox
						//console.log('select');
					}
				}				
            }, base));
			openfluid.inputs.scrollwms.windowInput.push(openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput);
        }
        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
		openfluid.inputs.scroll.windowInput = [];
		for (i = 1; i <= openfluid.inputs.scroll.list.length; i++) {
            base = {
                forceSelection: true,
                editable: true,
                allowBlank: true,
                triggerAction: 'all',
                mode: 'local',
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                valueField: 'value',
                displayField: 'text',
                labelWidth: 10
                };
			openfluid.inputs.scroll['scroll'+i].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
				width: 125, // line 1203
				fieldLabel:openfluid.inputs.scroll['scroll'+i].obj.title, 
				name:'division',
                value: openfluid.inputs.scroll['scroll'+i].obj.literalData.allowedValues.list[0],
				store: openfluid.inputs.scroll['scroll'+i].obj.literalData.allowedValues.list,
				editable: false,
				triggerAction:'all',
						}, base));	
			openfluid.inputs.scroll.windowInput.push(openfluid.inputs.scroll['scroll'+i].objForWindowInput);
        }
        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
		openfluid.inputs.gml.windowInput = [];
        if (openfluid.inputs.gml.list.length >= 1) {
		//for (i = 1; i <= openfluid.inputs.gml.list.length; i++) {
            tmpwindowgml = {
				idgml: 'gml1',
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
				//buttonOnly: true,
                buttonText: '',
                listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
							openfluid.inputs.gml[tmpwindowgml.idgml].gmlValue = e.target.result; // flag : i undefined
                            if (myfilename.search('.gml') != -1) {} else {
                                GEOR.util.errorDialog({
                                    title: "Erreur de format",
                                    msg: "Veuillez choisir un format GML."
                                });
                            }
                        };
                        reader.readAsText(file, "UTF-8");
                    }
                }
            };
			openfluid.inputs.gml.windowInput.push(tmpwindowgml);
        }

        // PART 2 GML Window
        var fileWindow;
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: true,
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                openfluid.inputs.gml.windowInput,
            ]
        });

        fileWindow = new Ext.Window({
            closable: true,
            width: 320,
            title: "Parcourir",
            border: false,
            plain: true,
            region: 'center',
            items: [fileLoadForm]
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
					for (i = 1; i <= openfluid.inputs.coordxy.list.length; i++) {
						//if (log_coord == i) {
							openfluid.inputs.coordxy["coordxy"+i].coordxyStore = lonlat.lat; 
							alert("Input 1 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
							log_coord = 0;
						//}
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
		for (i = 1; i <= openfluid.inputs.coordxy.list.length; i++) {
            openfluid.inputs.coordxy['coordxy'+i].objForWindowInput = new Ext.Button({
                iconCls: 'add_icon',
                text: openfluid.inputs.coordxy['coordxy'+i].obj.title, //OpenLayers.i18n(noglob_coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = i;
                },
                scope: this
            });
			openfluid.inputs.coordxy.windowInput.push(openfluid.inputs.coordxy['coordxy'+i].objForWindowInput);
		}
		
        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
		openfluid.inputs.checkbox.windowInput = [];
		for (i = 1; i <= openfluid.inputs.checkbox.list.length; i++) {
			openfluid.inputs.checkbox['checkbox'+i].objForWindowInput = new Ext.form.Checkbox({ // flag
					//boxLabel: noglob_checkboxTitle[i-1],
					id: 'checkbox'+i,
					width: 150,
					xtype: 'checkbox',
					fieldLabel: openfluid.inputs.checkbox['checkbox'+i].obj.title,
					checked: true
            });
			openfluid.inputs.checkbox.windowInput.push(openfluid.inputs.checkbox['checkbox'+i].objForWindowInput);
			/*
			if (i <= 6) {
			//noglob_table_input_param.push(openfluid.inputs.checkbox['checkbox'+i].objForWindowInput);
			openfluid.inputs.scroll.windowInput.push(openfluid.inputs.checkbox['checkbox'+i].objForWindowInput);
			}
			else {
			noglob_table_input_param_splitPanel2.push(openfluid.inputs.checkbox['checkbox'+i].objForWindowInput);
			}
			*/
		}
        // ----------------------------------------------------------------------
        // Tab (in progress)
        // ----------------------------------------------------------------------		
        var onglet2 = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("Selectionner les indicateurs "),
            //width: globalWidth*1.3, // auto provoque un bug de largeur sur Chrome
			//height:Ext.getBody().getViewSize().height - 123,//62,
			//y: '90px',//'31px', 
			//x: '0%',
            //iconCls: 'windo_icon',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true, 
            items: [{
                xtype: 'form',
				id : 'reportGraphArea2',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
				openfluid.inputs.param.windowInput,
					openfluid.inputs.scroll.windowInput,
					openfluid.inputs.checkbox.windowInput,
					openfluid.inputs.coordxy.windowInput,
					fileLoadForm

                ]
            }]
        };

        var onglet3 = {
            title: OpenLayers.i18n("Selectionner les indicateurs a calculer sur le reseau hydrographique "),
            closable: false,
            activate: true,
            region: 'south',
            collapsible: true,
            collapsed: false,
            split: true,
            items: [{
                xtype: 'form',
                autoWidth: true,
                labelWidth: 300,
                padding: 10,
                bodyStyle: "padding:10px;",
				layout:'column', 
                items: [noglob_table_input_param_splitPanel2]
            }]
        };
		
    noglob_regionContent = new Ext.Panel({ //new Ext.form.Panel({ is not a constructor
            title: OpenLayers.i18n(""),
            //frame: true, // TEST
			//closable: false,
            activate: true,
            region: 'south',
            collapsible: true,
            collapsed: false,
            split: true,
            /*items: [{
                xtype: 'form',
                autoWidth: true,
                labelWidth: 300,
                padding: 10,
                bodyStyle: "padding:10px;",
				layout:'column', 
                items: []}],
			*/
        //html: ''//'this is the <b>original</b> content'			
    });
	

	
        // ----------------------------------------------------------------------
        // Window : fields and buttons
        // ----------------------------------------------------------------------
		addRefresh = {};
		wmsbox = {};
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
							for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) {
							openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput = new Ext.form.ComboBox({
								name: "wms",
								fieldLabel: openfluid.inputs.scrollwms["scrollwms"+i].obj.title,
								emptyText: openfluid.inputs.scrollwms["scrollwms"+i].obj.abstract,
								width: 60,
								store: new Ext.data.SimpleStore({
									fields: ['text', 'value'],
									data: layer_noglob_liste_WFS
								}),
								forceSelection: true,
								editable: true,
								allowBlank: true,
								triggerAction: 'all',
								mode: 'local',
								valueField: 'value',
								displayField: 'text',
								labelWidth: 10				
							});
							}

							// Remove all WMS inputs in the window
							for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) {
								for (var key in Ext.getCmp('reportGraphArea').items.items) { // flag il reste bloque sur les selection scrollwms du premer pas des rafraichis
                                                            
console.log(Ext.getCmp('reportGraphArea'));
									if (Ext.getCmp('reportGraphArea').items.items.hasOwnProperty(key)) {
										if (Ext.getCmp('reportGraphArea').items.items[key].name == "wms") { // si en trouve un
											Ext.getCmp('reportGraphArea').remove(Ext.getCmp('reportGraphArea').items.items[key],true); // le retire
										}
									}
								}
							}
							// Add refresh wms inputs
							for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) {
										Ext.getCmp('reportGraphArea').add(openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput); // ajoute un nouveau
										}

							// Reload window
							noglob_myPanel.hide();  
							noglob_myPanel.show();						
						}
					}
					//----------------------------------------------------------------------
					wmsbox = {
                xtype: 'form',
				id : 'reportGraphArea',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
					openfluid.inputs.scrollwms.windowInput
					//,openfluid.inputs.param.windowInput,
					//openfluid.inputs.scroll.windowInput,
					//openfluid.inputs.checkbox.windowInput,
					//openfluid.inputs.coordxy.windowInput,
					//fileLoadForm
                ],		
				tbar:[addRefresh], // Pour aligner a droite: tbar:['->', {					
					};
				};
        
		noglob_myPanel = new Ext.Window({
            // Config globale
            title: OpenLayers.i18n("addon_wpsmaker_title"),
            closable: true,
            closeAction: 'hide', 
            width: globalWidth*1.3, // auto provoque un bug de largeur sur Chrome
			height:Ext.getBody().getViewSize().height - 123,//62,
			y: '90px',//'31px', 
			x: '0%',
            iconCls: 'windo_icon',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            items: [
			wmsbox,	
			onglet2,//onglet3,
			noglob_regionContent,
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
            }, {
                text: OpenLayers.i18n("Métadonnées"),
                handler: function() {
                    window.open(Metadata_URL);
                },
                scope: this
            }, {
                text: OpenLayers.i18n("Exécuter"),
                handler: this.ExecuteWpsTimer,
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
        ExecuteWpsTimer 	
        ----------------------------------------------------------------------------- */
    // Send the input fields in the window
    ExecuteWpsTimer: function() {
        mask_loader.show();
		openfluid.inputs.forXmlPost = []; // reset sinon ne peut pas rechoisir
        // ----------------------------------------------------------------------
        // Inputs Param
        // ----------------------------------------------------------------------
		//noglob_tableList_input_forXml = [];
        for (i = 1; i <= openfluid.inputs.param.list.length; i++) { 
            tmpForXml = {
                identifier: "L_input_param"+i,
                data: {
                    literalData: {
                        value: openfluid.inputs.param['param'+i].objForWindowInput.getValue()
                    }
                }
            }
            //noglob_tableList_input_forXml.push(tmpForXml);
				if (openfluid.inputs.param['param'+i].objForWindowInput.getValue() != "") {
					openfluid.inputs.forXmlPost.push(tmpForXml);
				}
			
        }
        // ----------------------------------------------------------------------
        // Inputs WMS
        // ----------------------------------------------------------------------
		for (i = 1; i <= openfluid.inputs.scrollwms.list.length; i++) { //openfluid.inputs.param['param'+i].objForWindowInput
			// si pas de refresh l'objet est null
			if (openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput === null) {
				// si vide 
				if (openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue() == "") {
					//console.log('pas de refresh - vide')
					tmpValue = "null"
				}
				// si select
				if (openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue() != "") {
					//console.log('pas de resresh - non vide')
					tmpValue = openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue().data.WFS_URL + openfluid.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue().data.WFS_typeName;
				}
			}
			//si refresh
			else if (openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput !== null){
				// si vide 
				if (openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput.getValue() == "") {
					//console.log('refresh - vide')
					tmpValue = "null2";
				}
				// si select
				if (openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput.getValue() != "") {
					//console.log('resresh - non vide')
					tmpValue = openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput.getValue().data.WFS_URL + openfluid.inputs.scrollwms["scrollwms"+i].refreshedObjForWindowInput.getValue().data.WFS_typeName;
				}
			}
					
			var tmpforXml = {
				identifier: "L_input_wms"+i,
				data: {
					literalData: {value: tmpValue}
				}
			}
			openfluid.inputs.forXmlPost.push(tmpforXml);
		}
        // ----------------------------------------------------------------------
        // Inputs Combobox
        // ----------------------------------------------------------------------
        if (openfluid.inputs.scroll.list.length >= 0) {
			for (i = 1; i <= openfluid.inputs.scroll.list.length; i++) {
                 openfluid.inputs.scroll['scroll'+i].objForXml = {
                    identifier: "L_input_scroll"+i,
                    data: {
                        literalData: {
                            value: openfluid.inputs.scroll['scroll'+i].objForWindowInput.getValue()
                        }
                    }
                }
				openfluid.inputs.forXmlPost.push(openfluid.inputs.scroll['scroll'+i].objForXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs Coordinates
        // ----------------------------------------------------------------------
        if (openfluid.inputs.coordxy.list.length >= 0) {
			for (i = 1; i <= openfluid.inputs.coordxy.list.length; i++) {
				openfluid.inputs.coordxy['coordxy'+i].objForXml = {
					identifier: "L_input_coordxy"+i,
					data: {
						literalData: {
							value: openfluid.inputs.coordxy["coordxy"+i].coordxyStore
						}
					}
				}
				if (openfluid.inputs.coordxy["coordxy"+i].coordxyStore != null) {
					openfluid.inputs.forXmlPost.push(openfluid.inputs.coordxy['coordxy'+i].objForXml);
				}
			}
		}
        // ----------------------------------------------------------------------
        // Inputs GML
        // ----------------------------------------------------------------------
        if (openfluid.inputs.gml.list.length >= 1) {
			for (i = 1; i <= openfluid.inputs.gml.list.length; i++) {
				//console.log(gmlValue1);
				var tmpGMLforXml = {
					identifier: "C_input_gml"+i,
					data: {
						complexData: {
							value: openfluid.inputs.gml['gml'+i].gmlValue //gmlValue1
						}
					}
				}
				if (typeof(openfluid.inputs.gml['gml'+i].gmlValue) == "string") {
					openfluid.inputs.forXmlPost.push(tmpGMLforXml);
				}
			}
        }
        // ----------------------------------------------------------------------
        // Inputs Checkbox
        // ----------------------------------------------------------------------
        for (i = 1; i <= openfluid.inputs.checkbox.list.length; i++) {
            tmpForXml = {
                identifier: "L_input_checkbox"+i,
                data: {
                    literalData: {
                        value: openfluid.inputs.checkbox['checkbox'+i].objForWindowInput.getValue()
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
            for (i = 1; i <= openfluid.outputs.wms.list.length; i++) {
                L_output_wms_forXml = {
                    asReference: false,
                    identifier: "L_output_wms"+i
                };
				openfluid.outputs.forXmlResponse.push(L_output_wms_forXml);
            }

            // ----------------------------------------------------------------------
            // Outputs Param
            // ----------------------------------------------------------------------
			for (i = 1; i <= openfluid.outputs.param.list.length; i++) {
                L_output_param1_forXml = {
                    asReference: false,
                    identifier: "L_output_param"+i
                }; 
                //tableList_output_forXml.push(L_output_param1_forXml); 
				openfluid.outputs.forXmlResponse.push(L_output_param1_forXml);
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
                        outputs: //[
                            //tableList_output_forXml
							openfluid.outputs.forXmlResponse
                    }
                }
            });
            //console.log(xmlString);

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
				for (outputKeyWms = 1; outputKeyWms <= openfluid.outputs.wms.list.length; outputKeyWms++) {
                // Recover data from the output sent by the PyWPS server
					if (identifier == "L_output_wms"+outputKeyWms) {
						openfluid.outputs.wms.addWms(outputKeyWms,literalData[0].firstChild.nodeValue);
					}
				}
				
                // ----------------------------------------------------------------------
                // Outputs Param 
                // ----------------------------------------------------------------------
                for (outputKeyParam = 1; outputKeyParam <= openfluid.outputs.param.list.length; outputKeyParam++) {
					if (identifier == "L_output_param"+outputKeyParam) { // flag prob avec le i, peut etre en redondance car deja un i dans la boucle ??,
						client_L_output_param1 = literalData[0].firstChild.nodeValue;
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
        if (openfluid.outputs.wms.list.length >= 1) { // et si non vide	
            // client_L_output_wms1 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse = openfluid.outputs.wms['wms'+1].wmsValue.substring(openfluid.outputs.wms['wms'+1].wmsValue.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse = openfluid.outputs.wms['wms'+1].wmsValue.substr(0, openfluid.outputs.wms['wms'+1].wmsValue.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse);
            console.log("    - Nom : " + layerNameparse); //console.log("    - Entrepot :"+entrepotName);		
			
        // PART 2 : Ajout du WMS	
			var wmsdyn = new OpenLayers.Layer.WMS("wms1",
					layerUrlparse, 
					{'layers': layerNameparse,transparent: true} //, transparent: true, format: 'image/gif'
					//,{isBaseLayer: true}
				);
			
            var c = GEOR.util.createRecordType();
            var layerRecord = new c({
                layer: wmsdyn,
                name: layerNameparse, 
                type: "WMS"
            });
            var clone = layerRecord.clone();

            GEOR.ows.hydrateLayerRecord(clone, {
                success: function() {
                    clone.get("layer").setName(clone.get("title"));
                    layerStore.addSorted(clone);

					
		// PART 2.2 : Zoom sur le premier wms charge
					var mapforzoom = clone.get('layer').map ; 
					bb = clone.get('bbox');											
					//GOOD mapforzoom.zoomToExtent(bboxlol); // ATTENTION a lui donner un array et pas un string ("","","","") exemple : var bboxlol = ["372528","5385155","374112","5386725"];					
					var llbbox = OpenLayers.Bounds.fromArray(clone.get('llbbox')); 
					var getproj = mapforzoom.getProjectionObject(); 
					llbbox.transform(new OpenLayers.Projection('EPSG:4326'), getproj);
					map.zoomToExtent(llbbox);					

					
                    //GEOR.waiter.hide();
                },
                failure: function() {
                    GEOR.util.errorDialog({
                        msg: "Impossible d'obtenir les informations de la couche !"

                    });
                    GEOR.waiter.hide();
                },
                scope: this
            });
			
        }

        if (openfluid.outputs.wms.list.length >= 2) {	
            // http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse2 = openfluid.outputs.wms['wms'+2].wmsValue.substring(openfluid.outputs.wms['wms'+2].wmsValue.indexOf('?') + 1); // cseb:vue_d_ensemble2 
            var layerUrlparse2 = openfluid.outputs.wms['wms'+2].wmsValue.substr(0, openfluid.outputs.wms['wms'+2].wmsValue.indexOf('?')); // http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse2);
            console.log("    - Nom : " + layerNameparse2); 		
			
        // PART 2 : Ajout du WMS	
			var wmsdyn2 = new OpenLayers.Layer.WMS("wms2",
					layerUrlparse2, 
					{'layers': layerNameparse2,transparent: true} //, transparent: true, format: 'image/gif'
					//,{isBaseLayer: true}
				);
            var c2 = GEOR.util.createRecordType();
            var layerRecord2 = new c2({
                layer: wmsdyn2,
                name: layerNameparse2, 
                type: "WMS"
            });
            var clone2 = layerRecord2.clone();
            GEOR.ows.hydrateLayerRecord(clone2, {
                success: function() {
                    clone2.get("layer").setName(clone2.get("title"));
                    layerStore.addSorted(clone2);
                    //zoomToLayerRecExtent(clone2);
                    //GEOR.waiter.hide();
                },
                failure: function() {
                    GEOR.util.errorDialog({
                        msg: "Impossible d'obtenir les informations de la couche !"

                    });
                    GEOR.waiter.hide();
                },
                scope: this
            });
        }

        if (openfluid.outputs.wms.list.length >= 3) {	
            // http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse3 = openfluid.outputs.wms['wms'+3].wmsValue.substring(openfluid.outputs.wms['wms'+3].wmsValue.indexOf('?') + 1); // cseb:vue_d_ensemble2 
            var layerUrlparse3 = openfluid.outputs.wms['wms'+3].wmsValue.substr(0, openfluid.outputs.wms['wms'+3].wmsValue.indexOf('?')); // http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse3);
            console.log("    - Nom : " + layerNameparse3); 		
			
        // PART 2 : Ajout du WMS	
			var wmsdyn3 = new OpenLayers.Layer.WMS("wms3",
					layerUrlparse3, 
					{'layers': layerNameparse3,transparent: true} //, transparent: true, format: 'image/gif'
					//,{isBaseLayer: true}
				);
            var c3 = GEOR.util.createRecordType();
            var layerRecord3 = new c3({
                layer: wmsdyn3,
                name: layerNameparse3, 
                type: "WMS"
            });
            var clone3 = layerRecord3.clone();
            GEOR.ows.hydrateLayerRecord(clone3, {
                success: function() {
                    clone3.get("layer").setName(clone3.get("title"));
                    layerStore.addSorted(clone3);
                    //zoomToLayerRecExtent(clone3);
                    //GEOR.waiter.hide();
                },
                failure: function() {
                    GEOR.util.errorDialog({
                        msg: "Impossible d'obtenir les informations de la couche !"

                    });
                    GEOR.waiter.hide();
                },
                scope: this
            });
        }
		
        // ----------------------------------------------------------------------
        // Display output settings on the client side
        // ----------------------------------------------------------------------		

        // ----------------------------------------------------------------------
        // Update panel 
        // ----------------------------------------------------------------------
			someText = client_L_output_param1.replace(/(\r\n|\n|\r)/gm,"<br>");
			noglob_regionContent.update(someText);//works: noglob_regionContent.update('poulout');
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
			var writeWMCbisbis = writeWMCbis.replace(/General.*General/, 'General><Window width="1293" height="765" /><BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title /><Extension>  <ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-357823.236499999999" miny="5037008.69390000030" maxx="1313632.36280000000" maxy="7230727.37710000016" /></Extension></General');
			
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
		console.log('hide');
    },

};

console.log(GEOR.Addons.openfluid.prototype);
