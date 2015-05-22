Ext.namespace("GEOR.Addons");

var noglob_numberOfInputs;
var noglob_table = [];
var noglob_tableOutputs = [];
var noglob_table_L_input_param = [];
var noglob_table_L_input_wms = [];
var noglob_wmsTitle = [];
var noglob_noglob_wmsAbstract = [];
var noglob_wmsAbstract = [];
var noglob_scrollTitle = [];
var noglob_scroll_allowedValues = [];
var noglob_table_L_input_coordxy = [];
var noglob_coordxyTitle = [];
var noglob_table_C_input_gml = [];
var noglob_coordxyValue1, noglob_coordxyValue2, noglob_coordxyValue3, noglob_coordxyValue4, noglob_coordxyValue5;
var noglob_gmlValue1, noglob_gmlValue2, noglob_gmlValue3, noglob_gmlValue4, noglob_gmlValue5;
var noglob_execute_on_off = 0;
//var layer_noglob_liste_WFS = [];
var noglob_table_L_output_wms = [];
var noglob_table_L_output_param = [];
var noglob_table_L_input_checkbox = [];
var noglob_champ_pour_input_checkbox = [];
var noglob_checkboxTitle = [];
var noglob_regionContent = "";
var noglob_myPanel = "";
var noglob_addComboxFieldItemsWFS = "";
var noglob_liste = "";
var noglob_table_input_param;
//var champ_pour_input_wms1 ;
//var onglet2 = "";
var noglob_tableList_input_forXml = [];

GEOR.Addons.arbreexu = function(map, options) {
    this.map = map;
    this.options = options;
};

GEOR.Addons.arbreexu.prototype = {
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
			// Test
			//FAIL this.showWindow; // Ne fait rien
			//
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
                    noglob_table.push(wpsProcess.dataInputs[i].identifier); // Each input is added to the table
                }
                var index = noglob_table.indexOf(undefined);
                if (index > -1) {
                    noglob_table.splice(index, 1);
                } // Removing undefined values 
                noglob_numberOfInputs = noglob_table.length;
                for (i = 0; i < noglob_numberOfInputs; i++) {
                    switch (true) {
                        case (noglob_table[i].slice(0, 13) == "L_input_param"):
                            noglob_table_L_input_param.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_table_L_input_param");
                            break;
                        case (noglob_table[i].slice(0, 11) == "L_input_wms"):
                            noglob_table_L_input_wms.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_table_L_input_wms");
                            break;
                        case (noglob_table[i].slice(0, 14) == "L_input_scroll"):
                            noglob_wmsAbstract.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_wmsAbstract");
                            break;
                        case (noglob_table[i].slice(0, 15) == "L_input_coordxy"):
                            noglob_table_L_input_coordxy.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_table_L_input_coordxy");
                            break;
                        case (noglob_table[i].slice(0, 11) == "C_input_gml"):
                            noglob_table_C_input_gml.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_wmsAbstract");
                            break;
                        case (noglob_table[i].slice(0, 16) == "L_input_checkbox"):
                            noglob_table_L_input_checkbox.push(noglob_table[i]);
                            //console.log(noglob_table[i] + " est ajouté a noglob_wmsAbstract");
                            break;						
                    }
                }
                console.log("Le WPS utilise " + noglob_numberOfInputs + " input(s) : " + noglob_table);
                console.log("    - " + noglob_table_L_input_param.length + " input(s) de paramètre : " + noglob_table_L_input_param);
                console.log("    - " + noglob_table_L_input_wms.length + " input(s) de WMS : " + noglob_table_L_input_wms);
                console.log("    - " + noglob_wmsAbstract.length + " input(s) de scroll : " + noglob_wmsAbstract);
                console.log("    - " + noglob_table_L_input_coordxy.length + " input(s) de coordonnées xy : " + noglob_table_L_input_coordxy);
                console.log("    - " + noglob_table_C_input_gml.length + " input(s) de gml : " + noglob_table_C_input_gml);
				console.log("    - " + noglob_table_L_input_checkbox.length + " input(s) de checkbox : " + noglob_table_L_input_checkbox);
				
				noglob_numberOfInputswithoutwms = noglob_numberOfInputs - noglob_table_L_input_wms.length; //console.log(noglob_numberOfInputswithoutwms);
                // ----------------------------------------------------------------------
                // Course outputs
                // ----------------------------------------------------------------------
                // List the outputs included in the DescribeProcess query and store them in the noglob_table "noglob_tableOutputs"
                for (i in wpsProcess.processOutputs) {
                    noglob_tableOutputs.push(wpsProcess.processOutputs[i].identifier);
                }
                var indexoutputs = noglob_tableOutputs.indexOf(undefined);
                if (indexoutputs > -1) {
                    noglob_tableOutputs.splice(indexoutputs, 1);
                }
                //console.log(noglob_tableOutputs);
                numberOfOutputs = noglob_tableOutputs.length;
                //console.log(numberOfOutputs);
                for (i = 0; i < numberOfOutputs; i++) {
                    if (noglob_tableOutputs[i].slice(0, 12) == "L_output_wms") {
                        noglob_table_L_output_wms.push(noglob_tableOutputs[i]);
                        //console.log(noglob_tableOutputs[i]+" est ajouté a noglob_table_L_input_param");
                    } else if (noglob_tableOutputs[i].slice(0, 14) == "L_output_param") {
                        noglob_table_L_output_param.push(noglob_tableOutputs[i]);
                        //console.log(noglob_tableOutputs[i]+" est ajouté a noglob_table_L_input_param");
                    }
                }
                console.log("Le WPS retourne " + numberOfOutputs + " output(s) : " + noglob_tableOutputs);
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
		//FAIL this.showWindow; // Ne fait rien
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
        // If input_param exist (i.e. if noglob_table_L_input_param.length> 0) then activates a variable for each input		
        if (noglob_table_L_input_param.length >= 1) {
            var input_param1_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param1");
            wps_Config_param1 = {
                input_param1_fromPython: {
                    value: input_param1_fromPython.literalData.defaultValue,
                    title: input_param1_fromPython.title
                }
            };
        }
        if (noglob_table_L_input_param.length >= 2) {
            var input_param2_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param2");
            wps_Config_param2 = {
                input_param2_fromPython: {
                    value: (input_param2_fromPython.literalData.defaultValue) ? input_param2_fromPython.literalData.defaultValue : 5,
                    title: input_param2_fromPython.title
                }
            };
        }
        if (noglob_table_L_input_param.length >= 3) {
            var input_param3_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param3");
            wps_Config_param3 = {
                input_param3_fromPython: {
                    value: (input_param3_fromPython.literalData.defaultValue) ? input_param3_fromPython.literalData.defaultValue : 5,
                    title: input_param3_fromPython.title
                }
            };
        }
        if (noglob_table_L_input_param.length >= 4) {
            var input_param4_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param4");
            wps_Config_param4 = {
                input_param4_fromPython: {
                    value: (input_param4_fromPython.literalData.defaultValue) ? input_param4_fromPython.literalData.defaultValue : 5,
                    title: input_param4_fromPython.title
                }
            };
        }
        if (noglob_table_L_input_param.length >= 5) {
            var input_param5_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param5");
            wps_Config_param5 = {
                input_param5_fromPython: {
                    value: (input_param5_fromPython.literalData.defaultValue) ? input_param5_fromPython.literalData.defaultValue : 5,
                    title: input_param5_fromPython.title
                }
            };
        }

        // ----------------------------------------------------------------------
        // Data input WMS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WMS input WMS
        if (noglob_table_L_input_wms.length >= 1) {
            var L_input_wms1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms1");
            noglob_wmsTitle.push(L_input_wms1_name.title);
            noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (noglob_table_L_input_wms.length >= 2) {
            var L_input_wms2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms2");
            noglob_wmsTitle.push(L_input_wms2_name.title);
            noglob_noglob_wmsAbstract.push(L_input_wms2_name.abstract);
        }
        if (noglob_table_L_input_wms.length >= 3) {
            var L_input_wms3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms3");
            noglob_wmsTitle.push(L_input_wms3_name.title);
            noglob_noglob_wmsAbstract.push(L_input_wms3_name.abstract);
        }
        if (noglob_table_L_input_wms.length >= 4) {
            var L_input_wms4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms4");
            noglob_wmsTitle.push(L_input_wms4_name.title);
            noglob_noglob_wmsAbstract.push(L_input_wms4_name.abstract);
        }
        if (noglob_table_L_input_wms.length >= 5) {
            var L_input_wms5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms5");
            noglob_wmsTitle.push(L_input_wms5_name.title);
            noglob_noglob_wmsAbstract.push(L_input_wms5_name.abstract);
        }

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        if (noglob_wmsAbstract.length >= 1) {
            var L_input_scroll1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll1");
			console.log(L_input_scroll1_name)
            noglob_scrollTitle.push(L_input_scroll1_name.title);
            scroll1_allowedValues = [];
            for (var k in L_input_scroll1_name.literalData.allowedValues) {
                scroll1tmp_allowedValues = [];
                scroll1tmp_allowedValues.push(k);
                scroll1tmp_allowedValues.push(k);
                scroll1_allowedValues.push(scroll1tmp_allowedValues);
            }
            noglob_scroll_allowedValues.push(scroll1_allowedValues); //noglob_scroll_allowedValues.push(scroll1_allowedValues[0][0]);
			console.log(noglob_scroll_allowedValues);
        }
        if (noglob_wmsAbstract.length >= 2) {
            var L_input_scroll2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll2");
            noglob_scrollTitle.push(L_input_scroll2_name.title);
            scroll2_allowedValues = [];
            for (var k in L_input_scroll2_name.literalData.allowedValues) {
                scroll2tmp_allowedValues = [];
                scroll2tmp_allowedValues.push(k);
                scroll2tmp_allowedValues.push(k);
                scroll2_allowedValues.push(scroll2tmp_allowedValues);
            }
            noglob_scroll_allowedValues.push(scroll2_allowedValues);
        }
        if (noglob_wmsAbstract.length >= 3) {
            var L_input_scroll3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll3");
            noglob_scrollTitle.push(L_input_scroll3_name.title);
            scroll3_allowedValues = [];
            for (var k in L_input_scroll3_name.literalData.allowedValues) {
                scroll3tmp_allowedValues = [];
                scroll3tmp_allowedValues.push(k);
                scroll3tmp_allowedValues.push(k);
                scroll3_allowedValues.push(scroll3tmp_allowedValues);
            }
            noglob_scroll_allowedValues.push(scroll3_allowedValues);
        }
        if (noglob_wmsAbstract.length >= 4) {
            var L_input_scroll4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll4");
            noglob_scrollTitle.push(L_input_scroll4_name.title);
            scroll4_allowedValues = [];
            for (var k in L_input_scroll4_name.literalData.allowedValues) {
                scroll4tmp_allowedValues = [];
                scroll4tmp_allowedValues.push(k);
                scroll4tmp_allowedValues.push(k);
                scroll4_allowedValues.push(scroll4tmp_allowedValues);
            }
            noglob_scroll_allowedValues.push(scroll4_allowedValues);
        }
        if (noglob_wmsAbstract.length >= 5) {
            var L_input_scroll5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll5");
            noglob_scrollTitle.push(L_input_scroll5_name.title);
            scroll5_allowedValues = [];
            for (var k in L_input_scroll5_name.literalData.allowedValues) {
                scroll5tmp_allowedValues = [];
                scroll5tmp_allowedValues.push(k);
                scroll5tmp_allowedValues.push(k);
                scroll5_allowedValues.push(scroll5tmp_allowedValues);
            }
            noglob_scroll_allowedValues.push(scroll5_allowedValues);
        }
		//console.log(noglob_scroll_allowedValues)

        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
        if (noglob_table_L_input_coordxy.length >= 1) {
            var L_input_coordxy1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy1");
            noglob_coordxyTitle.push(L_input_coordxy1_name.title);
            //noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (noglob_table_L_input_coordxy.length >= 2) {
            var L_input_coordxy2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy2");
            noglob_coordxyTitle.push(L_input_coordxy2_name.title);
            //noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (noglob_table_L_input_coordxy.length >= 3) {
            var L_input_coordxy3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy3");
            noglob_coordxyTitle.push(L_input_coordxy3_name.title);
            //noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (noglob_table_L_input_coordxy.length >= 4) {
            var L_input_coordxy4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy4");
            noglob_coordxyTitle.push(L_input_coordxy4_name.title);
            //noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (noglob_table_L_input_coordxy.length >= 5) {
            var L_input_coordxy5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy5");
            noglob_coordxyTitle.push(L_input_coordxy5_name.title);
            //noglob_noglob_wmsAbstract.push(L_input_wms1_name.abstract);
        }
		
        // ----------------------------------------------------------------------
        // Data inputs Checkbox (title)
        // ----------------------------------------------------------------------		
		//if (noglob_table_L_input_checkbox.length >= 1) {
	    for (i = 1; i <= noglob_table_L_input_checkbox.length; i++) {	
    		var L_input_checkbox_name = findDataInputsByIdentifier(process.dataInputs, "L_input_checkbox"+i); //console.log (L_input_checkbox_name);
			noglob_checkboxTitle.push(L_input_checkbox_name.title); //console.log (noglob_checkboxTitle);
		}
		
		
        this.wpsInitialized = true;
    },
    /** -----------------------------------------------------------------------------
            Input window 	
            ----------------------------------------------------------------------------- */
    createWindow: function() {
        // ----------------------------------------------------------------------
        // Parameter inputs
        // ----------------------------------------------------------------------
        noglob_table_input_param = [];
		var noglob_table_input_param_splitPanel1 = [];
		var noglob_table_input_param_splitPanel2 = [];
        if (noglob_table_L_input_param.length >= 1) {
            this.champ_pour_input_param1 = new Ext.form.TextField({
                fieldLabel: wps_Config_param1.input_param1_fromPython.title,
                name: "uselessname1",
                width: 40,
                /*maxValue: 298,
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                value: wps_Config_param1.input_param1_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            noglob_table_input_param.push(this.champ_pour_input_param1);
        }
        if (noglob_table_L_input_param.length >= 2) {
            this.champ_pour_input_param2 = new Ext.form.TextField({
                fieldLabel: wps_Config_param2.input_param2_fromPython.title,
                name: "uselessname2",
                width: 40,
                /*maxValue: 298,
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                value: wps_Config_param2.input_param2_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            noglob_table_input_param.push(this.champ_pour_input_param2);
        }
        if (noglob_table_L_input_param.length >= 3) {
            this.champ_pour_input_param3 = new Ext.form.TextField({
                fieldLabel: wps_Config_param3.input_param3_fromPython.title,
                name: "uselessname3",
                width: 40,
                /*maxValue: 298,
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                value: wps_Config_param3.input_param3_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            noglob_table_input_param.push(this.champ_pour_input_param3);
        }
        if (noglob_table_L_input_param.length >= 4) {
            this.champ_pour_input_param4 = new Ext.form.TextField({
                fieldLabel: wps_Config_param4.input_param4_fromPython.title,
                name: "uselessname4",
                width: 40,
                /*maxValue: 298,
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                value: wps_Config_param4.input_param4_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            noglob_table_input_param.push(this.champ_pour_input_param4);
        }
        if (noglob_table_L_input_param.length >= 5) {
            this.champ_pour_input_param5 = new Ext.form.TextField({
                fieldLabel: wps_Config_param5.input_param5_fromPython.title,
                name: "uselessname5",
                width: 40,
                /*maxValue: 298, //NumberField
                minValue: 1,*/
                allowBlank: false,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                value: wps_Config_param5.input_param5_fromPython.value,
                allowDecimals: true/*,
                decimalPrecision: 2*/
            });
            noglob_table_input_param.push(this.champ_pour_input_param5);
        }
        // ----------------------------------------------------------------------
        // WMS inputs
        // ----------------------------------------------------------------------		       
        // PART 1
		layer_noglob_liste_WFS = [];
        noglob_addComboxFieldItemsWFS = function() { // Fonctionne pour le WMS et WFS, sert a editer layer_noglob_liste_WFS
            //var empty = true;
            layerStore.each(function(record) {
				console.log(record);
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
					//console.log(noglob_liste);	console.log(layer_noglob_liste_WFS);
					//layer_noglob_liste_WFS = [];
					//console.log(layer_noglob_liste_WFS);
                    layer_noglob_liste_WFS.push(noglob_liste);
					console.log('ADDWMSITEMS');
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
        if (noglob_table_L_input_wms.length >= 1) {
            var FIELD_WIDTH = 60, 
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

            var gugu = new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: noglob_addComboxFieldItemsWFS()
                });
				
				
            champ_pour_input_wms1 = new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[0]),
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[0]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
					//,storeId: 'myStore'
                }),
				noglob_listeners: {
					'beforequery': function() { // beforequery : Quand clic sur combobox
							   console.log('beforequery');
							   	//FAILNOTAFUNCTION gugu.refresh();//FAIL gugu.clear();//FAITRIEN gugu.removeAll();//FAITRIEN gugu.loadData([],false);
								//noglob_addComboxFieldItemsWFS();
							   //FAITRIEN queryEvent.combo.onLoad();return false; 
							   //FAITRIEN gugu.lastQuery = null;
							   //FAILNOTAFUNCTION this.removeAll();
							   //FAITRIEN gugu.removeAll();
							   
							   ////noglob_addComboxFieldItemsWFS();
							   
							   //FAILTHISPROXYUNDEFINED gugu.reload();
							   
						 },
					
					'beforerender': function() { // beforerender est juste au moment d ouvrir la fenetre avant qu elle saffiche
							   console.log('beforerender');
						 },

					'select': function(combo, records, eOpts) { // select : quand a choisi un champ de la cbbox
						//console.log(records[0].get('name'));
						console.log('select');
						//console.log(records[0].get('abbr'));
					}
					
					//NOTOK'beforeselect': 
					//USELESS 'beforeshow': function() {console.log('beforeshow');},
				}				
				//FAILfaitrien select: function(){champ_pour_input_wms1.lastQuery = null;console.log('select');},
            }, base));
            noglob_table_input_param.push(champ_pour_input_wms1);
			console.log('ajout wms 1');
            if (noglob_table_L_input_wms.length == 1) {
                //noglob_table_input_param.push(warningMsg_wms);
            }
        }

        if (noglob_table_L_input_wms.length >= 2) {
            var FIELD_WIDTH = 60,
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
            champ_pour_input_wms2 = new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[1]),
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[1]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
            }, base));
            noglob_table_input_param.push(champ_pour_input_wms2);
            if (noglob_table_L_input_wms.length == 2) {
                //noglob_table_input_param.push(warningMsg_wms);
            }
        }

        if (noglob_table_L_input_wms.length >= 3) {
            var FIELD_WIDTH = 60,
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
            champ_pour_input_wms3 = new Ext.form.ComboBox(Ext.apply({
                name: "wms",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[2]),
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[2]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
            }, base));
            noglob_table_input_param.push(champ_pour_input_wms3);
            if (noglob_table_L_input_wms.length == 3) {
                //noglob_table_input_param.push(warningMsg_wms);
            }
        }
        if (noglob_table_L_input_wms.length >= 4) {
            var FIELD_WIDTH = 60,
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
            champ_pour_input_wms4 = new Ext.form.ComboBox(Ext.apply({
                name: "Image_ref",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[3]),
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[3]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
            }, base));
            noglob_table_input_param.push(champ_pour_input_wms4);
            if (noglob_table_L_input_wms.length == 4) {
                //noglob_table_input_param.push(warningMsg_wms);
            }
        }
        if (noglob_table_L_input_wms.length >= 5) {
            var FIELD_WIDTH = 60,
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
            champ_pour_input_wms5 = new Ext.form.ComboBox(Ext.apply({
                name: "Image_ref",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[4]),
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[4]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
            }, base));
            noglob_table_input_param.push(champ_pour_input_wms5);
            if (noglob_table_L_input_wms.length == 5) {
                //noglob_table_input_param.push(warningMsg_wms);
            }
        }

        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
        if (noglob_wmsAbstract.length >= 1) {
			// OR
			
			champ_pour_input_scroll1 = new Ext.form.ComboBox(Ext.apply({
			//xtype:'combo',
				width: 200, // line 1203
			   fieldLabel:OpenLayers.i18n(noglob_scrollTitle[0]),
			   name:'division',
			   //valueField: 'division',
			   //queryMode:'local',
			   store:[noglob_scroll_allowedValues[0][0],noglob_scroll_allowedValues[0][1]], // ['A','B']
			   editable: false,
			   //displayField:'division',
			   triggerAction:'all',
			   //FAILlabelWidth: 10,
			   //listWidth: 150,
			   //autoSelect:true,
			   //forceSelection:true
						}, base));	
			
			//
			/*
            champ_pour_input_scroll1 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(noglob_scrollTitle[0]),
                value: "Par defaut",
                width: 95,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: noglob_scroll_allowedValues[0]
                })
            }, base));
			*/
			//
            noglob_table_input_param.push(champ_pour_input_scroll1);
        }
        if (noglob_wmsAbstract.length >= 2) {

	                        champ_pour_input_scroll2 = new Ext.form.ComboBox(Ext.apply({
                        //xtype:'combo',
                                width: 200, // line 1203
                           fieldLabel:OpenLayers.i18n(noglob_scrollTitle[1]),
                           name:'division',
                           //valueField: 'division',
                           //queryMode:'local',
                           store:[noglob_scroll_allowedValues[1][0],noglob_scroll_allowedValues[1][1],noglob_scroll_allowedValues[1][2]], // ['A','B']
                           editable: false,
                           //displayField:'division',
                           triggerAction:'all',
                           //FAILlabelWidth: 10,
                           //listWidth: 150,
                           //autoSelect:true,
                           //forceSelection:true
                                                }, base));
            /*champ_pour_input_scroll2 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(noglob_scrollTitle[1]),
                value: "Par defaut",
                width: 95,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: noglob_scroll_allowedValues[1]
                })
            }, base));
		*/
            noglob_table_input_param.push(champ_pour_input_scroll2);
        }
        if (noglob_wmsAbstract.length >= 3) {
            champ_pour_input_scroll3 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(noglob_scrollTitle[2]),
                value: "Par defaut",
                width: 95,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: noglob_scroll_allowedValues[2]
                })
            }, base));
            noglob_table_input_param.push(champ_pour_input_scroll3);
        }
        if (noglob_wmsAbstract.length >= 4) {
            champ_pour_input_scroll4 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(noglob_scrollTitle[3]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: noglob_scroll_allowedValues[3]
                })
            }, base));
            noglob_table_input_param.push(champ_pour_input_scroll4);
        }
        if (noglob_wmsAbstract.length >= 5) {
            champ_pour_input_scroll5 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(noglob_scrollTitle[4]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: noglob_scroll_allowedValues[4]
                })
            }, base));
            noglob_table_input_param.push(champ_pour_input_scroll5);
        }

        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
        tmp_noglob_table_C_input_gml = [];
        if (noglob_table_C_input_gml.length >= 1) {
            var fifoo1 = {
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                noglob_listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            noglob_gmlValue1 = e.target.result;
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
            tmp_noglob_table_C_input_gml.push(fifoo1);
        }

        if (noglob_table_C_input_gml.length >= 2) {
            var fifoo2 = {
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                noglob_listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            noglob_gmlValue2 = e.target.result;
                            if (myfilename.search('.gml') != -1) {
                                //
                            } else {
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
            tmp_noglob_table_C_input_gml.push(fifoo2);
        }

        if (noglob_table_C_input_gml.length >= 3) {
            var fifoo3 = {
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                noglob_listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            noglob_gmlValue3 = e.target.result;
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
            tmp_noglob_table_C_input_gml.push(fifoo3);
        }
        if (noglob_table_C_input_gml.length >= 4) {
            var fifoo4 = {
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                noglob_listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            noglob_gmlValue4 = e.target.result;
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
            tmp_noglob_table_C_input_gml.push(fifoo4);
        }
        if (noglob_table_C_input_gml.length >= 5) {
            var fifoo5 = {
                xtype: 'fileuploadfield',
                emptyText: "Sélectionnez un GML.",
                allowBlank: false,
                hideLabel: true,
                buttonText: '',
                noglob_listeners: {
                    'fileselected': function(fb, v) {
                        file = fb.fileInput.dom.files[0];
                        myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            noglob_gmlValue5 = e.target.result;
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
            tmp_noglob_table_C_input_gml.push(fifoo5);
        }

        // PART 2 GML Window
        var fileWindow;
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: true,
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                tmp_noglob_table_C_input_gml,
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
                    if (log_coord == 1) {
                        noglob_coordxyValue1 = lonlat.lat;
                        alert("Input 1 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 2) {
                        noglob_coordxyValue2 = lonlat.lat;
                        alert("Input 2 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 3) {
                        noglob_coordxyValue3 = lonlat.lat;
                        alert("Input 3 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 4) {
                        noglob_coordxyValue4 = lonlat.lat;
                        alert("Input 4 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 5) {
                        noglob_coordxyValue5 = lonlat.lat;
                        alert("Input 5 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
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

        if (noglob_table_L_input_coordxy.length >= 1) {
            champ_pour_input_coordxy1 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(noglob_coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 1;
                },
                scope: this
            });
            noglob_table_input_param.push(champ_pour_input_coordxy1);
        }
        if (noglob_table_L_input_coordxy.length >= 2) {
            champ_pour_input_coordxy2 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(noglob_coordxyTitle[1]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 2;
                },
                scope: this
            });
            noglob_table_input_param.push(champ_pour_input_coordxy2);
        }
        if (noglob_table_L_input_coordxy.length >= 3) {
            champ_pour_input_coordxy3 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(noglob_coordxyTitle[2]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 3;
                },
                scope: this
            });
            noglob_table_input_param.push(champ_pour_input_coordxy3);
        }
        if (noglob_table_L_input_coordxy.length >= 4) {
            champ_pour_input_coordxy4 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(noglob_coordxyTitle[3]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 4;
                },
                scope: this
            });
            noglob_table_input_param.push(champ_pour_input_coordxy4);
        }
        if (noglob_table_L_input_coordxy.length >= 5) {
            champ_pour_input_coordxy5 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(noglob_coordxyTitle[4]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 5;
                },
                scope: this
            });
            noglob_table_input_param.push(champ_pour_input_coordxy5);
        }
        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
		//noglob_wmsTitle.push(L_input_wms1_name.title);
		//console.log(noglob_table_L_input_checkbox);
		for (i = 1; i <= noglob_table_L_input_checkbox.length; i++) {
		//if (noglob_table_L_input_checkbox.length >= 1) {   
			noglob_champ_pour_input_checkbox[i] = new Ext.form.Checkbox({
					boxLabel: noglob_checkboxTitle[i-1],
					id: 'checkbox'+i,
					width: 300,
					xtype: 'checkbox',
					fieldLabel: noglob_checkboxTitle[i-1]//fieldLabel: "Input"+i+"  (checkbox)"
					,checked: true
            });
            //noglob_table_input_param.push(noglob_champ_pour_input_checkbox[i]);
			if (i <= 6) {
			noglob_table_input_param_splitPanel1.push(noglob_champ_pour_input_checkbox[i]);
			}
			else {
			noglob_table_input_param_splitPanel2.push(noglob_champ_pour_input_checkbox[i]);
			}
		}
		//console.log(noglob_table_input_param);
		/*if (noglob_table_L_input_checkbox.length >= 2) {   	
            this.noglob_champ_pour_input_checkbox2 = new Ext.form.Checkbox({
					id: 'checkbox2',
					width: 200,
					xtype: 'checkbox',
					fieldLabel: "Input 2 (checkbox)"
					,checked: true
            });
            noglob_table_input_param.push(this.noglob_champ_pour_input_checkbox2);
		}*/
        // ----------------------------------------------------------------------
        // Tab (in progress)
        // ----------------------------------------------------------------------		
        var onglet2 = {
            title: OpenLayers.i18n("Selectionner les indicateurs a calculer sur les parcelles "),
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
                    /*champ_pour_input_scroll1,
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
                labelWidth: 150,
                bodyStyle: "padding:10px;",
                items: [
                    noglob_table_input_param,
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
							   console.log('HEAAAAAAAAAAAAAAAAAAAA4');
							   noglob_table_input_param.splice(i, 1);
							}}
						console.log(noglob_table_input_param);
						
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
			onglet2,onglet3,
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
				hide:this.destroylol,
				scope:this
			},			
        });
		// Fonctionne, car ajoute avant le return noglob_myPanel
		
		// Permet de faire l'update 
		//passursiutile noglob_regionContent.doLayout();		
		//		
		return noglob_myPanel;
		
    },
    /** -----------------------------------------------------------------------------
        ExecuteWpsTimer 	
        ----------------------------------------------------------------------------- */
    // Send the input fields in the window
    ExecuteWpsTimer: function() {
        mask_loader.show();
		// Test // Fail noglob_myPanel is not defined 
		//noglob_myPanel.body.update('Changed on load!');
		//noglob_myPanel.update('Changed on load!');
		//
        // ----------------------------------------------------------------------
        // Inputs Param
        // ----------------------------------------------------------------------
		noglob_tableList_input_forXml = [];
        if (noglob_table_L_input_param.length >= 1) { // est important pour le message d'erreur si champs vide
            var input_param1_fromPythonValue = this.champ_pour_input_param1.getValue();
            var L_input_param1_forXml = {
                identifier: "L_input_param1",
                data: {
                    literalData: {
                        value: input_param1_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_param1_forXml);
        }
        if (noglob_table_L_input_param.length >= 2) {
            var input_param2_fromPythonValue = this.champ_pour_input_param2.getValue();
            var L_input_param2_forXml = {
                identifier: "L_input_param2",
                data: {
                    literalData: {
                        value: input_param2_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_param2_forXml);
        }
        if (noglob_table_L_input_param.length >= 3) {
            var input_param3_fromPythonValue = this.champ_pour_input_param3.getValue();
            var L_input_param3_forXml = {
                identifier: "L_input_param3",
                data: {
                    literalData: {
                        value: input_param3_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_param3_forXml);
        }
        if (noglob_table_L_input_param.length >= 4) {
            var input_param4_fromPythonValue = this.champ_pour_input_param4.getValue();
            var L_input_param4_forXml = {
                identifier: "L_input_param4",
                data: {
                    literalData: {
                        value: input_param4_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_param4_forXml);
        }
        if (noglob_table_L_input_param.length >= 5) {
            var input_param5_fromPythonValue = this.champ_pour_input_param5.getValue();
            var L_input_param5_forXml = {
                identifier: "L_input_param5",
                data: {
                    literalData: {
                        value: input_param5_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_param5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs WMS
        // ----------------------------------------------------------------------
        if (noglob_table_L_input_wms.length >= 1 ){ //&& champ_pour_input_wms1.getValue() !== "") {
			if (champ_pour_input_wms1.getValue() !== "") {
				var L_input_wms1_getValue = champ_pour_input_wms1.getValue(); 
				var L_input_wms1_WMS_URL = L_input_wms1_getValue.data.WFS_URL;
				var L_input_wms1_WMS_typeName = L_input_wms1_getValue.data.WFS_typeName;
				var L_input_wms1_WMS_typeName = L_input_wms1_WMS_URL + L_input_wms1_WMS_typeName;
				var L_input_WMS1_forXml = {
					identifier: "L_input_wms1",
					data: {
						literalData: {
							value: L_input_wms1_WMS_typeName
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS1_forXml);
			}
			if (champ_pour_input_wms1.getValue() == "") {
				var L_input_WMS1_forXml = {
					identifier: "L_input_wms1",
					data: {
						literalData: {
							value: "nulllol"
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS1_forXml);
				console.log("emptywms1")
			}
		}
        if (noglob_table_L_input_wms.length >= 2 ){ //&& champ_pour_input_wms1.getValue() !== "") {
			if (champ_pour_input_wms2.getValue() !== "") {
				var L_input_wms2_getValue = champ_pour_input_wms2.getValue(); 
				var L_input_wms2_WMS_URL = L_input_wms2_getValue.data.WFS_URL;
				var L_input_wms2_WMS_typeName = L_input_wms2_getValue.data.WFS_typeName;
				var L_input_wms2_WMS_typeName = L_input_wms2_WMS_URL + L_input_wms2_WMS_typeName;
				var L_input_WMS2_forXml = {
					identifier: "L_input_wms2",
					data: {
						literalData: {
							value: L_input_wms2_WMS_typeName
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS2_forXml);
			}
			if (champ_pour_input_wms2.getValue() == "") {
				var L_input_WMS2_forXml = {
					identifier: "L_input_wms2",
					data: {
						literalData: {
							value: "nulllol"
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS2_forXml);
				console.log("emptywms2")
			}
		}
        if (noglob_table_L_input_wms.length >= 3 ){ //&& champ_pour_input_wms1.getValue() !== "") {
			if (champ_pour_input_wms3.getValue() !== "") {
				var L_input_wms3_getValue = champ_pour_input_wms3.getValue(); 
				var L_input_wms3_WMS_URL = L_input_wms3_getValue.data.WFS_URL;
				var L_input_wms3_WMS_typeName = L_input_wms3_getValue.data.WFS_typeName;
				var L_input_wms3_WMS_typeName = L_input_wms3_WMS_URL + L_input_wms3_WMS_typeName;
				var L_input_WMS3_forXml = {
					identifier: "L_input_wms3",
					data: {
						literalData: {
							value: L_input_wms3_WMS_typeName
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS3_forXml);
			}
			if (champ_pour_input_wms3.getValue() == "") {
				var L_input_WMS3_forXml = {
					identifier: "L_input_wms3",
					data: {
						literalData: {
							value: "nulllol"
						}
					}
				}
				noglob_tableList_input_forXml.push(L_input_WMS3_forXml);
				console.log("emptywms3")
			}
		}
        if (noglob_table_L_input_wms.length >= 4 && champ_pour_input_wms4.getValue() !== "") {
            var L_input_wms4_getValue = champ_pour_input_wms4.getValue();
            var L_input_wms4_WMS_URL = L_input_wms4_getValue.data.WFS_URL;
            var L_input_wms4_WMS_typeName = L_input_wms4_getValue.data.WFS_typeName;
            var L_input_WMS4_forXml = {
                identifier: "L_input_wms4",
                data: {
                    literalData: {
                        value: L_input_wms4_WMS_typeName
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_WMS4_forXml);
        }
        if (noglob_table_L_input_wms.length >= 5 && champ_pour_input_wms5.getValue() !== "") {
            var L_input_wms5_getValue = champ_pour_input_wms5.getValue();
            var L_input_wms5_WMS_URL = L_input_wms5_getValue.data.WFS_URL;
            var L_input_wms5_WMS_typeName = L_input_wms5_getValue.data.WFS_typeName;
            var L_input_WMS5_forXml = {
                identifier: "L_input_wms5",
                data: {
                    literalData: {
                        value: L_input_wms5_WMS_typeName
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_WMS5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs Combobox
        // ----------------------------------------------------------------------
        if (noglob_wmsAbstract.length >= 0) {
            if (noglob_wmsAbstract.length >= 1 && champ_pour_input_scroll1.getValue() !== "") {
                var L_input_scroll1_getValue = champ_pour_input_scroll1.getValue();
                var L_input_scroll1_forXml = {
                    identifier: "L_input_scroll1",
                    data: {
                        literalData: {
                            value: L_input_scroll1_getValue
                        }
                    }
                }
                noglob_tableList_input_forXml.push(L_input_scroll1_forXml);
            }
            if (noglob_wmsAbstract.length >= 2 && champ_pour_input_scroll2.getValue() !== "") {
                var L_input_scroll2_getValue = champ_pour_input_scroll2.getValue();
                var L_input_scroll2_forXml = {
                    identifier: "L_input_scroll2",
                    data: {
                        literalData: {
                            value: L_input_scroll2_getValue
                        }
                    }
                }
                noglob_tableList_input_forXml.push(L_input_scroll2_forXml);
            }
            if (noglob_wmsAbstract.length >= 3 && champ_pour_input_scroll3.getValue() !== "") {
                var L_input_scroll3_getValue = champ_pour_input_scroll3.getValue();
                var L_input_scroll3_forXml = {
                    identifier: "L_input_scroll3",
                    data: {
                        literalData: {
                            value: L_input_scroll3_getValue
                        }
                    }
                }
                noglob_tableList_input_forXml.push(L_input_scroll3_forXml);
            }
            if (noglob_wmsAbstract.length >= 4 && champ_pour_input_scroll4.getValue() !== "") {
                var L_input_scroll4_getValue = champ_pour_input_scroll4.getValue();
                var L_input_scroll4_forXml = {
                    identifier: "L_input_scroll4",
                    data: {
                        literalData: {
                            value: L_input_scroll4_getValue
                        }
                    }
                }
                noglob_tableList_input_forXml.push(L_input_scroll4_forXml);
            }
            if (noglob_wmsAbstract.length >= 5 && champ_pour_input_scroll5.getValue() !== "") {
                var L_input_scroll5_getValue = champ_pour_input_scroll5.getValue();
                var L_input_scroll5_forXml = {
                    identifier: "L_input_scroll5",
                    data: {
                        literalData: {
                            value: L_input_scroll5_getValue
                        }
                    }
                }
                noglob_tableList_input_forXml.push(L_input_scroll5_forXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs Coordinates
        // ----------------------------------------------------------------------
        if (noglob_table_L_input_coordxy.length >= 1 && typeof(noglob_coordxyValue1) != "undefined") {
            var L_input_coordxy1_forXml = {
                identifier: "L_input_coordxy1",
                data: {
                    literalData: {
                        value: noglob_coordxyValue1
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_coordxy1_forXml);
        }
        if (noglob_table_L_input_coordxy.length >= 2 && typeof(noglob_coordxyValue2) != "undefined") {
            var L_input_coordxy2_forXml = {
                identifier: "L_input_coordxy2",
                data: {
                    literalData: {
                        value: noglob_coordxyValue2
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_coordxy2_forXml);
        }
        if (noglob_table_L_input_coordxy.length >= 3 && typeof(noglob_coordxyValue3) != "undefined") {
            var L_input_coordxy3_forXml = {
                identifier: "L_input_coordxy3",
                data: {
                    literalData: {
                        value: noglob_coordxyValue3
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_coordxy3_forXml);
        }
        if (noglob_table_L_input_coordxy.length >= 4 && typeof(noglob_coordxyValue4) != "undefined") {
            var L_input_coordxy4_forXml = {
                identifier: "L_input_coordxy4",
                data: {
                    literalData: {
                        value: noglob_coordxyValue4
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_coordxy4_forXml);
        }
        if (noglob_table_L_input_coordxy.length >= 5 && typeof(noglob_coordxyValue5) != "undefined") {
            var L_input_coordxy5_forXml = {
                identifier: "L_input_coordxy5",
                data: {
                    literalData: {
                        value: noglob_coordxyValue5
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_coordxy5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs GML
        // ----------------------------------------------------------------------
        if (noglob_table_C_input_gml.length >= 1 && typeof(noglob_gmlValue1) != "undefined") {
            //console.log(noglob_gmlValue1);
            var L_input_gml1_forXml = {
                identifier: "C_input_gml1",
                data: {
                    complexData: {
                        value: noglob_gmlValue1
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_gml1_forXml);
        }
        if (noglob_table_C_input_gml.length >= 2 && typeof(noglob_gmlValue2) != "undefined") {
            var L_input_gml2_forXml = {
                identifier: "C_input_gml2",
                data: {
                    complexData: {
                        value: noglob_gmlValue2
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_gml2_forXml);
        }
        if (noglob_table_C_input_gml.length >= 3 && typeof(noglob_gmlValue3) != "undefined") {
            var L_input_gml3_forXml = {
                identifier: "C_input_gml3",
                data: {
                    complexData: {
                        value: noglob_gmlValue3
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_gml3_forXml);
        }
        if (noglob_table_C_input_gml.length >= 4 && typeof(noglob_gmlValue4) != "undefined") {
            var L_input_gml4_forXml = {
                identifier: "C_input_gml4",
                data: {
                    complexData: {
                        value: noglob_gmlValue4
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_gml4_forXml);
        }
        if (noglob_table_C_input_gml.length >= 5 && typeof(noglob_gmlValue5) != "undefined") {
            var L_input_gml5_forXml = {
                identifier: "C_input_gml5",
                data: {
                    complexData: {
                        value: noglob_gmlValue5
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_gml5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs Checkbox
        // ----------------------------------------------------------------------
        for (i = 1; i <= noglob_table_L_input_checkbox.length; i++) {
		//if (noglob_table_L_input_checkbox.length >= 1) { // est important pour le message d'erreur si champs vide
            var input_checkbox1_fromPythonValue = noglob_champ_pour_input_checkbox[i].getValue();
            var L_input_checkbox1_forXml = {
                identifier: "L_input_checkbox"+i,
                data: {
                    literalData: {
                        value: input_checkbox1_fromPythonValue
                    }
                }
            }
            noglob_tableList_input_forXml.push(L_input_checkbox1_forXml);
        }

		
        // Test if all fields are filled (except those by default)
        var champs_restant = noglob_numberOfInputs - noglob_tableList_input_forXml.length;
        if (noglob_numberOfInputs == noglob_tableList_input_forXml.length) { //noglob_numberOfInputswithoutwms

            // ----------------------------------------------------------------------
            // Outputs WMS
            // ----------------------------------------------------------------------
            tableList_output_forXml = [];
            if (noglob_table_L_output_wms.length >= 1) {
                L_output_wms1_forXml = {
                    asReference: false,
                    identifier: "L_output_wms1"
                }; //console.log("testOwms1");
                tableList_output_forXml.push(L_output_wms1_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (noglob_table_L_output_wms.length >= 2) {
                L_output_wms2_forXml = {
                    asReference: false,
                    identifier: "L_output_wms2"
                }; //console.log("testOwms2");
                tableList_output_forXml.push(L_output_wms2_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (noglob_table_L_output_wms.length >= 3) {
                L_output_wms3_forXml = {
                    asReference: false,
                    identifier: "L_output_wms3"
                }; //console.log("testOwms3");
                tableList_output_forXml.push(L_output_wms3_forXml); //console.log(tableList_output_forXml[0]);
            }

            // ----------------------------------------------------------------------
            // Outputs Param
            // ----------------------------------------------------------------------
            //console.log(noglob_table_L_output_param.length);
            if (noglob_table_L_output_param.length >= 1) {
                console.log('test noglob_table_L_output_param ok');
                L_output_param1_forXml = {
                    asReference: false,
                    identifier: "L_output_param1"
                }; //console.log("testOwms1");
                tableList_output_forXml.push(L_output_param1_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (noglob_table_L_output_param.length >= 2) {
                L_output_param2_forXml = {
                    asReference: false,
                    identifier: "L_output_param2"
                }; //console.log("testOwms2");
                tableList_output_forXml.push(L_output_param2_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (noglob_table_L_output_param.length >= 3) {
                L_output_param3_forXml = {
                    asReference: false,
                    identifier: "L_output_param3"
                };
                tableList_output_forXml.push(L_output_param33_forXml); //console.log(tableList_output_forXml[0]);
            }

            // ----------------------------------------------------------------------
            // Sends the query
            // ----------------------------------------------------------------------
            console.log("Une requête XML a été envoyée : ");

            var wpsFormat = new OpenLayers.Format.WPSExecute();
            // Creation de la requete XML
            var xmlString = wpsFormat.write({
                identifier: WPS_identifier,
                dataInputs: noglob_tableList_input_forXml,
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
            console.log(xmlString);

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
		console.log(map);
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
            var procOutputsDom = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(dom, wpsNS, "ProcessOutputs"); //console.log(procOutputsDom);

            // Stocke les objets outputs dans outputs, s'ils existent (length)
            var outputs = null; // Initialise la variable
            if (procOutputsDom.length) {
                outputs = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(procOutputsDom[0], wpsNS, "Output");
            } // La var outputs contient tout les objets outputs
            for (var i = 0; i < numberOfOutputs; i++) { // Invariable
                var identifier = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], owsNS, "Identifier")[0].firstChild.nodeValue; // L_output_wms1
                var literalData = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], wpsNS, "LiteralData"); //console.log(literalData[0].firstChild.nodeValue); //http://sdi.georchestra.org/geoserver/wfs?savoie:savoie

                // ----------------------------------------------------------------------
                // Outputs WMS 
                // ----------------------------------------------------------------------
                // Recover data from the output sent by the PyWPS server
                if (identifier == "L_output_wms1") {
                    client_L_output_wms1 = literalData[0].firstChild.nodeValue;
                    //console.log(client_L_output_wms1);
                }
                if (identifier == "L_output_wms2") {
                    client_L_output_wms2 = literalData[0].firstChild.nodeValue;
                    //console.log(client_L_output_wms2);
                }
                if (identifier == "L_output_wms3") {
                    client_L_output_wms3 = literalData[0].firstChild.nodeValue;
                    //console.log(client_L_output_wms3);
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
		console.log(map);
        // ----------------------------------------------------------------------
        // Add WMS layer 
        // ----------------------------------------------------------------------
        // PART 1 : Load wms layer from recovered data	
        GEOR.waiter.show(); // Barre bleu de chargement
        if (noglob_table_L_output_wms.length >= 1) { // et si non vide
			//console.log("wms ok")		
            // client_L_output_wms1 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse = client_L_output_wms1.substring(client_L_output_wms1.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse = client_L_output_wms1.substr(0, client_L_output_wms1.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
			//console.log(layerNameparse);
			//console.log(layerUrlparse);
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse);
            console.log("    - Nom : " + layerNameparse); //console.log("    - Entrepot :"+entrepotName);		
			/*
			var layerUrlparse = "http://91.121.171.75:8080/geoserver/wms";
			var layerNameparse = 'jvh:RS_topology2154';
			*/
			
			//console.log(layerStore);
			
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
					//FAILlayerStore.addLayer(clone);

					
		// PART 2.2 : Zoom sur le premier wms charge
					//console.log(clone.get("layer"));console.log(clone.get('layer').map);console.log(clone.get('bbox'));	console.log(clone.get('llbbox')); console.log(mapforzoom.getProjectionObject());
					var mapforzoom = clone.get('layer').map ; 
					bb = clone.get('bbox');											
					//GOOD mapforzoom.zoomToExtent(bboxlol); // ATTENTION a lui donner un array et pas un string ("","","","") exemple : var bboxlol = ["372528","5385155","374112","5386725"];					
					var llbbox = OpenLayers.Bounds.fromArray(clone.get('llbbox')); console.log (llbbox);
					var getproj = mapforzoom.getProjectionObject(); console.log(getproj);
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
			//console.log("wms ok")		
            // client_L_output_wms2 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse2 = client_L_output_wms2.substring(client_L_output_wms2.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse2 = client_L_output_wms2.substr(0, client_L_output_wms2.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
			//console.log(layerNameparse);
			//console.log(layerUrlparse);
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
			//console.log(layerStore);
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
			//console.log(layerStore);
			//FAIL IS NOT A FUNCTION var huhu = GEOR.wmc.writeWmcContext(layerStore);
			/*
			var huhu = GEOR.wmc; //  ok
			console.log(huhu);
			var huhu2 = GEOR.wmc.write; //  ok
			console.log(huhu2);
			var huhu3 = GEOR.wmc.write(layerStore); //  ok
			console.log(huhu3);
			*/
			var huhu5 = GEOR.wmc.write(layerStore); //  ok
			console.log(huhu5);
			// ls not defined console.log(ls);
			var huhu6 = GEOR.map.create;
			console.log(huhu6);
			//console.log(ls);
        }
		/*
        if (noglob_table_L_output_wms.length >= 2) {
            var layerNameparse2 = client_L_output_wms2.substring(client_L_output_wms2.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse2 = client_L_output_wms2.substr(0, client_L_output_wms2.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse2);
            console.log("    - Nom : " + layerNameparse2); //console.log("    - Entrepot :"+entrepotName);
            var wmsdyn = new OpenLayers.Layer.WMS(
                "OpenLayers WMS",
                layerUrlparse2, {
                    layers: layerNameparse2,
                    transparent: true
                });
            // L'equivalent sur mapfish de map.addLayer(wms) sur openlayers;
            var c = GEOR.util.createRecordType();
            var layerRecord = new c({
                layer: wmsdyn,
                name: layerNameparse2,
                type: "WMS"
            });
            var clone = layerRecord.clone();

            GEOR.ows.hydrateLayerRecord(clone, {
                success: function() {
                    clone.get("layer").setName(clone.get("title"));
                    layerStore.addSorted(clone);
                    //zoomToLayerRecExtent(clone);
                    GEOR.waiter.hide();
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
        if (noglob_table_L_output_wms.length >= 3) {
            var layerNameparse3 = client_L_output_wms3.substring(client_L_output_wms3.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse3 = client_L_output_wms3.substr(0, client_L_output_wms3.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse3);
            console.log("    - Nom : " + layerNameparse3); //console.log("    - Entrepot :"+entrepotName);
            // Ajout du WMS
            var wmsdyn = new OpenLayers.Layer.WMS(
                "OpenLayers WMS",
                layerUrlparse3, {
                    layers: layerNameparse3,
                    transparent: true
                });
            // L'equivalent sur mapfish de map.addLayer(wms) sur openlayers;

            var c = GEOR.util.createRecordType();
            var layerRecord = new c({
                layer: wmsdyn,
                name: layerNameparse3,
                type: "WMS"
            });
            var clone = layerRecord.clone();

            GEOR.ows.hydrateLayerRecord(clone, {
                success: function() {
                    clone.get("layer").setName(clone.get("title"));
                    layerStore.addSorted(clone);
                    //zoomToLayerRecExtent(clone);
                    GEOR.waiter.hide();
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
		*/
        // ----------------------------------------------------------------------
        // Display output settings on the client side
        // ----------------------------------------------------------------------		
        //GEOR.util.infoDialog({msg: "TAPOUE"});
		////	noglob_myPanel.hide();//FAIL this.win.hide();this.win.show();
        // ----------------------------------------------------------------------
        // Update panel 
        // ----------------------------------------------------------------------
			someText = client_L_output_param1.replace(/(\r\n|\n|\r)/gm,"<br>");
			noglob_regionContent.update(someText);//works: noglob_regionContent.update('poulout');
	
			//FAIL noglob_regionContent.update(pageUne);
			//noglob_regionContent.doLayout();
			console.log(client_L_output_param1);
			console.log(someText);
			noglob_myPanel.show();
			GEOR.waiter.hide();
        // ----------------------------------------------------------------------
        // WMC
        // ----------------------------------------------------------------------
		console.log(new Date());
		// map sactualise tt le temps peu importe son placement dans le code, il faut donc faire le wmc que quand la somme des layers de map est egale aux wms attendu
		
		//for (i = 0; i < 100; i++) { 
		setTimeout(function() { // la fonction se declence 20 seconde apres ?
		console.log('hello');
		console.log(new Date());
			// Creation du WMC vierge
			var parserWMC = new OpenLayers.Format.WMC({
                layerOptions: {
                    // to prevent automatic restoring of PNG rather than JPEG:
                    noMagic: true
                }
            });
			console.log(parserWMC);
			// Ajout des couches 
			//map.addLayer(wmsdyn);
			console.log(layerStore);
			//FAIL NEFAITRIEN map2 = map;map2.addLayer(wmsdyn);
			//map.addLayer(wmsdyn2);
			// Creation du wmc a partir des couches ajoutees
			var writeWMC = parserWMC.write(this.map);
			//console.log(writeWMC);
			// Correction d'un bug mineur pour que les wms sonient correctement declares en queryable
			var writeWMCbis = writeWMC.replace('</Extension></Layer><Layer queryable="0"', '</Extension></Layer><Layer queryable="1"');
			//console.log(writeWMCbis);
			// Remplacement de la bounding box 3857 par du 2154
			//var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";alphabet = alphabet.replace(/H.*S/, 'HS');
			//alphabet2 = '<BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title/>';
			var writeWMCbisbis = writeWMCbis.replace(/General.*General/, 'General><Window width="1293" height="765" /><BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title /><Extension>  <ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-357823.236499999999" miny="5037008.69390000030" maxx="1313632.36280000000" maxy="7230727.37710000016" /></Extension></General');
			//var writeWMCbisbis = writeWMCbis.replace ("<BoundingBox","/><Title/>").replace('<BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title/>');
			console.log(writeWMCbisbis);
			
			layerStore2 = Ext.getCmp("mappanel").layers;	
			console.log(layerStore2);
			var huhu6 = GEOR.wmc.write(layerStore2); //  ok
			console.log(huhu6);
			},20250);
			//}
			console.log('sdsdsdsddssddgo');
// *-*-*
	console.log(map);
	console.log(this.map);
// *-*-*			
		//
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
	
	//showWindow(),//this.showWindow(), //this.showWindow,

    /** -----------------------------------------------------------------------------
        showWindow
        ----------------------------------------------------------------------------- */
    showWindow: function() {
        if (!this.win) {
            // N'affiche que le dernier
			//GEOR.util.infoDialog({msg: "Bienvenue sur arbreexu. <br> Un <b>tutoriel</b> est disponible, cliquez sur ce <A HREF='https://www.google.fr/' target='_blank'>lien</a> ou sur le bouton \"Aide\" situé en bas à gauche de votre écran."});
			this.win = this.createWindow();
			//this.win = this.createWindow2();
			
        }
        this.win.show();
    },

    /** -----------------------------------------------------------------------------
        destroy
        ----------------------------------------------------------------------------- */
    destroylol: function() {
		console.log('hide');
		//layer_noglob_liste_WFS = [];
		//console.log(layer_noglob_liste_WFS);
		//Failconsole.log(layer_noglob_liste_WFS.forms[0]);//Failconsole.log(layer_noglob_liste_WFS.firstChild);
		
		//noglob_addComboxFieldItemsWFS();
		
		//noglob_myPanel.hide();
		
		
		////
		/*
            champ_pour_input_wmsx1 = new Ext.form.ComboBox({
                name: "Image_reflol",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[0]), // marche pas ?
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[0]),
                width: 60,
				//plain: true,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
                    forceSelection: true,
                    editable: true,
                    allowBlank: true,
                    triggerAction: 'all',
					//value: 'Defaut', // afficher par defaut la premiere valeur
                    mode: 'local',
                    //labelSeparator: OpenLayers.i18n("labelSeparator"),
                    valueField: 'value',
                    displayField: 'text',
                    labelWidth: 10				
				//FAILfaitrien select: function(){champ_pour_input_wms1.lastQuery = null;console.log('select');},
            });

            champ_pour_input_wmsx2 = new Ext.form.ComboBox({
                name: "Image_reflol",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[1]), // marche pas ?
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[1]),
                width: 60,
				//plain: true,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
                    forceSelection: true,
                    editable: true,
                    allowBlank: true,
                    triggerAction: 'all',
					//FAILFAITRIEN lastQuery: '',
                    mode: 'local',
                    //labelSeparator: OpenLayers.i18n("labelSeparator"),
                    valueField: 'value',
                    displayField: 'text',
                    labelWidth: 10				
				//FAILfaitrien select: function(){champ_pour_input_wms1.lastQuery = null;console.log('select');},
            });

            champ_pour_input_wmsx3 = new Ext.form.ComboBox({
                name: "Image_reflol",
                fieldLabel: OpenLayers.i18n(noglob_wmsTitle[2]), // marche pas ?
                emptyText: OpenLayers.i18n(noglob_noglob_wmsAbstract[2]),
                width: 60,
				//plain: true,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_noglob_liste_WFS
                }),
                    forceSelection: true,
                    editable: true,
                    allowBlank: true,
                    triggerAction: 'all',
					//FAILFAITRIEN lastQuery: '',
                    mode: 'local',
                    //labelSeparator: OpenLayers.i18n("labelSeparator"),
                    valueField: 'value',
                    displayField: 'text',
                    labelWidth: 10				
				//FAILfaitrien select: function(){champ_pour_input_wms1.lastQuery = null;console.log('select');},
            });
			
		//noglob_regionContent.add(champ_pour_input_wmsx);		
		//GREAT http://uniapple.net/blog/?p=705		
		// Ca vient de linitialisation ?
		
		// remove ONE item
		var firstItem = Ext.getCmp('reportGraphArea').items.first();
		 Ext.getCmp('reportGraphArea').remove(firstItem,true);
		var firstItem2 = Ext.getCmp('reportGraphArea').items.first();
		 Ext.getCmp('reportGraphArea').remove(firstItem2,true);		 
		var firstItem3 = Ext.getCmp('reportGraphArea').items.first();
		 Ext.getCmp('reportGraphArea').remove(firstItem3,true);	
		var firstItem4 = Ext.getCmp('reportGraphArea').items.first();
		Ext.getCmp('reportGraphArea').remove(firstItem4,true);			 
		// remove ALL items
		//FAILacompletervar numItems = Ext.getCmp('reportGraphArea').items.getCount();
		//Ext.getCmp('reportGraphArea').remove(numItems,true);
		
		Ext.getCmp('reportGraphArea').add(champ_pour_input_wmsx1);
		Ext.getCmp('reportGraphArea').add(champ_pour_input_wmsx2);
		Ext.getCmp('reportGraphArea').add(champ_pour_input_wmsx3);
		
		console.log(noglob_tableList_input_forXml);
		*/
		////
		
		//this.win = this.createWindow();
		//noglob_myPanel.show();
		
		/*
		noglob_myPanel.add({
                    title       : 'Child number ',
					activate: true,
					region: 'south',
					collapsible: true,
					collapsed: false,
					split: true,
				   item : [champ_pour_input_wmsx]
                });
		*/		
				
		//noglob_myPanel.add(champ_pour_input_wmsx);
		//noglob_myPanel.doLayout();
		
		//onglet2.add(champ_pour_input_wmsx);
		
		//noglob_myPanel.show();
		//NEFAITRIEN champ_pour_input_wms1.bindStore(layer_noglob_liste_WFS);
		//console.log('hide');
		
		//NEFAITRIEN
		// this.store undefined : // champ_pour_input_wms1.bindStore("Image_ref");
		//champ_pour_input_wms1.store.removeAll();
		//champ_pour_input_wms1.lastQuery = null;
		//champ_pour_input_wms1.totalLength = 0;
		
		//champ_pour_input_wms1.bindStore(champ_pour_input_wms1);
		
		//http://www.sencha.com/forum/showthread.php?158528-ComboBox-reload-store
		
    },

//FAIL this.createWindow(), // this.createWindow(); // : SyntaxError: missing : after property id
//FAIL this.showWindow(); // this.showWindow(), // : SyntaxError: missing : after property id 
//FAIL showWindow();  // Fail showWindow(), // : SyntaxError: expected expression, got ','
};

console.log(GEOR.Addons.arbreexu.prototype);
