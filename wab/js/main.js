Ext.namespace("GEOR.Addons");

var wab = {
	inputs : {
		list : [],
		forXmlPost : [],
		scroll : {
			list : [],
			addScroll : function(addScrollID,addObj) {
				wab.inputs.scroll["scroll"+addScrollID] = {obj : null} // ["param"+addParam] for dynamic var obj
				wab.inputs.scroll["scroll"+addScrollID].obj = addObj;
				wab.inputs.scroll["scroll"+addScrollID].objForWindowInput = null;
			}
		},
		checkbox : {
			list : [],
			addCheckbox : function(addCheckboxID,addObj) {
				wab.inputs.checkbox["checkbox"+addCheckboxID] = {obj : null} // ["param"+addParam] for dynamic var obj
				wab.inputs.checkbox["checkbox"+addCheckboxID].obj = addObj;
				wab.inputs.checkbox["checkbox"+addCheckboxID].objForWindowInput = null;
			}
		},
		param : {
			list : [],
			addParam : function(addParamID,addObj) {
				wab.inputs.param["param"+addParamID] = {obj : null} // ["param"+addParam] for dynamic var obj
				wab.inputs.param["param"+addParamID].obj = addObj;
				wab.inputs.param["param"+addParamID].objForWindowInput = null;
			}
		},
		coordxy : {
			list : [],
			addCoordxy : function(Coordxy,addObj) {
				wab.inputs.coordxy["coordxy"+Coordxy] = {obj : null} 
				wab.inputs.coordxy["coordxy"+Coordxy].obj = addObj;
				wab.inputs.coordxy["coordxy"+Coordxy].objForWindowInput = null;
				wab.inputs.coordxy["coordxy"+Coordxy].coordxyStore = null;
			}
		},
		scrollwms : {
			list : [],
			addScrollwms : function(Scrollwms,addObj) {
				wab.inputs.scrollwms["scrollwms"+Scrollwms] = {obj : null} 
				wab.inputs.scrollwms["scrollwms"+Scrollwms].obj = addObj;
				wab.inputs.scrollwms["scrollwms"+Scrollwms].objForWindowInput = null;
				wab.inputs.scrollwms["scrollwms"+Scrollwms].scrollwms = null;
			}
		},
		gml : {
			list : [],
			addGml : function(Gml,addObj) {
				wab.inputs.gml["gml"+Gml] = {obj : null} 
				wab.inputs.gml["gml"+Gml].obj = addObj;
				wab.inputs.gml["gml"+Gml].objForWindowInput = null;
				wab.inputs.gml["gml"+Gml].gmlValue = null;
			}
		}
	},
	outputs : {
		list : [],
		scroll : {
			list : [],
			addScroll : function(addScrollID,addName, addDefaultValue, addTitle) {
				wab.outputs.scroll["scroll"+addScrollID] = {name : null, defaultValue : null, title : null} 
				wab.outputs.scroll["scroll"+addScrollID].name = addName;
				wab.outputs.scroll["scroll"+addScrollID].defaultValue = addDefaultValue;
				wab.outputs.scroll["scroll"+addScrollID].title = addTitle;
			}
		}
	}
}

var noglob_execute_on_off = 0;
var noglob_table_L_output_wms = [];
var noglob_table_L_output_param = [];
var noglob_regionContent = "";
var noglob_myPanel = "";
var noglob_addComboxFieldItemsWFS = "";
var noglob_liste = "";
var noglob_table_input_param;

GEOR.Addons.wab = function(map, options) {
    this.map = map;
    this.options = options;
};

GEOR.Addons.wab.prototype = {
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
					wab.inputs.list.push(wpsProcess.dataInputs[i].identifier);
                }
                var index = wab.inputs.list.indexOf(undefined);
				
                if (index > -1) {
                    wab.inputs.list.splice(index, 1);
                } // Removing undefined values 
                for (i = 0; i < wab.inputs.list.length; i++) {
                    switch (true) {
                        case (wab.inputs.list[i].slice(0, 13) == "L_input_param"):
                            //noglob_table_L_input_param.push(wab.inputs.list[i]);
							wab.inputs.param.list.push(wab.inputs.list[i]);
                            break;
                        case (wab.inputs.list[i].slice(0, 11) == "L_input_wms"):
                            wab.inputs.scrollwms.list.push(wab.inputs.list[i]);
                            break;
                        case (wab.inputs.list[i].slice(0, 14) == "L_input_scroll"):
							wab.inputs.scroll.list.push(wab.inputs.list[i]);
                            break;
                        case (wab.inputs.list[i].slice(0, 15) == "L_input_coordxy"):
                            //noglob_table_L_input_coordxy.push(wab.inputs.list[i]);
							wab.inputs.coordxy.list.push(wab.inputs.list[i]);
                            break;
                        case (wab.inputs.list[i].slice(0, 11) == "C_input_gml"):
                            //table_C_input_gml.push(wab.inputs.list[i]);
							wab.inputs.gml.list.push(wab.inputs.list[i]);
							//wab.inputs.gml.list.push(wab.inputs.list[i]);
                            break;
                        case (wab.inputs.list[i].slice(0, 16) == "L_input_checkbox"):
                            //noglob_table_L_input_checkbox.push(wab.inputs.list[i]);
							wab.inputs.checkbox.list.push(wab.inputs.list[i]);
                            break;						
                    }
                }
                console.log("Le WPS utilise " + wab.inputs.list.length + " input(s) : " + wab.inputs.list);
                console.log("    - " + wab.inputs.param.list.length + " input(s) de paramètre : " + wab.inputs.param.list);
                console.log("    - " + wab.inputs.scrollwms.list.length + " input(s) de WMS : " + wab.inputs.scrollwms.list);
                console.log("    - " + wab.inputs.scroll.list.length + " input(s) de scroll : " + wab.inputs.scroll.list);
                console.log("    - " + wab.inputs.coordxy.list.length + " input(s) de coordonnées xy : " + wab.inputs.coordxy.list);
                console.log("    - " + wab.inputs.gml.list.length + " input(s) de gml : " + wab.inputs.gml.list);
				console.log("    - " + wab.inputs.checkbox.list.length + " input(s) de checkbox : " + wab.inputs.checkbox.list);
				
				
                // ----------------------------------------------------------------------
                // Course outputs
                // ----------------------------------------------------------------------
                // List the outputs included in the DescribeProcess query and store them in the noglob_table "noglob_tableOutputs"
                for (i in wpsProcess.processOutputs) {
					wab.outputs.list.push(wpsProcess.processOutputs[i].identifier);
                }
                if (wab.outputs.list.indexOf(undefined) > -1) {
                    wab.outputs.list.splice(wab.outputs.list.indexOf(undefined), 1);
                }
                for (i = 0; i < wab.outputs.list.length; i++) {
                    if (wab.outputs.list[i].slice(0, 12) == "L_output_wms") {
                        noglob_table_L_output_wms.push(wab.outputs.list[i]);
                    } 
					else if (wab.outputs.list[i].slice(0, 14) == "L_output_param") {
                        noglob_table_L_output_param.push(wab.outputs.list[i]);
                    }
                }
                console.log("Le WPS retourne " + wab.outputs.list.length + " output(s) : " + wab.outputs.list);
                console.log("    - " + noglob_table_L_output_param.length + " output(s) de paramètre : " + noglob_table_L_output_param);
                console.log("    - " + noglob_table_L_output_wms.length + " output(s) de wms : " + noglob_table_L_output_wms);

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
	    for (i = 1; i <= wab.inputs.param.list.length; i++) {	 
			wab.inputs.param.addParam(i,findDataInputsByIdentifier(process.dataInputs, "L_input_param"+i));
		}
        // ----------------------------------------------------------------------
        // Data input WMS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WMS input WMS -- wab.inputs.scrollwms.list
		for (i = 1; i <= wab.inputs.scrollwms.list.length; i++) {
            wab.inputs.scrollwms.addScrollwms(i,findDataInputsByIdentifier(process.dataInputs, "L_input_wms"+i));
		}
        //if (noglob_table_L_input_wms.length >= 5) {

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        for (i = 1; i <= wab.inputs.scroll.list.length; i++) {
			wab.inputs.scroll.addScroll(i,findDataInputsByIdentifier(process.dataInputs, "L_input_scroll"+i));
			trashArray = [];
            for (var k in wab.inputs.scroll["scroll"+i].obj.literalData.allowedValues) {
					trashArray.push(k);
            }
			wab.inputs.scroll["scroll"+i].obj.literalData.allowedValues.list = [];
			wab.inputs.scroll["scroll"+i].obj.literalData.allowedValues.list = trashArray;
        }
		
        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
		for (i = 1; i <= wab.inputs.coordxy.list.length; i++) {
            wab.inputs.coordxy.addCoordxy(i,findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy"+i));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs Checkbox 
        // ----------------------------------------------------------------------		
	    for (i = 1; i <= wab.inputs.checkbox.list.length; i++) {	 
			wab.inputs.checkbox.addCheckbox(i,findDataInputsByIdentifier(process.dataInputs, "L_input_checkbox"+i));
		}
		
        // ----------------------------------------------------------------------
        // Data inputs GML 
        // ----------------------------------------------------------------------		
	    for (i = 1; i <= wab.inputs.gml.list.length; i++) {	 
			wab.inputs.gml.addGml(i,findDataInputsByIdentifier(process.dataInputs, "C_input_gml"+i));
		}
		
        this.wpsInitialized = true;
    },
    /** -----------------------------------------------------------------------------
            Input window 	
            ----------------------------------------------------------------------------- */
    createWindow: function() {
		noglob_table_input_param = [];
        // ----------------------------------------------------------------------
        // Parameter inputs
        // ----------------------------------------------------------------------
		wab.inputs.param.windowInput = [];
		var noglob_table_input_param_splitPanel1 = [];
		var noglob_table_input_param_splitPanel2 = [];
		for (i = 1; i <= wab.inputs.param.list.length; i++) {
            wab.inputs.param['param'+i].objForWindowInput = new Ext.form.TextField({ //this.champ_pour_input_param1 = new Ext.form.TextField({
                fieldLabel: wab.inputs.param['param'+i].obj.title,//wps_Config_param1.input_param1_fromPython.title,
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
            //noglob_table_input_param.push(wab.inputs.param['param'+i].objForWindowInput);
			wab.inputs.param.windowInput.push(wab.inputs.param['param'+i].objForWindowInput);
        }
        // ----------------------------------------------------------------------
        // WMS inputs
        // ----------------------------------------------------------------------		       
        // PART 1
		layer_noglob_liste_WFS = [];
		wab.inputs.scrollwms.windowInput = [];
        noglob_addComboxFieldItemsWFS = function() { // Fonctionne pour le WMS et WFS, sert a editer layer_noglob_liste_WFS
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

        // PART 2
		for (i = 1; i <= wab.inputs.scrollwms.list.length; i++) {
        //if (wab.inputs.scrollwms.list.length >= 1) {
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

            /*var gugu = new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: noglob_addComboxFieldItemsWFS()
                });
				*/
			//wab.inputs.scrollwms['scrollwms'+i].objForWindowInput =	new Ext.form.ComboBox(Ext.apply({
            //champ_pour_input_wms1 = new Ext.form.ComboBox(Ext.apply({
			wab.inputs.scrollwms['scrollwms'+i].objForWindowInput =	new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: wab.inputs.scrollwms.scrollwms1.obj.title,
                emptyText: wab.inputs.scrollwms.scrollwms1.obj.abstract,
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
					//,storeId: 'myStore'
                }),
				noglob_listeners: {
					'beforequery': function() { // beforequery : Quand clic sur combobox
							   console.log('beforequery');							   
						 },
					
					'beforerender': function() { // beforerender est juste au moment d ouvrir la fenetre avant qu elle saffiche
							   console.log('beforerender');
						 },

					'select': function(combo, records, eOpts) { // select : quand a choisi un champ de la cbbox
						console.log('select');
					}
				}				
            }, base));
            //noglob_table_input_param.push(wab.inputs.param['param'+i].objForWindowInput);
			wab.inputs.scrollwms.windowInput.push(wab.inputs.scrollwms['scrollwms'+i].objForWindowInput);
			
			//console.log('ajout wms 1');
            //if (noglob_table_L_input_wms.length == 1) {
                //noglob_table_input_param.push(warningMsg_wms);
            //}
        }
        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
		wab.inputs.scroll.windowInput = [];
		for (i = 1; i <= wab.inputs.scroll.list.length; i++) {
			wab.inputs.scroll['scroll'+i].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
				width: 125, // line 1203
				fieldLabel:wab.inputs.scroll['scroll'+i].obj.title, 
				name:'division',
                value: wab.inputs.scroll['scroll'+i].obj.literalData.allowedValues.list[0],
				store: wab.inputs.scroll['scroll'+i].obj.literalData.allowedValues.list,
				editable: false,
				triggerAction:'all',
						}, base));	
			wab.inputs.scroll.windowInput.push(wab.inputs.scroll['scroll'+i].objForWindowInput);
        }
        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
		wab.inputs.gml.windowInput = [];
        if (wab.inputs.gml.list.length >= 1) {
		//for (i = 1; i <= wab.inputs.gml.list.length; i++) {
            tmpwindowgml = {
				idgml: 'gml1',
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            //gmlValue1 = e.target.result;
							wab.inputs.gml[tmpwindowgml.idgml].gmlValue = e.target.result; // flag : i undefined
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
			wab.inputs.gml.windowInput.push(tmpwindowgml);
        }

        // PART 2 GML Window
        var fileWindow;
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: true,
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                wab.inputs.gml.windowInput,
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
					for (i = 1; i <= wab.inputs.coordxy.list.length; i++) {
						//if (log_coord == i) {
							wab.inputs.coordxy["coordxy"+i].coordxyStore = lonlat.lat; 
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

		wab.inputs.coordxy.windowInput = [];
		for (i = 1; i <= wab.inputs.coordxy.list.length; i++) {
            wab.inputs.coordxy['coordxy'+i].objForWindowInput = new Ext.Button({
                iconCls: 'add_icon',
                text: wab.inputs.coordxy['coordxy'+i].obj.title, //OpenLayers.i18n(noglob_coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = i;
                },
                scope: this
            });
			wab.inputs.coordxy.windowInput.push(wab.inputs.coordxy['coordxy'+i].objForWindowInput);
		}
		
        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
		wab.inputs.checkbox.windowInput = [];
		for (i = 1; i <= wab.inputs.checkbox.list.length; i++) {
			wab.inputs.checkbox['checkbox'+i].objForWindowInput = new Ext.form.Checkbox({ // flag
					//boxLabel: noglob_checkboxTitle[i-1],
					id: 'checkbox'+i,
					width: 150,
					xtype: 'checkbox',
					fieldLabel: wab.inputs.checkbox['checkbox'+i].obj.title,
					checked: true
            });
			wab.inputs.checkbox.windowInput.push(wab.inputs.checkbox['checkbox'+i].objForWindowInput);
			/*
			if (i <= 6) {
			//noglob_table_input_param.push(wab.inputs.checkbox['checkbox'+i].objForWindowInput);
			wab.inputs.scroll.windowInput.push(wab.inputs.checkbox['checkbox'+i].objForWindowInput);
			}
			else {
			noglob_table_input_param_splitPanel2.push(wab.inputs.checkbox['checkbox'+i].objForWindowInput);
			}
			*/
		}
        // ----------------------------------------------------------------------
        // Tab (in progress)
        // ----------------------------------------------------------------------		
        var onglet2 = {
            title: OpenLayers.i18n("Options de deconnexion "),
            closable: false,
            activate: true,
            region: 'south',
            collapsible: true,
            collapsed: false,
            split: true,
			//FAIL renderTo: Ext.getBody(), 
            items: [{
                xtype: 'form',
                autoWidth: true,
                labelWidth: 300,
                padding: 10,
                bodyStyle: "padding:10px;",
				layout:'column',
				//FAIL columns: 2,
				//FAIL vertical: true,
                items: [noglob_table_input_param_splitPanel1//, champ_pour_input_wms1
                    /*wab.inputs.scroll.scroll1.objForWindowInput,
                    champ_pour_input_scroll2*/
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
        
		noglob_myPanel = new Ext.Window({
            // Config globale
            title: OpenLayers.i18n("addon_wpsmaker_title"),
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
            width: globalWidth*1.3, // auto provoque un bug de largeur sur Chrome
			height:Ext.getBody().getViewSize().height - 123,//62,
			y: '90px',//'31px', 
			x: '0%',
            iconCls: 'windo_icon',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            items: [
			// {title: 'Hello Ext',html : 'Hello! <b>Welcome</b> to Ext JS.'}
			{
                xtype: 'form',
				id : 'reportGraphArea',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
					wab.inputs.param.windowInput,
					wab.inputs.scroll.windowInput,
					wab.inputs.checkbox.windowInput,
					wab.inputs.coordxy.windowInput,
					wab.inputs.scrollwms.windowInput,
                    //noglob_table_input_param,
					fileLoadForm
					//,champ_pour_input_wms1
                ],		
				/*tbar:[{ // Pour aligner a droite: tbar:['->', {
					text : 'Rafraichir',
					tooltip:'Rafraichir les couches chargees',
					iconCls: 'arrow_refresh',//'add',
					handler: 
					//----------------------------------------------------------------------
					//Refresh wmsLayers
					//----------------------------------------------------------------------
						function() {
							console.log(noglob_table_input_param);
							layer_noglob_liste_WFS = [];
							noglob_addComboxFieldItemsWFS();
							// Champ 1 
							champ_pour_input_wms1 = new Ext.form.ComboBox({
								name: "wms",
								fieldLabel: OpenLayers.i18n(noglob_wmsTitle[0]), // marche pas ?
								emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[0]),
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
							noglob_table_input_param.push(champ_pour_input_wms1);
							// Champ 2 
							champ_pour_input_wms2 = new Ext.form.ComboBox({
								name: "wms",
								fieldLabel: OpenLayers.i18n(noglob_wmsTitle[1]), 
								emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[1]),
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
							noglob_table_input_param.push(champ_pour_input_wms2);
							// Champ 3
							champ_pour_input_wms3 = new Ext.form.ComboBox({
								name: "wms",
								fieldLabel: OpenLayers.i18n(noglob_wmsTitle[2]), // marche pas ?
								emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[2]),
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
							noglob_table_input_param.push(champ_pour_input_wms3);
							// remove les 3 anciens champs
							var firstItem = Ext.getCmp('reportGraphArea').items.first();
							 Ext.getCmp('reportGraphArea').remove(firstItem,true);
							var firstItem2 = Ext.getCmp('reportGraphArea').items.first();
							 Ext.getCmp('reportGraphArea').remove(firstItem2,true);		 
							var firstItem3 = Ext.getCmp('reportGraphArea').items.first();
							 Ext.getCmp('reportGraphArea').remove(firstItem3,true);	
							var firstItem4 = Ext.getCmp('reportGraphArea').items.first();
							Ext.getCmp('reportGraphArea').remove(firstItem4,true);			 
							// Ajoute les 3 nouveaux
							Ext.getCmp('reportGraphArea').add(champ_pour_input_wms1);
							Ext.getCmp('reportGraphArea').add(champ_pour_input_wms2);
							Ext.getCmp('reportGraphArea').add(champ_pour_input_wms3);					
						//console.log('refreshtbar');
						console.log(noglob_table_input_param);
						// Retire les wms inputs 
						for(var i = noglob_table_input_param.length - 1; i >= 0; i--) { if ( (noglob_table_input_param[i].name === 'wms')) { 
							   noglob_table_input_param.splice(i, 1);
							}}
						
						// Recharge la page (sans la recreer)
						noglob_myPanel.hide();  
						noglob_myPanel.show();						
					}
					//----------------------------------------------------------------------
				}],*/
							
            },
// Exemple de combobox directe
/*
{
    xtype: 'combo',
    fieldLabel: 'Rating',
    hiddenName: 'rating',
	mode : 'local', // important sinon erreur proxy
    store: new Ext.data.SimpleStore({
        data: [
            [1, 'Half star'],
            [2, '1 star'],
            [3, '1 and half star'],
            [4, '2 star'],
            [5, '2 and half star'],
            [6, '3 star'],
            [7, '3 and half star'],
            [8, '4 star'],
            [9, '4 and half star'],
            [10, '5 star'],
            [11, '5 and half star'],
        ],
        id: 0,
        fields: ['value', 'text']
    }),
    valueField: 'value',
    displayField: 'text',
    triggerAction: 'all',
    editable: false
},
*/
//			
			//onglet2,//onglet3,
			noglob_regionContent,
			],
            // Creation/Ajout des boutons
            fbar: ['->', {
                text: OpenLayers.i18n("Fermer"),
                handler: function() {
                    this.win.hide();
					this.win = this.createWindow();
					//this.win.show();
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
		wab.inputs.forXmlPost = []; // reset sinon ne peut pas rechoisir
        // ----------------------------------------------------------------------
        // Inputs Param
        // ----------------------------------------------------------------------
		//noglob_tableList_input_forXml = [];
        for (i = 1; i <= wab.inputs.param.list.length; i++) { //if (wab.inputs.param.list.length >= 1) { // est important pour le message d'erreur si champs vide
            //var input_param1_fromPythonValue = wab.inputs.param['param'+i].objForWindowInput.getValue();
            tmpForXml = {
                identifier: "L_input_param"+i,
                data: {
                    literalData: {
                        value: wab.inputs.param['param'+i].objForWindowInput.getValue()
                    }
                }
            }
            //noglob_tableList_input_forXml.push(tmpForXml);
				if (wab.inputs.param['param'+i].objForWindowInput.getValue() != "") {
					wab.inputs.forXmlPost.push(tmpForXml);
				}
			
        }
        // ----------------------------------------------------------------------
        // Inputs WMS
        // ----------------------------------------------------------------------
		for (i = 1; i <= wab.inputs.scrollwms.list.length; i++) { //wab.inputs.param['param'+i].objForWindowInput
			if (wab.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue() !== "") {
				tmpValue = wab.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue().data.WFS_URL + wab.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue().data.WFS_typeName;
			}
			if (wab.inputs.scrollwms['scrollwms'+i].objForWindowInput.getValue() == "") {
				tmpValue = "null"
			}
			var tmpforXml = {
				identifier: "L_input_wms"+i,
				data: {
					literalData: {value: tmpValue}
				}
			}
			wab.inputs.forXmlPost.push(tmpforXml);
		}
        // ----------------------------------------------------------------------
        // Inputs Combobox
        // ----------------------------------------------------------------------
        if (wab.inputs.scroll.list.length >= 0) {
			for (i = 1; i <= wab.inputs.scroll.list.length; i++) {
                 wab.inputs.scroll['scroll'+i].objForXml = {
                    identifier: "L_input_scroll"+i,
                    data: {
                        literalData: {
                            value: wab.inputs.scroll['scroll'+i].objForWindowInput.getValue()
                        }
                    }
                }
				wab.inputs.forXmlPost.push(wab.inputs.scroll['scroll'+i].objForXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs Coordinates
        // ----------------------------------------------------------------------
        if (wab.inputs.coordxy.list.length >= 0) {
			for (i = 1; i <= wab.inputs.coordxy.list.length; i++) {
				wab.inputs.coordxy['coordxy'+i].objForXml = {
					identifier: "L_input_coordxy"+i,
					data: {
						literalData: {
							value: wab.inputs.coordxy["coordxy"+i].coordxyStore
						}
					}
				}
				//noglob_tableList_input_forXml.push(L_input_coordxy1_forXml);
				if (wab.inputs.coordxy["coordxy"+i].coordxyStore != null) {
					wab.inputs.forXmlPost.push(wab.inputs.coordxy['coordxy'+i].objForXml);
				}
			}
		}
        // ----------------------------------------------------------------------
        // Inputs GML
        // ----------------------------------------------------------------------
        if (wab.inputs.gml.list.length >= 1) {
			for (i = 1; i <= wab.inputs.gml.list.length; i++) {
				//console.log(gmlValue1);
				var tmpGMLforXml = {
					identifier: "C_input_gml"+i,
					data: {
						complexData: {
							value: wab.inputs.gml['gml'+i].gmlValue //gmlValue1
						}
					}
				}
				if (typeof(wab.inputs.gml['gml'+i].gmlValue) == "string") {
					wab.inputs.forXmlPost.push(tmpGMLforXml);
				}
			}
        }
        // ----------------------------------------------------------------------
        // Inputs Checkbox
        // ----------------------------------------------------------------------
        for (i = 1; i <= wab.inputs.checkbox.list.length; i++) {
            tmpForXml = {
                identifier: "L_input_checkbox"+i,
                data: {
                    literalData: {
                        value: wab.inputs.checkbox['checkbox'+i].objForWindowInput.getValue()
                    }
                }
            }
            //noglob_tableList_input_forXml.push(tmpForXml); // flag
			wab.inputs.forXmlPost.push(tmpForXml);
        }
		
        // Test if all fields are filled (except those by default)
        var champs_restant = wab.inputs.list.length - wab.inputs.forXmlPost.length;
        if (wab.inputs.list.length == wab.inputs.forXmlPost.length) { 

            // ----------------------------------------------------------------------
            // Outputs WMS
            // ----------------------------------------------------------------------
            tableList_output_forXml = [];
            if (noglob_table_L_output_wms.length >= 1) {
                L_output_wms1_forXml = {
                    asReference: false,
                    identifier: "L_output_wms1"
                }; 
                tableList_output_forXml.push(L_output_wms1_forXml); 
            }
            if (noglob_table_L_output_wms.length >= 2) {
                L_output_wms2_forXml = {
                    asReference: false,
                    identifier: "L_output_wms2"
                }; 
                tableList_output_forXml.push(L_output_wms2_forXml); 
            }
            if (noglob_table_L_output_wms.length >= 3) {
                L_output_wms3_forXml = {
                    asReference: false,
                    identifier: "L_output_wms3"
                }; 
                tableList_output_forXml.push(L_output_wms3_forXml); 
            }

            // ----------------------------------------------------------------------
            // Outputs Param
            // ----------------------------------------------------------------------
            if (noglob_table_L_output_param.length >= 1) {
                L_output_param1_forXml = {
                    asReference: false,
                    identifier: "L_output_param1"
                }; 
                tableList_output_forXml.push(L_output_param1_forXml); 
            }
            if (noglob_table_L_output_param.length >= 2) {
                L_output_param2_forXml = {
                    asReference: false,
                    identifier: "L_output_param2"
                }; 
                tableList_output_forXml.push(L_output_param2_forXml); 
            }
            if (noglob_table_L_output_param.length >= 3) {
                L_output_param3_forXml = {
                    asReference: false,
                    identifier: "L_output_param3"
                };
                tableList_output_forXml.push(L_output_param33_forXml); 
            }

            // ----------------------------------------------------------------------
            // Sends the query
            // ----------------------------------------------------------------------
            console.log("Une requête XML a été envoyée : ");

            var wpsFormat = new OpenLayers.Format.WPSExecute();
            // Creation de la requete XML
            var xmlString = wpsFormat.write({
                identifier: WPS_identifier,
                dataInputs: wab.inputs.forXmlPost, //noglob_tableList_input_forXml,
                responseForm: {
                    responseDocument: {
                        storeExecuteResponse: true,
                        lineage: false,
                        status: false,
                        outputs: //[
                            tableList_output_forXml
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
            for (var i = 0; i < wab.outputs.list.length; i++) { // Invariable
                var identifier = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], owsNS, "Identifier")[0].firstChild.nodeValue; // L_output_wms1
                var literalData = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], wpsNS, "LiteralData"); //console.log(literalData[0].firstChild.nodeValue); //http://sdi.georchestra.org/geoserver/wfs?savoie:savoie

                // ----------------------------------------------------------------------
                // Outputs WMS 
                // ----------------------------------------------------------------------
                // Recover data from the output sent by the PyWPS server
                if (identifier == "L_output_wms1") {
                    client_L_output_wms1 = literalData[0].firstChild.nodeValue;
                }
                if (identifier == "L_output_wms2") {
                    client_L_output_wms2 = literalData[0].firstChild.nodeValue;
                }
                if (identifier == "L_output_wms3") {
                    client_L_output_wms3 = literalData[0].firstChild.nodeValue;
                }
                // ----------------------------------------------------------------------
                // Outputs Param 
                // ----------------------------------------------------------------------
                if (identifier == "L_output_param1") {
                    client_L_output_param1 = literalData[0].firstChild.nodeValue;
                    console.log(client_L_output_param1);
                }
                noglob_execute_on_off = 0; // Limite le nombre de process wps a la fois
            }
        }
        // ----------------------------------------------------------------------
        // Add WMS layer 
        // ----------------------------------------------------------------------
        // PART 1 : Load wms layer from recovered data	
        GEOR.waiter.show(); // Barre bleu de chargement
        if (noglob_table_L_output_wms.length >= 1) { // et si non vide	
            // client_L_output_wms1 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse = client_L_output_wms1.substring(client_L_output_wms1.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse = client_L_output_wms1.substr(0, client_L_output_wms1.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse);
            console.log("    - Nom : " + layerNameparse); //console.log("    - Entrepot :"+entrepotName);		
			/*
			var layerUrlparse = "http://91.121.171.75:8080/geoserver/wms";
			var layerNameparse = 'jvh:RS_topology2154';
			*/
			
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

        if (noglob_table_L_output_wms.length >= 2) {	
            // client_L_output_wms2 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse2 = client_L_output_wms2.substring(client_L_output_wms2.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse2 = client_L_output_wms2.substr(0, client_L_output_wms2.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse2);
            console.log("    - Nom : " + layerNameparse2); //console.log("    - Entrepot :"+entrepotName);		
			/*
			var layerUrlparse = "http://91.121.171.75:8080/geoserver/wms";
			var layerNameparse = 'jvh:RS_topology2154';
			*/
			
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

			var huhu5 = GEOR.wmc.write(layerStore); //  ok
			var huhu6 = GEOR.map.create;
        }
        // ----------------------------------------------------------------------
        // Display output settings on the client side
        // ----------------------------------------------------------------------		
        //GEOR.util.infoDialog({msg: "test"});
		//	noglob_myPanel.hide();
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
		// map sactualise tt le temps peu importe son placement dans le code, il faut donc faire le wmc que quand la somme des layers de map est egale aux wms attendu
		
		//for (i = 0; i < 100; i++) { 
		setTimeout(function() { // la fonction se declence 20 seconde apres ?
			// Creation du WMC vierge
			var parserWMC = new OpenLayers.Format.WMC({
                layerOptions: {
                    // to prevent automatic restoring of PNG rather than JPEG:
                    noMagic: true
                }
            });
			// Creation du wmc a partir des couches ajoutees
			var writeWMC = parserWMC.write(this.map);
			// Correction pour que les wms sonient correctement declares en queryable
			var writeWMCbis = writeWMC.replace('</Extension></Layer><Layer queryable="0"', '</Extension></Layer><Layer queryable="1"');
			var writeWMCbisbis = writeWMCbis.replace(/General.*General/, 'General><Window width="1293" height="765" /><BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title /><Extension>  <ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-357823.236499999999" miny="5037008.69390000030" maxx="1313632.36280000000" maxy="7230727.37710000016" /></Extension></General');
			
			layerStore2 = Ext.getCmp("mappanel").layers;	
			var huhu6 = GEOR.wmc.write(layerStore2); //  ok
			//console.log(huhu6);
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
            // N'affiche que le dernier
			//GEOR.util.infoDialog({msg: "Bienvenue sur wab. <br> Un <b>tutoriel</b> est disponible, cliquez sur ce <A HREF='https://www.google.fr/' target='_blank'>lien</a> ou sur le bouton \"Aide\" situé en bas à gauche de votre écran."});
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

console.log(GEOR.Addons.wab.prototype);
