Ext.namespace("GEOR.Addons");

var numberOfInputs;
var table = [];
var tableOutputs = [];
var table_L_input_param = [];
var table_L_input_wms = [];
var wmsTitle = [];
var wmsAbstract = [];
var table_L_input_scroll = [];
var scrollTitle = [];
var scroll_allowedValues = [];
var table_L_input_coordxy = [];
var coordxyTitle = [];
var table_C_input_gml = [];
var coordxyValue1, coordxyValue2, coordxyValue3, coordxyValue4, coordxyValue5;
var gmlValue1, gmlValue2, gmlValue3, gmlValue4, gmlValue5;
var execute_on_off = 0;
var layer_liste_WFS = [];
var table_L_output_wms = [];
var table_L_output_param = [];
var table_L_input_checkbox = [];
var champ_pour_input_checkbox = [];
var checkboxTitle = [];

GEOR.Addons.bourdic_v2 = function(map, options) {
    this.map = map;
    this.options = options;
};

GEOR.Addons.bourdic_v2.prototype = {
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
                //Recovery of identifiers (ie the names of inputs) extracted from python and stores in the table "table"
                for (i in wpsProcess.dataInputs) { // List every input from the describe process query
                    table.push(wpsProcess.dataInputs[i].identifier); // Each input is added to the table
                }
                var index = table.indexOf(undefined);
                if (index > -1) {
                    table.splice(index, 1);
                } // Removing undefined values 
                numberOfInputs = table.length;
                for (i = 0; i < numberOfInputs; i++) {
                    switch (true) {
                        case (table[i].slice(0, 13) == "L_input_param"):
                            table_L_input_param.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_param");
                            break;
                        case (table[i].slice(0, 11) == "L_input_wms"):
                            table_L_input_wms.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_wms");
                            break;
                        case (table[i].slice(0, 14) == "L_input_scroll"):
                            table_L_input_scroll.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_scroll");
                            break;
                        case (table[i].slice(0, 15) == "L_input_coordxy"):
                            table_L_input_coordxy.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_coordxy");
                            break;
                        case (table[i].slice(0, 11) == "C_input_gml"):
                            table_C_input_gml.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_scroll");
                            break;
                        case (table[i].slice(0, 16) == "L_input_checkbox"):
                            table_L_input_checkbox.push(table[i]);
                            //console.log(table[i] + " est ajouté a table_L_input_scroll");
                            break;						
                    }
                }
                console.log("Le WPS utilise " + numberOfInputs + " input(s) : " + table);
                console.log("    - " + table_L_input_param.length + " input(s) de paramètre : " + table_L_input_param);
                console.log("    - " + table_L_input_wms.length + " input(s) de WMS : " + table_L_input_wms);
                console.log("    - " + table_L_input_scroll.length + " input(s) de scroll : " + table_L_input_scroll);
                console.log("    - " + table_L_input_coordxy.length + " input(s) de coordonnées xy : " + table_L_input_coordxy);
                console.log("    - " + table_C_input_gml.length + " input(s) de gml : " + table_C_input_gml);
				console.log("    - " + table_L_input_checkbox.length + " input(s) de checkbox : " + table_L_input_checkbox);
                // ----------------------------------------------------------------------
                // Course outputs
                // ----------------------------------------------------------------------
                // List the outputs included in the DescribeProcess query and store them in the table "tableOutputs"
                for (i in wpsProcess.processOutputs) {
                    tableOutputs.push(wpsProcess.processOutputs[i].identifier);
                }
                var indexoutputs = tableOutputs.indexOf(undefined);
                if (indexoutputs > -1) {
                    tableOutputs.splice(indexoutputs, 1);
                }
                //console.log(tableOutputs);
                numberOfOutputs = tableOutputs.length;
                //console.log(numberOfOutputs);
                for (i = 0; i < numberOfOutputs; i++) {
                    if (tableOutputs[i].slice(0, 12) == "L_output_wms") {
                        table_L_output_wms.push(tableOutputs[i]);
                        //console.log(tableOutputs[i]+" est ajouté a table_L_input_param");
                    } else if (tableOutputs[i].slice(0, 14) == "L_output_param") {
                        table_L_output_param.push(tableOutputs[i]);
                        //console.log(tableOutputs[i]+" est ajouté a table_L_input_param");
                    }
                }
                console.log("Le WPS retourne " + numberOfOutputs + " output(s) : " + tableOutputs);
                console.log("    - " + table_L_output_param.length + " output(s) de paramètre : " + table_L_output_param);
                console.log("    - " + table_L_output_wms.length + " output(s) de wms : " + table_L_output_wms);

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
        // If input_param exist (i.e. if table_L_input_param.length> 0) then activates a variable for each input		
        if (table_L_input_param.length >= 1) {
            var input_param1_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param1");
            wps_Config_param1 = {
                input_param1_fromPython: {
                    value: input_param1_fromPython.literalData.defaultValue,
                    title: input_param1_fromPython.title
                }
            };
        }
        if (table_L_input_param.length >= 2) {
            var input_param2_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param2");
            wps_Config_param2 = {
                input_param2_fromPython: {
                    value: (input_param2_fromPython.literalData.defaultValue) ? input_param2_fromPython.literalData.defaultValue : 5,
                    title: input_param2_fromPython.title
                }
            };
        }
        if (table_L_input_param.length >= 3) {
            var input_param3_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param3");
            wps_Config_param3 = {
                input_param3_fromPython: {
                    value: (input_param3_fromPython.literalData.defaultValue) ? input_param3_fromPython.literalData.defaultValue : 5,
                    title: input_param3_fromPython.title
                }
            };
        }
        if (table_L_input_param.length >= 4) {
            var input_param4_fromPython = findDataInputsByIdentifier(process.dataInputs, "L_input_param4");
            wps_Config_param4 = {
                input_param4_fromPython: {
                    value: (input_param4_fromPython.literalData.defaultValue) ? input_param4_fromPython.literalData.defaultValue : 5,
                    title: input_param4_fromPython.title
                }
            };
        }
        if (table_L_input_param.length >= 5) {
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
        if (table_L_input_wms.length >= 1) {
            var L_input_wms1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms1");
            wmsTitle.push(L_input_wms1_name.title);
            wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (table_L_input_wms.length >= 2) {
            var L_input_wms2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms2");
            wmsTitle.push(L_input_wms2_name.title);
            wmsAbstract.push(L_input_wms2_name.abstract);
        }
        if (table_L_input_wms.length >= 3) {
            var L_input_wms3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms3");
            wmsTitle.push(L_input_wms3_name.title);
            wmsAbstract.push(L_input_wms3_name.abstract);
        }
        if (table_L_input_wms.length >= 4) {
            var L_input_wms4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms4");
            wmsTitle.push(L_input_wms4_name.title);
            wmsAbstract.push(L_input_wms4_name.abstract);
        }
        if (table_L_input_wms.length >= 5) {
            var L_input_wms5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_wms5");
            wmsTitle.push(L_input_wms5_name.title);
            wmsAbstract.push(L_input_wms5_name.abstract);
        }

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        if (table_L_input_scroll.length >= 1) {
            var L_input_scroll1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll1");
            scrollTitle.push(L_input_scroll1_name.title);
            scroll1_allowedValues = [];
            for (var k in L_input_scroll1_name.literalData.allowedValues) {
                scroll1tmp_allowedValues = [];
                scroll1tmp_allowedValues.push(k);
                scroll1tmp_allowedValues.push(k);
                scroll1_allowedValues.push(scroll1tmp_allowedValues);
            }
            scroll_allowedValues.push(scroll1_allowedValues);
        }
        if (table_L_input_scroll.length >= 2) {
            var L_input_scroll2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll2");
            scrollTitle.push(L_input_scroll2_name.title);
            scroll2_allowedValues = [];
            for (var k in L_input_scroll2_name.literalData.allowedValues) {
                scroll2tmp_allowedValues = [];
                scroll2tmp_allowedValues.push(k);
                scroll2tmp_allowedValues.push(k);
                scroll2_allowedValues.push(scroll2tmp_allowedValues);
            }
            scroll_allowedValues.push(scroll2_allowedValues);
        }
        if (table_L_input_scroll.length >= 3) {
            var L_input_scroll3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll3");
            scrollTitle.push(L_input_scroll3_name.title);
            scroll3_allowedValues = [];
            for (var k in L_input_scroll3_name.literalData.allowedValues) {
                scroll3tmp_allowedValues = [];
                scroll3tmp_allowedValues.push(k);
                scroll3tmp_allowedValues.push(k);
                scroll3_allowedValues.push(scroll3tmp_allowedValues);
            }
            scroll_allowedValues.push(scroll3_allowedValues);
        }
        if (table_L_input_scroll.length >= 4) {
            var L_input_scroll4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll4");
            scrollTitle.push(L_input_scroll4_name.title);
            scroll4_allowedValues = [];
            for (var k in L_input_scroll4_name.literalData.allowedValues) {
                scroll4tmp_allowedValues = [];
                scroll4tmp_allowedValues.push(k);
                scroll4tmp_allowedValues.push(k);
                scroll4_allowedValues.push(scroll4tmp_allowedValues);
            }
            scroll_allowedValues.push(scroll4_allowedValues);
        }
        if (table_L_input_scroll.length >= 5) {
            var L_input_scroll5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_scroll5");
            scrollTitle.push(L_input_scroll5_name.title);
            scroll5_allowedValues = [];
            for (var k in L_input_scroll5_name.literalData.allowedValues) {
                scroll5tmp_allowedValues = [];
                scroll5tmp_allowedValues.push(k);
                scroll5tmp_allowedValues.push(k);
                scroll5_allowedValues.push(scroll5tmp_allowedValues);
            }
            scroll_allowedValues.push(scroll5_allowedValues);
        }

        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
        if (table_L_input_coordxy.length >= 1) {
            var L_input_coordxy1_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy1");
            coordxyTitle.push(L_input_coordxy1_name.title);
            //wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (table_L_input_coordxy.length >= 2) {
            var L_input_coordxy2_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy2");
            coordxyTitle.push(L_input_coordxy2_name.title);
            //wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (table_L_input_coordxy.length >= 3) {
            var L_input_coordxy3_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy3");
            coordxyTitle.push(L_input_coordxy3_name.title);
            //wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (table_L_input_coordxy.length >= 4) {
            var L_input_coordxy4_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy4");
            coordxyTitle.push(L_input_coordxy4_name.title);
            //wmsAbstract.push(L_input_wms1_name.abstract);
        }
        if (table_L_input_coordxy.length >= 5) {
            var L_input_coordxy5_name = findDataInputsByIdentifier(process.dataInputs, "L_input_coordxy5");
            coordxyTitle.push(L_input_coordxy5_name.title);
            //wmsAbstract.push(L_input_wms1_name.abstract);
        }
		
        // ----------------------------------------------------------------------
        // Data inputs Checkbox (title)
        // ----------------------------------------------------------------------		
		//if (table_L_input_checkbox.length >= 1) {
	    for (i = 1; i <= table_L_input_checkbox.length; i++) {	
    		var L_input_checkbox_name = findDataInputsByIdentifier(process.dataInputs, "L_input_checkbox"+i); console.log (L_input_checkbox_name);
			checkboxTitle.push(L_input_checkbox_name.title); console.log (checkboxTitle);
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
        var table_input_param = [];
		var table_input_param_splitPanel1 = [];
		var table_input_param_splitPanel2 = [];
        if (table_L_input_param.length >= 1) {
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
            table_input_param.push(this.champ_pour_input_param1);
        }
        if (table_L_input_param.length >= 2) {
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
            table_input_param.push(this.champ_pour_input_param2);
        }
        if (table_L_input_param.length >= 3) {
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
            table_input_param.push(this.champ_pour_input_param3);
        }
        if (table_L_input_param.length >= 4) {
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
            table_input_param.push(this.champ_pour_input_param4);
        }
        if (table_L_input_param.length >= 5) {
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
            table_input_param.push(this.champ_pour_input_param5);
        }
        // ----------------------------------------------------------------------
        // WMS inputs
        // ----------------------------------------------------------------------		       
        // PART 1 		
        var addComboxFieldItemsWFS = function() { // Fonctionne pour le WMS et WFS
            var empty = true;
            layerStore.each(function(record) {
                var layer = record.get('layer');
                var queryable = record.get('queryable');
                var hasEquivalentWFS = record.hasEquivalentWFS();
                if (queryable && hasEquivalentWFS) {
                    empty = false;

                    var ObjectRecordType = Ext.data.Record.create(['text', 'value']);
                    var rec = new ObjectRecordType({
                        text: layer.name,
                        value: record
                    })

                    var liste = [rec.data.text, rec.data.value];

                    layer_liste_WFS.push(liste);
                }
            });
        };
        addComboxFieldItemsWFS();
        warningMsg_wms = {
            border: false,
            html: '<img src="http://91.121.171.75/grey_warn.png"> Seuls les WMS déjà chargés avant la première ouverture de l\'addon seront utilisables.'
        };

        // PART 2
        if (table_L_input_wms.length >= 1) {
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

            champ_pour_input_wms1 = new Ext.form.ComboBox(Ext.apply({
                name: "Image_ref",
                fieldLabel: OpenLayers.i18n(wmsTitle[0]),
                emptyText: OpenLayers.i18n(wmsAbstract[0]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_liste_WFS
                }),
            }, base));
            table_input_param.push(champ_pour_input_wms1);
            if (table_L_input_wms.length == 1) {
                table_input_param.push(warningMsg_wms);
            }
        }

        if (table_L_input_wms.length >= 2) {
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
                name: "Image_ref",
                fieldLabel: OpenLayers.i18n(wmsTitle[1]),
                emptyText: OpenLayers.i18n(wmsAbstract[1]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_liste_WFS
                }),
            }, base));
            table_input_param.push(champ_pour_input_wms2);
            if (table_L_input_wms.length == 2) {
                table_input_param.push(warningMsg_wms);
            }
        }

        if (table_L_input_wms.length >= 3) {
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
                name: "Image_ref",
                fieldLabel: OpenLayers.i18n(wmsTitle[2]),
                emptyText: OpenLayers.i18n(wmsAbstract[2]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_liste_WFS
                }),
            }, base));
            table_input_param.push(champ_pour_input_wms3);
            if (table_L_input_wms.length == 3) {
                table_input_param.push(warningMsg_wms);
            }
        }
        if (table_L_input_wms.length >= 4) {
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
                fieldLabel: OpenLayers.i18n(wmsTitle[3]),
                emptyText: OpenLayers.i18n(wmsAbstract[3]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_liste_WFS
                }),
            }, base));
            table_input_param.push(champ_pour_input_wms4);
            if (table_L_input_wms.length == 4) {
                table_input_param.push(warningMsg_wms);
            }
        }
        if (table_L_input_wms.length >= 5) {
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
                fieldLabel: OpenLayers.i18n(wmsTitle[4]),
                emptyText: OpenLayers.i18n(wmsAbstract[4]),
                width: FIELD_WIDTH,
                store: new Ext.data.SimpleStore({
                    fields: ['text', 'value'],
                    data: layer_liste_WFS
                }),
            }, base));
            table_input_param.push(champ_pour_input_wms5);
            if (table_L_input_wms.length == 5) {
                table_input_param.push(warningMsg_wms);
            }
        }

        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
        if (table_L_input_scroll.length >= 1) {
            champ_pour_input_scroll1 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(scrollTitle[0]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: scroll_allowedValues[0]
                })
            }, base));
            table_input_param.push(champ_pour_input_scroll1);
        }
        if (table_L_input_scroll.length >= 2) {
            champ_pour_input_scroll2 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(scrollTitle[1]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: scroll_allowedValues[1]
                })
            }, base));
            table_input_param.push(champ_pour_input_scroll2);
        }
        if (table_L_input_scroll.length >= 3) {
            champ_pour_input_scroll3 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(scrollTitle[2]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: scroll_allowedValues[2]
                })
            }, base));
            table_input_param.push(champ_pour_input_scroll3);
        }
        if (table_L_input_scroll.length >= 4) {
            champ_pour_input_scroll4 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(scrollTitle[3]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: scroll_allowedValues[3]
                })
            }, base));
            table_input_param.push(champ_pour_input_scroll4);
        }
        if (table_L_input_scroll.length >= 5) {
            champ_pour_input_scroll5 = new Ext.form.ComboBox(Ext.apply({
                name: "Nscroll",
                fieldLabel: OpenLayers.i18n(scrollTitle[4]),
                value: "",
                width: 40,
                store: new Ext.data.SimpleStore({
                    fields: ['value', 'text'],
                    data: scroll_allowedValues[4]
                })
            }, base));
            table_input_param.push(champ_pour_input_scroll5);
        }

        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
        tmp_table_C_input_gml = [];
        if (table_C_input_gml.length >= 1) {
            var fifoo1 = {
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
                            gmlValue1 = e.target.result;
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
            tmp_table_C_input_gml.push(fifoo1);
        }

        if (table_C_input_gml.length >= 2) {
            var fifoo2 = {
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
                            gmlValue2 = e.target.result;
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
            tmp_table_C_input_gml.push(fifoo2);
        }

        if (table_C_input_gml.length >= 3) {
            var fifoo3 = {
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
                            gmlValue3 = e.target.result;
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
            tmp_table_C_input_gml.push(fifoo3);
        }
        if (table_C_input_gml.length >= 4) {
            var fifoo4 = {
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
                            gmlValue4 = e.target.result;
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
            tmp_table_C_input_gml.push(fifoo4);
        }
        if (table_C_input_gml.length >= 5) {
            var fifoo5 = {
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
                            gmlValue5 = e.target.result;
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
            tmp_table_C_input_gml.push(fifoo5);
        }

        // PART 2 GML Window
        var fileWindow;
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: true,
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                tmp_table_C_input_gml,
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
                        coordxyValue1 = lonlat.lat;
                        alert("Input 1 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 2) {
                        coordxyValue2 = lonlat.lat;
                        alert("Input 2 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 3) {
                        coordxyValue3 = lonlat.lat;
                        alert("Input 3 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 4) {
                        coordxyValue4 = lonlat.lat;
                        alert("Input 4 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
                        log_coord = 0;
                    }
                    if (log_coord == 5) {
                        coordxyValue5 = lonlat.lat;
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

        if (table_L_input_coordxy.length >= 1) {
            champ_pour_input_coordxy1 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 1;
                },
                scope: this
            });
            table_input_param.push(champ_pour_input_coordxy1);
        }
        if (table_L_input_coordxy.length >= 2) {
            champ_pour_input_coordxy2 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(coordxyTitle[1]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 2;
                },
                scope: this
            });
            table_input_param.push(champ_pour_input_coordxy2);
        }
        if (table_L_input_coordxy.length >= 3) {
            champ_pour_input_coordxy3 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(coordxyTitle[2]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 3;
                },
                scope: this
            });
            table_input_param.push(champ_pour_input_coordxy3);
        }
        if (table_L_input_coordxy.length >= 4) {
            champ_pour_input_coordxy4 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(coordxyTitle[3]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 4;
                },
                scope: this
            });
            table_input_param.push(champ_pour_input_coordxy4);
        }
        if (table_L_input_coordxy.length >= 5) {
            champ_pour_input_coordxy5 = new Ext.Button({
                iconCls: 'add_icon',
                text: OpenLayers.i18n(coordxyTitle[4]),
                style: 'padding-top:5px',
                handler: function() {
                    clickbv.activate();
                    log_coord = 5;
                },
                scope: this
            });
            table_input_param.push(champ_pour_input_coordxy5);
        }
        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
		//wmsTitle.push(L_input_wms1_name.title);
		//console.log(table_L_input_checkbox);
		for (i = 1; i <= table_L_input_checkbox.length; i++) {
		//if (table_L_input_checkbox.length >= 1) {   
			champ_pour_input_checkbox[i] = new Ext.form.Checkbox({
					boxLabel: checkboxTitle[i-1],
					id: 'checkbox'+i,
					width: 300,
					xtype: 'checkbox',
					fieldLabel: checkboxTitle[i-1]//fieldLabel: "Input"+i+"  (checkbox)"
					,checked: true
            });
            //table_input_param.push(champ_pour_input_checkbox[i]);
			if (i <= 6) {
			table_input_param_splitPanel1.push(champ_pour_input_checkbox[i]);
			}
			else {
			table_input_param_splitPanel2.push(champ_pour_input_checkbox[i]);
			}
		}
		//console.log(table_input_param);
		/*if (table_L_input_checkbox.length >= 2) {   	
            this.champ_pour_input_checkbox2 = new Ext.form.Checkbox({
					id: 'checkbox2',
					width: 200,
					xtype: 'checkbox',
					fieldLabel: "Input 2 (checkbox)"
					,checked: true
            });
            table_input_param.push(this.champ_pour_input_checkbox2);
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
                items: [table_input_param_splitPanel1
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
                items: [table_input_param_splitPanel2]
            }]
        };

        // ----------------------------------------------------------------------
        // Window : fields and buttons
        // ----------------------------------------------------------------------	 
        return new Ext.Window({
            // Config globale
            title: OpenLayers.i18n("addon_wpsmaker_title"),
            closable: true,
            closeAction: 'hide',
            width: globalWidth*1.3, // auto provoque un bug de largeur sur Chrome
            iconCls: 'windo_icon',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            items: [{
                xtype: 'form',
                labelWidth: 250,
                bodyStyle: "padding:10px;",
                items: [
                    table_input_param, fileLoadForm
                ],
            }, onglet2,onglet3 ],
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
        });
    },
    /** -----------------------------------------------------------------------------
        ExecuteWpsTimer 	
        ----------------------------------------------------------------------------- */
    // Send the input fields in the window
    ExecuteWpsTimer: function() {
        mask_loader.show();
        // ----------------------------------------------------------------------
        // Inputs Param
        // ----------------------------------------------------------------------
        var tableList_input_forXml = [];
        if (table_L_input_param.length >= 1) { // est important pour le message d'erreur si champs vide
            var input_param1_fromPythonValue = this.champ_pour_input_param1.getValue();
            var L_input_param1_forXml = {
                identifier: "L_input_param1",
                data: {
                    literalData: {
                        value: input_param1_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_param1_forXml);
        }
        if (table_L_input_param.length >= 2) {
            var input_param2_fromPythonValue = this.champ_pour_input_param2.getValue();
            var L_input_param2_forXml = {
                identifier: "L_input_param2",
                data: {
                    literalData: {
                        value: input_param2_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_param2_forXml);
        }
        if (table_L_input_param.length >= 3) {
            var input_param3_fromPythonValue = this.champ_pour_input_param3.getValue();
            var L_input_param3_forXml = {
                identifier: "L_input_param3",
                data: {
                    literalData: {
                        value: input_param3_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_param3_forXml);
        }
        if (table_L_input_param.length >= 4) {
            var input_param4_fromPythonValue = this.champ_pour_input_param4.getValue();
            var L_input_param4_forXml = {
                identifier: "L_input_param4",
                data: {
                    literalData: {
                        value: input_param4_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_param4_forXml);
        }
        if (table_L_input_param.length >= 5) {
            var input_param5_fromPythonValue = this.champ_pour_input_param5.getValue();
            var L_input_param5_forXml = {
                identifier: "L_input_param5",
                data: {
                    literalData: {
                        value: input_param5_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_param5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs WMS
        // ----------------------------------------------------------------------
        if (table_L_input_wms.length >= 1 && champ_pour_input_wms1.getValue() !== "") {
            var L_input_wms1_getValue = champ_pour_input_wms1.getValue();
            var L_input_wms1_WMS_URL = L_input_wms1_getValue.data.WFS_URL;
            var L_input_wms1_WMS_typeName = L_input_wms1_getValue.data.WFS_typeName;
            var testconcat = L_input_wms1_WMS_URL + L_input_wms1_WMS_typeName;
            var L_input_WMS1_forXml = {
                identifier: "L_input_wms1",
                data: {
                    literalData: {
                        value: testconcat
                    }
                }
            }
            tableList_input_forXml.push(L_input_WMS1_forXml);
        }
        if (table_L_input_wms.length >= 2 && champ_pour_input_wms2.getValue() !== "") {
            var L_input_wms2_getValue = champ_pour_input_wms2.getValue();
            var L_input_wms2_WMS_URL = L_input_wms2_getValue.data.WFS_URL;
            var L_input_wms2_WMS_typeName = L_input_wms2_getValue.data.WFS_typeName;
            var L_input_WMS2_forXml = {
                identifier: "L_input_wms2",
                data: {
                    literalData: {
                        value: L_input_wms2_WMS_typeName
                    }
                }
            }
            tableList_input_forXml.push(L_input_WMS2_forXml);
        }
        if (table_L_input_wms.length >= 3 && champ_pour_input_wms3.getValue() !== "") {
            var L_input_wms3_getValue = champ_pour_input_wms3.getValue();
            var L_input_wms3_WMS_URL = L_input_wms3_getValue.data.WFS_URL;
            var L_input_wms3_WMS_typeName = L_input_wms3_getValue.data.WFS_typeName;
            var L_input_WMS3_forXml = {
                identifier: "L_input_wms3",
                data: {
                    literalData: {
                        value: L_input_wms3_WMS_typeName
                    }
                }
            }
            tableList_input_forXml.push(L_input_WMS3_forXml);
        }
        if (table_L_input_wms.length >= 4 && champ_pour_input_wms4.getValue() !== "") {
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
            tableList_input_forXml.push(L_input_WMS4_forXml);
        }
        if (table_L_input_wms.length >= 5 && champ_pour_input_wms5.getValue() !== "") {
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
            tableList_input_forXml.push(L_input_WMS5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs Combobox
        // ----------------------------------------------------------------------
        if (table_L_input_scroll.length >= 0) {
            if (table_L_input_scroll.length >= 1 && champ_pour_input_scroll1.getValue() !== "") {
                var L_input_scroll1_getValue = champ_pour_input_scroll1.getValue();
                var L_input_scroll1_forXml = {
                    identifier: "L_input_scroll1",
                    data: {
                        literalData: {
                            value: L_input_scroll1_getValue
                        }
                    }
                }
                tableList_input_forXml.push(L_input_scroll1_forXml);
            }
            if (table_L_input_scroll.length >= 2 && champ_pour_input_scroll2.getValue() !== "") {
                var L_input_scroll2_getValue = champ_pour_input_scroll2.getValue();
                var L_input_scroll2_forXml = {
                    identifier: "L_input_scroll2",
                    data: {
                        literalData: {
                            value: L_input_scroll2_getValue
                        }
                    }
                }
                tableList_input_forXml.push(L_input_scroll2_forXml);
            }
            if (table_L_input_scroll.length >= 3 && champ_pour_input_scroll3.getValue() !== "") {
                var L_input_scroll3_getValue = champ_pour_input_scroll3.getValue();
                var L_input_scroll3_forXml = {
                    identifier: "L_input_scroll3",
                    data: {
                        literalData: {
                            value: L_input_scroll3_getValue
                        }
                    }
                }
                tableList_input_forXml.push(L_input_scroll3_forXml);
            }
            if (table_L_input_scroll.length >= 4 && champ_pour_input_scroll4.getValue() !== "") {
                var L_input_scroll4_getValue = champ_pour_input_scroll4.getValue();
                var L_input_scroll4_forXml = {
                    identifier: "L_input_scroll4",
                    data: {
                        literalData: {
                            value: L_input_scroll4_getValue
                        }
                    }
                }
                tableList_input_forXml.push(L_input_scroll4_forXml);
            }
            if (table_L_input_scroll.length >= 5 && champ_pour_input_scroll5.getValue() !== "") {
                var L_input_scroll5_getValue = champ_pour_input_scroll5.getValue();
                var L_input_scroll5_forXml = {
                    identifier: "L_input_scroll5",
                    data: {
                        literalData: {
                            value: L_input_scroll5_getValue
                        }
                    }
                }
                tableList_input_forXml.push(L_input_scroll5_forXml);
            }
        }
        // ----------------------------------------------------------------------
        // Inputs Coordinates
        // ----------------------------------------------------------------------
        if (table_L_input_coordxy.length >= 1 && typeof(coordxyValue1) != "undefined") {
            var L_input_coordxy1_forXml = {
                identifier: "L_input_coordxy1",
                data: {
                    literalData: {
                        value: coordxyValue1
                    }
                }
            }
            tableList_input_forXml.push(L_input_coordxy1_forXml);
        }
        if (table_L_input_coordxy.length >= 2 && typeof(coordxyValue2) != "undefined") {
            var L_input_coordxy2_forXml = {
                identifier: "L_input_coordxy2",
                data: {
                    literalData: {
                        value: coordxyValue2
                    }
                }
            }
            tableList_input_forXml.push(L_input_coordxy2_forXml);
        }
        if (table_L_input_coordxy.length >= 3 && typeof(coordxyValue3) != "undefined") {
            var L_input_coordxy3_forXml = {
                identifier: "L_input_coordxy3",
                data: {
                    literalData: {
                        value: coordxyValue3
                    }
                }
            }
            tableList_input_forXml.push(L_input_coordxy3_forXml);
        }
        if (table_L_input_coordxy.length >= 4 && typeof(coordxyValue4) != "undefined") {
            var L_input_coordxy4_forXml = {
                identifier: "L_input_coordxy4",
                data: {
                    literalData: {
                        value: coordxyValue4
                    }
                }
            }
            tableList_input_forXml.push(L_input_coordxy4_forXml);
        }
        if (table_L_input_coordxy.length >= 5 && typeof(coordxyValue5) != "undefined") {
            var L_input_coordxy5_forXml = {
                identifier: "L_input_coordxy5",
                data: {
                    literalData: {
                        value: coordxyValue5
                    }
                }
            }
            tableList_input_forXml.push(L_input_coordxy5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs GML
        // ----------------------------------------------------------------------
        if (table_C_input_gml.length >= 1 && typeof(gmlValue1) != "undefined") {
            //console.log(gmlValue1);
            var L_input_gml1_forXml = {
                identifier: "C_input_gml1",
                data: {
                    complexData: {
                        value: gmlValue1
                    }
                }
            }
            tableList_input_forXml.push(L_input_gml1_forXml);
        }
        if (table_C_input_gml.length >= 2 && typeof(gmlValue2) != "undefined") {
            var L_input_gml2_forXml = {
                identifier: "C_input_gml2",
                data: {
                    complexData: {
                        value: gmlValue2
                    }
                }
            }
            tableList_input_forXml.push(L_input_gml2_forXml);
        }
        if (table_C_input_gml.length >= 3 && typeof(gmlValue3) != "undefined") {
            var L_input_gml3_forXml = {
                identifier: "C_input_gml3",
                data: {
                    complexData: {
                        value: gmlValue3
                    }
                }
            }
            tableList_input_forXml.push(L_input_gml3_forXml);
        }
        if (table_C_input_gml.length >= 4 && typeof(gmlValue4) != "undefined") {
            var L_input_gml4_forXml = {
                identifier: "C_input_gml4",
                data: {
                    complexData: {
                        value: gmlValue4
                    }
                }
            }
            tableList_input_forXml.push(L_input_gml4_forXml);
        }
        if (table_C_input_gml.length >= 5 && typeof(gmlValue5) != "undefined") {
            var L_input_gml5_forXml = {
                identifier: "C_input_gml5",
                data: {
                    complexData: {
                        value: gmlValue5
                    }
                }
            }
            tableList_input_forXml.push(L_input_gml5_forXml);
        }

        // ----------------------------------------------------------------------
        // Inputs Checkbox
        // ----------------------------------------------------------------------
        for (i = 1; i <= table_L_input_checkbox.length; i++) {
		//if (table_L_input_checkbox.length >= 1) { // est important pour le message d'erreur si champs vide
            var input_checkbox1_fromPythonValue = champ_pour_input_checkbox[i].getValue();
            var L_input_checkbox1_forXml = {
                identifier: "L_input_checkbox"+i,
                data: {
                    literalData: {
                        value: input_checkbox1_fromPythonValue
                    }
                }
            }
            tableList_input_forXml.push(L_input_checkbox1_forXml);
        }

		
        // Test if all fields are filled (except those by default)
        var champs_restant = numberOfInputs - tableList_input_forXml.length;
        if (numberOfInputs == tableList_input_forXml.length) {

            // ----------------------------------------------------------------------
            // Outputs WMS
            // ----------------------------------------------------------------------
            tableList_output_forXml = [];
            if (table_L_output_wms.length >= 1) {
                L_output_wms1_forXml = {
                    asReference: false,
                    identifier: "L_output_wms1"
                }; //console.log("testOwms1");
                tableList_output_forXml.push(L_output_wms1_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (table_L_output_wms.length >= 2) {
                L_output_wms2_forXml = {
                    asReference: false,
                    identifier: "L_output_wms2"
                }; //console.log("testOwms2");
                tableList_output_forXml.push(L_output_wms2_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (table_L_output_wms.length >= 3) {
                L_output_wms3_forXml = {
                    asReference: false,
                    identifier: "L_output_wms3"
                }; //console.log("testOwms3");
                tableList_output_forXml.push(L_output_wms3_forXml); //console.log(tableList_output_forXml[0]);
            }

            // ----------------------------------------------------------------------
            // Outputs Param
            // ----------------------------------------------------------------------
            //console.log(table_L_output_param.length);
            if (table_L_output_param.length >= 1) {
                console.log('test table_L_output_param ok');
                L_output_param1_forXml = {
                    asReference: false,
                    identifier: "L_output_param1"
                }; //console.log("testOwms1");
                tableList_output_forXml.push(L_output_param1_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (table_L_output_param.length >= 2) {
                L_output_param2_forXml = {
                    asReference: false,
                    identifier: "L_output_param2"
                }; //console.log("testOwms2");
                tableList_output_forXml.push(L_output_param2_forXml); //console.log(tableList_output_forXml[0]);
            }
            if (table_L_output_param.length >= 3) {
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
                dataInputs: tableList_input_forXml,
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

            if (execute_on_off == 0) {
                execute_on_off = 1;
                OpenLayers.Request.POST({
                    url: WPS_URL, // var contenant l'adresse recuperee auparavant dans le manifest.json
                    data: xmlString,
                    success: this.onExecuted,
                    failure: this.onError
                });
            }
        } else {
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
                    console.log(client_L_output_wms1);
                }
                if (identifier == "L_output_wms2") {
                    client_L_output_wms2 = literalData[0].firstChild.nodeValue;
                    console.log(client_L_output_wms2);
                }
                if (identifier == "L_output_wms3") {
                    client_L_output_wms3 = literalData[0].firstChild.nodeValue;
                    console.log(client_L_output_wms3);
                }
                // ----------------------------------------------------------------------
                // Outputs Param 
                // ----------------------------------------------------------------------
                if (identifier == "L_output_param1") {
                    client_L_output_param1 = literalData[0].firstChild.nodeValue;
                    console.log(client_L_output_param1);
                }
                execute_on_off = 0; // Limite le nombre de process wps a la fois
            }
        }

        // ----------------------------------------------------------------------
        // Add WMS layer 
        // ----------------------------------------------------------------------
        // Load wms layer from recovered data
		/*
        GEOR.waiter.show(); // Barre bleu de chargement
        if (table_L_output_wms.length >= 1) {
            // client_L_output_wms1 contient un string a parser composer de l'url + le nom de la couche :  http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs?+++cseb:vue_d_ensemble2 
            var layerNameparse = client_L_output_wms1.substring(client_L_output_wms1.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            var layerUrlparse = client_L_output_wms1.substr(0, client_L_output_wms1.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
			console.log(layerNameparse);
			console.log(layerUrlparse);
            console.log("Une couche WMS a été ajoutée :");
            console.log("    - URL : " + layerUrlparse);
            console.log("    - Nom : " + layerNameparse); //console.log("    - Entrepot :"+entrepotName);
            // PART 2 : Ajout du WMS
            var wmsdyn = new OpenLayers.Layer.WMS(
                "OpenLayers WMS",
                layerUrlparse, {
                    layers: layerNameparse,
                    transparent: true
                });

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
        if (table_L_output_wms.length >= 2) {
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
        if (table_L_output_wms.length >= 3) {
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
        /*if (table_L_output_param.length >= 1) {
            GEOR.util.infoDialog({
                title: "",
                msg: client_L_output_param1
            });
        }*/
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
    },

};