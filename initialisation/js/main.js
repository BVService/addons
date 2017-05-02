Ext.namespace("GEOR.Addons");

//var noglob_regionContent = "";
var noglob_myPanel = "";

var WFSStore = {};
var All_WFS_list = [];

var WCSStore = {};
var All_WCS_list = [];

/**
 * Property: tr
 * {Function} an alias to OpenLayers.i18n
 */
var tr = OpenLayers.i18n;

/**
 * Method: zoomToLayerRecordExtent from GEOR.managelayers
 *
 * Parameters:
 * r - {GeoExt.data.LayerRecord}
 */
var zoomToLayerRecordExtent = function (r) {
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

var layerStore = Ext.getCmp("mappanel").layers;

var initialisation = {
    geoworkspace: {
        list: [],
        WSField: null,
        GetWMSLayers: function (URL_geoserver, ws) {
            noglob_myPanel.getEl().mask(tr("Loading layers..."), "x-mask-loading"); // mask window 

            /**
             * Property: observable
             * {Ext.util.Obervable}
             */
            var observable = new Ext.util.Observable();
            observable.addEvents(
                /**
                 * Event: selectstyle
                 * Fires when a new wms layer style has been selected
                 */
                "selectstyle",
                /**
                 * Event: beforecontextcleared
                 * Fired before all layers are removed from map
                 */
                "beforecontextcleared"
            );
            /**
             * Method: removeAllLayers
             *
             * Parameters:
             * map - {OpenLayers.Map}
             */
            var removeAllLayers = function (map) {
                fakeLayers = [];
                // warn other modules about what's goign on
                // (gfi, selectfeature, querier, editor, styler)
                // so that they can properly shutdown.
                observable.fireEvent("beforecontextcleared");
                // remove layers except the lowest index one
                // (our fake base layer) and "our" layers (eg: measure, print, etc)
                var re = /^(__georchestra|OpenLayers.Handler)/;
                for (var i = map.layers.length - 1; i >= 1; i--) {
                    var layer = map.layers[i];
                    if (!re.test(layer.name)) {
                        map.removeLayer(layer);
                        //if (! layer.isBaseLayer){}
                    }
                }
            };
            removeAllLayers(layerStore.map);

            var UrlWs = URL_geoserver + ws + "/ows";
            var store = GEOR.ows.WMSCapabilities({
                storeOptions: {
                    url: UrlWs.replace(/\?$/, '')
                },
                success: function (store, records) {
                    for (var i = 0; i < records.length; i++) {
                        var record = records[i];
                        var layer = record.get("layer");
                        var data = record.data;
                        var layerName = data.name;
                        var index = store.find("name", layerName);
                        if (index < 0) {
                            noglob_myPanel.getEl().unmask(); // unmask window
                            GEOR.util.errorDialog({
                                msg: tr("layerfinder.layer.unavailable", {
                                    'NAME': layerName
                                })
                            });
                            return;
                        }
                        var r = records[index];
                        var srs = layerStore.map.getProjection();
                        if (!r.get('srs') || (r.get('srs')[srs] !== true)) {
                            noglob_myPanel.getEl().unmask(); // unmask window
                            GEOR.util.errorDialog({
                                msg: tr("Layer projection is not compatible")
                            });
                            return;
                        }
                        // Set the copyright information to the "attribution" field
                        if (data.rights && !r.get("attribution")) {
                            r.set("attribution", {
                                title: data.rights
                            });
                        }
                        // If we have a metadataURL coming from the catalog,
                        // we use it instead of the one we get from the capabilities
                        // (as asked by Lydie - see http://applis-bretagne.fr/redmine/issues/1599#note-5)
                        if (data.metadataURL) {
                            r.set("metadataURLs", [data.metadataURL]);
                        }
                        layerStore.addSorted(r);
                    }
                    // Zoom to the 2ed layer
                    zoomToLayerRecordExtent(records[1])
                    noglob_myPanel.getEl().unmask(); // unmask window
                },
                failure: function () {
                    noglob_myPanel.getEl().unmask(); // unmask window
                    GEOR.util.errorDialog({
                        msg: tr("Unreachable server or insufficient rights")
                    });
                }
            });

        },

    },
    inputs: {
        list: [],
        minOccurs: [],
        forXmlPost: [],
        workspace: {
            list: [],
            addWorkspace: function (Workspace, addObj) {
                initialisation.inputs.workspace[Workspace] = {
                    obj: null
                }
                initialisation.inputs.workspace[Workspace].obj = addObj;
            },
        },
        scrollwfs: {
            list: [],
            addScrollwfs: function (Scrollwfs, addObj) {
                initialisation.inputs.scrollwfs[Scrollwfs] = {
                    obj: null
                }
                initialisation.inputs.scrollwfs[Scrollwfs].obj = addObj;
                initialisation.inputs.scrollwfs[Scrollwfs].objForWindowInput = null;
                initialisation.inputs.scrollwfs[Scrollwfs].scrollwfs = null;
            },
        },
        scrollwcs: {
            list: [],
            addScrollwcs: function (Scrollwcs, addObj) {
                initialisation.inputs.scrollwcs[Scrollwcs] = {
                    obj: null
                }
                initialisation.inputs.scrollwcs[Scrollwcs].obj = addObj;
                initialisation.inputs.scrollwcs[Scrollwcs].objForWindowInput = null;
                initialisation.inputs.scrollwcs[Scrollwcs].scrollwcs = null;
            },
        },
        scroll: {
            list: [],
            addScroll: function (addScrollID, addObj) {
                initialisation.inputs.scroll[addScrollID] = {
                        obj: null
                    } // ["param"+addParam] for dynamic var obj
                initialisation.inputs.scroll[addScrollID].obj = addObj;
                initialisation.inputs.scroll[addScrollID].objForWindowInput = null;
            }
        },
        checkbox: {
            list: [],
            addCheckbox: function (addCheckboxID, addObj) {
                initialisation.inputs.checkbox[addCheckboxID] = {
                        obj: null
                    } // ["param"+addParam] for dynamic var obj
                initialisation.inputs.checkbox[addCheckboxID].obj = addObj;
                initialisation.inputs.checkbox[addCheckboxID].objForWindowInput = null;
            }
        },
        param: {
            list: [],
            addParam: function (addParamID, addObj) {
                initialisation.inputs.param[addParamID] = {
                        obj: null
                    } // ["param"+addParam] for dynamic var obj
                initialisation.inputs.param[addParamID].obj = addObj;
                initialisation.inputs.param[addParamID].objForWindowInput = null;
            }
        },
        coordxy: {
            list: [],
            addCoordxy: function (Coordxy, addObj) {
                initialisation.inputs.coordxy[Coordxy] = {
                    obj: null
                }
                initialisation.inputs.coordxy[Coordxy].obj = addObj;
                initialisation.inputs.coordxy[Coordxy].objForWindowInput = null;
                initialisation.inputs.coordxy[Coordxy].coordxyStore = null;
            }
        },
        gml: {
            list: [],
            addGml: function (Gml, addObj) {
                initialisation.inputs.gml[Gml] = {
                    obj: ""
                }
                initialisation.inputs.gml[Gml].obj = addObj;
                initialisation.inputs.gml[Gml].objForWindowInput = "";
                initialisation.inputs.gml[Gml].gmlValue = "";
            }
        }
    },
    outputs: {
        list: [],
        forXmlResponse: [],
        scroll: {
            list: []
        },
        param: {
            list: [],
            addParam: function (addParamID, addObj) {
                initialisation.outputs.param[addParamID] = {
                        paramValue: null
                    } // ["param"+addParam] for dynamic var obj
                initialisation.outputs.param[addParamID].paramValue = addObj;
            }
        },
        wms: {
            list: [],
            addWms: function (addWmsID, addObj) {
                initialisation.outputs.wms[addWmsID] = {
                        wmsValue: null
                    } // ["param"+addParam] for dynamic var obj
                initialisation.outputs.wms[addWmsID].wmsValue = addObj;
            }
        }
    }
}

console.log(initialisation);

GEOR.Addons.initialisation = Ext.extend(GEOR.Addons.Base, {
    win: null,
    item: null,
    WPS_URL: null,
    WPS_identifier3: null,
    show_help: null,
    win_help: null,
    Help_URL: null,
    Metadata_URL: null,
    globalWidth: null,
    wpsInitialized: false,

    init: function (record) {
        var lang = OpenLayers.Lang.getCode();
        URL_WS = this.options.URL_WS;
        URL_cgi = this.options.URL_cgi;
        WPS_URL = this.options.WPS_URL;
        WPS_identifier3 = this.options.WPS_identifier3;
        Help_URL = this.options.Help_URL;
        Metadata_URL = this.options.Metadata_URL;
        globalWidth = this.options.globalWidth;

        if (this.wpsInitialized === false) {
            this.describeProcess(WPS_URL, WPS_identifier3);
        };
        mask_loader = new Ext.LoadMask(Ext.getBody(), {
            msg: tr("Processing..."),
        });
        this.item = new Ext.menu.Item({
            text: record.get("title")[lang],
            qtip: record.get("description")[lang],
            iconCls: 'process_time_icon9',
            handler: this.showWindow,
            scope: this
        });
        return this.item;
    },

    GetWorkspaces: function () {

        Ext.Ajax.request({
            method: 'GET',
            loadMask: true,
            scope: this,
            url: URL_cgi,
            success: function (response, request) {
                // Ext.MessageBox.alert('success', response.responseText);
                var doc = response.responseXML;
                var longeur = doc.getElementsByTagName("name").length;;
                // i = 1 : to ignore the 1st workspace ("geor_loc" in this case)
                for (var i = 1; i < longeur; i++) {
                    var ws = doc.getElementsByTagName("name")[i].firstChild.nodeValue;
                    initialisation.geoworkspace.list[i - 1] = ws;
                }
                //console.log(initialisation.geoworkspace.list);
            },
            failure: function (response, request) {
                Ext.MessageBox.alert('failure', response.responseText);
            }
        });
    },

    /** -----------------------------------------------------------------------------
        Describe process    	
        ----------------------------------------------------------------------------- */
    describeProcess: function (url, identifier) {
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
            success: function (response) {
                var wpsProcess2 = new OpenLayers.Format.WPSDescribeProcess().read(response.responseText).processDescriptions[identifier];

                // ----------------------------------------------------------------------
                // Course inputs
                // ----------------------------------------------------------------------
                //Recovery of identifiers (ie the names of inputs) extracted from python and stores in the noglob_table "table"
                for (i in wpsProcess2.dataInputs) { // List every input from the describe process query
                    initialisation.inputs.list.push(wpsProcess2.dataInputs[i].identifier);
                }
                var index = initialisation.inputs.list.indexOf(undefined);

                if (index > -1) {
                    initialisation.inputs.list.splice(index, 1);
                } // Removing undefined values 
                for (i = 0; i < initialisation.inputs.list.length; i++) {
                    switch (true) {
                        case (initialisation.inputs.list[i].slice(0, 17) == "L_input_workspace"):
                            initialisation.inputs.workspace.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 13) == "L_input_param"):
                            initialisation.inputs.param.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 11) == "L_input_wfs"):
                            initialisation.inputs.scrollwfs.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 11) == "L_input_wcs"):
                            initialisation.inputs.scrollwcs.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 14) == "L_input_scroll"):
                            initialisation.inputs.scroll.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 15) == "L_input_coordxy"):
                            initialisation.inputs.coordxy.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 11) == "C_input_gml"):
                            initialisation.inputs.gml.list.push(initialisation.inputs.list[i]);
                            break;
                        case (initialisation.inputs.list[i].slice(0, 16) == "L_input_checkbox"):
                            initialisation.inputs.checkbox.list.push(initialisation.inputs.list[i]);
                            break;
                    }
                }

                // ----------------------------------------------------------------------
                // Course outputs
                // ----------------------------------------------------------------------
                // List the outputs included in the DescribeProcess query and store them in the noglob_table "noglob_tableOutputs"
                for (i in wpsProcess2.processOutputs) {
                    initialisation.outputs.list.push(wpsProcess2.processOutputs[i].identifier);
                }
                if (initialisation.outputs.list.indexOf(undefined) > -1) {
                    initialisation.outputs.list.splice(initialisation.outputs.list.indexOf(undefined), 1);
                }
                for (i = 0; i < initialisation.outputs.list.length; i++) {
                    if (initialisation.outputs.list[i].slice(0, 12) == "L_output_wms") {
                        initialisation.outputs.wms.list.push(initialisation.outputs.list[i]);
                    } else if (initialisation.outputs.list[i].slice(0, 14) == "L_output_param") {
                        //noglob_table_L_output_param.push(initialisation.outputs.list[i]);
                        initialisation.outputs.param.list.push(initialisation.outputs.list[i]);
                    }
                }
                onDescribeP(wpsProcess2);
            },
            failure: function () {
                GEOR.util.errorDialog({
                    msg: tr('Server unavailable')
                });
            }
        });
    },

    /** -----------------------------------------------------------------------------
        onDescribe process   	
        ----------------------------------------------------------------------------- */
    onDescribeProcess: function (process) {
        // onDescribeProcess lists the necessary inputs
        findDataInputsByIdentifier = function (datainputs, identifier) {
            //var datainput, i;
            for (var i = 0; i < datainputs.length; i++) {
                if (datainputs[i].identifier === identifier) {
                    datainput = datainputs[i]; // console.log(datainputs[i]) =  Object { maxOccurs=1, minOccurs=0, identifier="L_input_param1", plus...}
                    break;
                }
            }
            return datainput;
        };

        // ----------------------------------------------------------------------
        // Data inputs workspace	
        // ----------------------------------------------------------------------
        for (var i = 0; i < initialisation.inputs.workspace.list.length; i++) {
            var name_inputs = initialisation.inputs.workspace.list[i];
            initialisation.inputs.workspace.addWorkspace(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
        }

        // ----------------------------------------------------------------------
        // Data inputs param 		
        // ----------------------------------------------------------------------
        for (var i = 0; i < initialisation.inputs.param.list.length; i++) {
            var name_inputs = initialisation.inputs.param.list[i];
            initialisation.inputs.param.addParam(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
        }

        // ----------------------------------------------------------------------
        // Data input WFS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WFS input WFS -- initialisation.inputs.scrollwfs.list
        for (var i = 0; i < initialisation.inputs.scrollwfs.list.length; i++) {
            var name_inputs = initialisation.inputs.scrollwfs.list[i];
            initialisation.inputs.scrollwfs.addScrollwfs(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
            //console.log(initialisation.inputs.scrollwfs[name_inputs].obj)
        }
        // ----------------------------------------------------------------------
        // Data input WCS 	
        // ----------------------------------------------------------------------	
        // Add the title of each WCS input WCS -- initialisation.inputs.scrollwcs.list
        for (var i = 0; i < initialisation.inputs.scrollwcs.list.length; i++) {
            var name_inputs = initialisation.inputs.scrollwcs.list[i];
            initialisation.inputs.scrollwcs.addScrollwcs(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
            //console.log(initialisation.inputs.scrollwcs[name_inputs].obj)
        }

        // ----------------------------------------------------------------------
        // Data inputs Combobox
        // ----------------------------------------------------------------------		
        for (var i = 0; i < initialisation.inputs.scroll.list.length; i++) {
            var name_inputs = initialisation.inputs.scroll.list[i];
            initialisation.inputs.scroll.addScroll(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
            var trashArray = [];
            for (var k in initialisation.inputs.scroll[name_inputs].obj.literalData.allowedValues) {
                trashArray.push(k);
            }
            initialisation.inputs.scroll[name_inputs].obj.literalData.allowedValues.list = [];
            initialisation.inputs.scroll[name_inputs].obj.literalData.allowedValues.list = trashArray;
        }

        // ----------------------------------------------------------------------
        // Data inputs Coordinates
        // ----------------------------------------------------------------------
        for (var i = 0; i < initialisation.inputs.coordxy.list.length; i++) {
            var name_inputs = initialisation.inputs.coordxy.list[i];
            initialisation.inputs.coordxy.addCoordxy(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
        }

        // ----------------------------------------------------------------------
        // Data inputs Checkbox 
        // ----------------------------------------------------------------------		
        for (var i = 0; i < initialisation.inputs.checkbox.list.length; i++) {
            var name_inputs = initialisation.inputs.checkbox.list[i];
            initialisation.inputs.checkbox.addCheckbox(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
        }

        // ----------------------------------------------------------------------
        // Data inputs GML 
        // ----------------------------------------------------------------------		
        for (var i = 0; i < initialisation.inputs.gml.list.length; i++) {
            var name_inputs = initialisation.inputs.gml.list[i];
            initialisation.inputs.gml.addGml(name_inputs, findDataInputsByIdentifier(process.dataInputs, name_inputs));
        }
        this.wpsInitialized = true;
    },
    /** -----------------------------------------------------------------------------
    Input window 	
    ----------------------------------------------------------------------------- */
    createWindow: function () {
        var onWSSelect = function (v) {
            this.onWSSelect(v)
        }
        FIELD_WIDTH = 150,
            base = {
                xtype: 'form',
                forceSelection: true,
                editable: true,
                allowBlank: true,
                triggerAction: 'all',
                mode: 'local',
                labelSeparator: tr("labelSeparator"),
                valueField: 'value',
                displayField: 'text',
                labelWidth: 200,
                //minListWidth: 70,
                listWidth: 'auto' // dropdown list width
            };

        baseOnglet = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
            closable: false,
            activate: true,
            collapsible: true,
            collapsed: false, //ouvert
            plain: true,
            buttonAlign: 'right',
            autoScroll: true
        };
        // ----------------------------------------------------------------------
        // WorkSpaces field
        // ----------------------------------------------------------------------		       
        // PART 1
        initialisation.geoworkspace.WSField = new Ext.form.ComboBox(Ext.apply({
            name: "WS",
            editable: false,
            fieldLabel: tr("Workspaces list"),
            emptyText: "Workspace",
            width: FIELD_WIDTH,
            triggerAction: 'all',
            store: initialisation.geoworkspace.list,
            listeners: {
                render: function (c) {
                    new Ext.ToolTip({
                        target: c.getEl(),
                        html: tr("Select a workspace")
                    });
                },
                'select': function (records) { // select : quand a choisi un champ de la cbbox
                    // reset the wfs & wcs combobox to defaut
                    for (var i = 0; i < initialisation.inputs.scrollwfs.list.length; i++) {
                        var name_inputs = initialisation.inputs.scrollwfs.list[i];
                        initialisation.inputs.scrollwfs[name_inputs].objForWindowInput.reset();
                    }
                    for (var i = 0; i < initialisation.inputs.scrollwcs.list.length; i++) {
                        var name_inputs = initialisation.inputs.scrollwcs.list[i];
                        initialisation.inputs.scrollwcs[name_inputs].objForWindowInput.reset();
                    }
                    // Run GetWMSLayers methode using the selected ws
                    var ws = records.value;
                    initialisation.geoworkspace.GetWMSLayers(URL_WS, ws);
                },
                scope: this
            },
        }, base));

        // ----------------------------------------------------------------------
        // Get WFS & WCS layers from layersStore
        // ----------------------------------------------------------------------		             
        initialisation.inputs.scrollwfs.windowInput = [];
        initialisation.inputs.scrollwcs.windowInput = [];
        addComboboxItemsWMS = function () {
            All_WFS_list = [];
            All_WCS_list = [];
            layerStore.each(function (record) {
                var queryable = record.get('queryable');
                var hasEquivalentWFS = record.hasEquivalentWFS();
                var hasEquivalentWCS = record.hasEquivalentWCS();
                if (queryable && hasEquivalentWFS) {
                    var url = record.data.WFS_URL;
                    var namespace = record.data.WFS_typeName;
                    var titre = record.data.title;
                    var url_name = url + namespace;

                    var ObjectRecordType = Ext.data.Record.create(['text', 'value']);
                    var rec = new ObjectRecordType({
                        text: titre,
                        value: url_name
                    })
                    var liste = [rec.data.text, rec.data.value];
                    All_WFS_list.push(liste);
                }
                if (queryable && hasEquivalentWCS) {
                    var url = record.data.WCS_URL;
                    var namespace = record.data.WCS_typeName;
                    var titre = record.data.title;
                    var url_name = url + namespace;

                    var ObjectRecordType = Ext.data.Record.create(['text', 'value']);
                    var rec = new ObjectRecordType({
                        text: titre,
                        value: url_name
                    })
                    var liste = [rec.data.text, rec.data.value];
                    All_WCS_list.push(liste);
                }
            });

            WFSStore = new Ext.data.ArrayStore({
                fields: ['text', 'value'],
                data: All_WFS_list
            });

            WCSStore = new Ext.data.ArrayStore({
                fields: ['text', 'value'],
                data: All_WCS_list
            });
        };
        addComboboxItemsWMS();

        // PART 1 Get WFS
        for (var i = 0; i < initialisation.inputs.scrollwfs.list.length; i++) {
            var name_inputs = initialisation.inputs.scrollwfs.list[i];
            initialisation.inputs.scrollwfs[name_inputs].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
                name: "wfs" + i,
                fieldLabel: initialisation.inputs.scrollwfs[name_inputs].obj.title,
                emptyText: 'Vector layer input',
                mode: 'local',
                width: FIELD_WIDTH,
                xtype: 'combo',
                displayField: 'text',
                valueField: 'value',
                lazyRender: false,
                lazyInit: false,
                triggerAction: 'all',
                editable: false,
                store: WFSStore,
                listeners: {
                    render: function (c) {
                        new Ext.ToolTip({
                            target: c.getEl(),
                            html: tr("Select your vector layer")
                        });
                    },
                    beforequery: function () {
                        addComboboxItemsWMS();
                        this.store.clearData();
                        this.store.loadData(All_WFS_list);
                    }
                }
            }, base));
            initialisation.inputs.scrollwfs.windowInput.push(initialisation.inputs.scrollwfs[name_inputs].objForWindowInput);
        }
/*
        if (initialisation.inputs.scrollwfs.list.length == 0) {
            var onglet_scrollwfs = {}; // don't existe
        } else {
            onglet_scrollwfs = Ext.apply({
                title: tr("Vector layer(s)"),
                bodyStyle: {
                    maxHeight: '90px'
                },
                items: [{
                    xtype: 'form',
                    id: 'comboWfs',
                    labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.scrollwfs.windowInput
                    ]
                }],
            }, baseOnglet);
        }
*/
        // PART 2 Get WCS
        for (var i = 0; i < initialisation.inputs.scrollwcs.list.length; i++) {
            var name_inputs = initialisation.inputs.scrollwcs.list[i];
            initialisation.inputs.scrollwcs[name_inputs].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
                name: "wcs" + i,
                fieldLabel: initialisation.inputs.scrollwcs[name_inputs].obj.title,
                emptyText: 'Raster layer input',
                mode: 'local',
                width: FIELD_WIDTH,
                xtype: 'combo',
                displayField: 'text',
                valueField: 'value',
                lazyRender: false,
                lazyInit: false,
                triggerAction: 'all',
                editable: false,
                store: WCSStore,
                listeners: {
                    render: function (c) {
                        new Ext.ToolTip({
                            target: c.getEl(),
                            html: tr("Select your raster layer")
                        });
                    },
                    beforequery: function () {
                        addComboboxItemsWMS();
                        this.store.clearData();
                        this.store.loadData(All_WCS_list);
                    }
                }
            }, base));
            initialisation.inputs.scrollwcs.windowInput.push(initialisation.inputs.scrollwcs[name_inputs].objForWindowInput);
        }
        
        
       noglob_regionContent3 = new Ext.Panel({ //new Ext.form.Panel({ is not a constructor
            title: OpenLayers.i18n("output_text"),
            activate: true,
            region: 'south',
            collapsible: true,
            collapsed: false,
            split: true,
    });

        // ----------------------------------------------------------------------
        // Parameter inputs
        // ----------------------------------------------------------------------
        var emptytext = ["email","landuse"]
        initialisation.inputs.param.windowInput = [];
        for (var i = 0; i < initialisation.inputs.param.list.length; i++) {
            var name_inputs = initialisation.inputs.param.list[i];
            initialisation.inputs.param[name_inputs].objForWindowInput = new Ext.form.TextField({ //this.champ_pour_input_param1 = new Ext.form.TextField({
                fieldLabel: initialisation.inputs.param[name_inputs].obj.title, //wps_Config_param1.input_param1_fromPython.title,
                emptyText: emptytext[i],
                name: "param" + i,
                width: FIELD_WIDTH,
                allowBlank: false,
                labelSeparator: tr("labelSeparator"),
                allowDecimals: true
            });
            initialisation.inputs.param.windowInput.push(initialisation.inputs.param[name_inputs].objForWindowInput);
        }

        // ----------------------------------------------------------------------
        // Combobox inputs
        // ----------------------------------------------------------------------			 
        initialisation.inputs.scroll.windowInput = [];
        for (i = 0; i < initialisation.inputs.scroll.list.length; i++) {
            var name_inputs = initialisation.inputs.scroll.list[i];

            initialisation.inputs.scroll[name_inputs].objForWindowInput = new Ext.form.ComboBox(Ext.apply({
                width: FIELD_WIDTH, // line 1203
                fieldLabel: initialisation.inputs.scroll[name_inputs].obj.title,
                name: 'division' + i,
                value: initialisation.inputs.scroll[name_inputs].obj.literalData.allowedValues.list[0],
                store: initialisation.inputs.scroll[name_inputs].obj.literalData.allowedValues.list,
                editable: false,
                triggerAction: 'all',
            }, base));
            initialisation.inputs.scroll.windowInput.push(initialisation.inputs.scroll[name_inputs].objForWindowInput);
        }

        // ----------------------------------------------------------------------
        // GML inputs
        // ----------------------------------------------------------------------
        // PART 1
        initialisation.inputs.gml.windowInput = [];
        // Valable pour un seul GML en entrée !
        for (var i = 0; i < initialisation.inputs.gml.list.length; i++) {
            // work only for one GML input
            var name_inputs = initialisation.inputs.gml.list[0];
            //    console.log(name_inputs);
            //                toComptGMLInputs.IdGML[i] = name_inputs;
            //                initialisation.inputs.gml.windowInput.push(toComptGMLInputs);
            var tmpwindowgml = {
                width: 0,
                id: name_inputs,
//                xtype: 'textfield',
                xtype: 'fileuploadfield',
//                buttonOnly: true,
//                inputType: 'file',
                fieldLabel: initialisation.inputs.gml[name_inputs].obj.title,
                fileUpload: true,
                buttonText: '',
                labelSeparator: tr("labelSeparator"),
                allowBlank: false,
                listeners: {
                    //                        'beforerender': function() { // beforerender est juste au moment d ouvrir la fenetre avant qu elle saffiche
                    //                           console.log('beforerender');
                    //                        },
                    fileselected: function (fb, v) {
                        var file = fb.fileInput.dom.files[0];
                        var myfilename = v;
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            //                                console.log(e.target.result);
                            console.log('ajout gml ' + i+1);
                            initialisation.inputs.gml[name_inputs].gmlValue = e.target.result; // flag : i undefined
                            if (myfilename.search('.gml') != -1) {

                            } else {
                                GEOR.util.errorDialog({
                                    title: "Erreur de format",
                                    msg: "Veuillez choisir un format GML."
                                });
                            }
                        };
                        reader.readAsText(file, "UTF-8");
                        console.log(initialisation.inputs.gml[name_inputs].gmlValue);
                    }
                }
            }
            initialisation.inputs.gml.windowInput.push(tmpwindowgml);
        }

        // PART 2 GML Window
        var fileLoadForm = new Ext.FormPanel({
            frame: false,
            border: false,
            autoWidth: false,
            //            labelWidth: 150, // xtype: 'filefield',
            labelWidth: 0, // for xtype: 'fileuploadfield',
            bodyStyle: 'padding: 9px 10px 0 0px;',
            items: [
                initialisation.inputs.gml.windowInput,
            ]
        });

        var fileWindow = new Ext.Window({
            closable: true,
            width: 0,
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
        var defControl = function () {
            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },
                initialize: function (options) {
                    this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                    OpenLayers.Control.prototype.initialize.apply(this, arguments);
                    this.handler = new OpenLayers.Handler.Click(this, {
                        'click': this.trigger
                    }, this.handlerOptions);
                },
                trigger: function (e) {
                    var lonlat = map.getLonLatFromPixel(e.xy);
                    clickbv.deactivate();
                    for (var i = 0; i < initialisation.inputs.coordxy.list.length; i++) {
                        var name_inputs = initialisation.inputs.coordxy.list[i];
                        initialisation.inputs.coordxy[name_inputs].coordxyStore = lonlat.lat;
                        //alert("Input 1 : Vous avez sélectionné les coordonnées " + lonlat.lat + " N, " + lonlat.lon + " E ");
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

        initialisation.inputs.coordxy.windowInput = [];
        for (var i = 0; i < initialisation.inputs.coordxy.list.length; i++) {
            var name_inputs = initialisation.inputs.coordxy.list[i];
            initialisation.inputs.coordxy[name_inputs].objForWindowInput = new Ext.Button({
                iconCls: 'add_icon',
                text: initialisation.inputs.coordxy[name_inputs].obj.title, //OpenLayers.i18n(noglob_coordxyTitle[0]),
                style: 'padding-top:5px',
                handler: function () {
                    clickbv.activate();
                    log_coord = i;
                },
                scope: this
            });
            initialisation.inputs.coordxy.windowInput.push(initialisation.inputs.coordxy[name_inputs].objForWindowInput);
        }

        // ----------------------------------------------------------------------
        // Checkbox inputs
        // ----------------------------------------------------------------------
        initialisation.inputs.checkbox.windowInput = [];
        for (var i = 0; i < initialisation.inputs.checkbox.list.length; i++) {
            var name_inputs = initialisation.inputs.checkbox.list[i];
            initialisation.inputs.checkbox[name_inputs].objForWindowInput = new Ext.form.Checkbox({ // flag
                id: 'checkbox' + i,
                //width: 5,
                xtype: 'checkbox',
                fieldLabel: initialisation.inputs.checkbox[name_inputs].obj.title,
                checked: true
            });
            initialisation.inputs.checkbox.windowInput.push(initialisation.inputs.checkbox[name_inputs].objForWindowInput);
        }

        var onglet_scrollWS = Ext.apply({
            title: tr("Workspace definition"),
            items: [{
                xtype: 'form',
                labelWidth: 200,
                bodyStyle: "padding:10px;",
                items: [
                    initialisation.geoworkspace.WSField,
                ]
            }]
        }, baseOnglet);
        // ----------------------------------------------------------------------
        // Dynamic show inputs panels
        // ----------------------------------------------------------------------        
                if (initialisation.inputs.scrollwcs.list.length == 0) {
            var onglet_scrollwcs = {}; //fermé
        } else {
            onglet_scrollwcs = Ext.apply({
                title: tr("Raster layer(s)"),
                bodyStyle: {
                    maxHeight: '100px'
                },
                items: [{
                    xtype: 'form',
                    id: 'comboWcs',
                    labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.scrollwfs.windowInput,
                        initialisation.inputs.param.windowInput[1],
                        initialisation.inputs.scrollwcs.windowInput  
                    ]
                }],
            }, baseOnglet);
        }
        
        if (initialisation.inputs.scroll.list.length == 0) {
            var onglet_scroll = {};
        } else {
            onglet_scroll = Ext.apply({
                title: tr("Allowed values"),
                bodyStyle: {
                    maxHeight: '90px'
                },
                items: [{
                    xtype: 'form',
                    labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.scroll.windowInput,
                    ]
                }]
            }, baseOnglet);

        }

        if (initialisation.inputs.checkbox.list.length == 0) {
            var onglet_checkbox = {};
        } else {
            onglet_checkbox = Ext.apply({
                title: tr("Checkbox parameter(s) (0/1)"),
                bodyStyle: {
                    maxHeight: '110px'
                },
                items: [{
                    xtype: 'form',
                    labelWidth: 320,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.checkbox.windowInput,
                    ]
                }]
            }, baseOnglet);
        }

        if (initialisation.inputs.param.list.length == 0) {
            var onglet_param = {};
        } else {
            onglet_param = Ext.apply({
                title: tr("Text parameter(s)"),
                bodyStyle: {
                    maxHeight: '90px'
                },
                items: [{
                    xtype: 'form',
                    labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.param.windowInput[0],
                    ]
                }]
            }, baseOnglet);
        }

        if (initialisation.inputs.coordxy.list.length == 0) {
            var onglet_coordxy = {};
        } else {
            onglet_coordxy = Ext.apply({
                title: tr("Point selection on the map"),
                items: [{
                    xtype: 'form',
                    labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        initialisation.inputs.coordxy.windowInput,
                    ]
                }]
            }, baseOnglet);
        }

        if (initialisation.inputs.gml.list.length == 0) {
            var onglet_gml = {};
        } else {
            onglet_gml = Ext.apply({
                title: tr("GML file uploading"),
                bodyStyle: {
                    maxHeight: '90px'
                },
                items: [{
                    xtype: 'form',
                    //labelWidth: 200,
                    bodyStyle: "padding:10px;",
                    items: [
                        fileLoadForm
                    ]
                }]
            }, baseOnglet);
        }

        //        noglob_regionContent = new Ext.Panel({ //new Ext.form.Panel({ is not a constructor
        //            title: tr("Text output"),
        //            //frame: true, // TEST
        //            //closable: false,
        //            activate: true,
        //            region: 'south',
        //            collapsible: true,
        //            collapsed: false,
        //            split: true,
        //            plain: true,
        //            autoScroll: true,
        //            bodyStyle: {
        //                maxHeight: '90px'
        //            },
        //        });

        noglob_myPanel = new Ext.Window({
            animateTarget: true,
            //resizable: false,
            title: tr("Processing settings5"),
            closable: true,
            closeAction: 'hide',
            width: globalWidth * 1.3, // auto provoque un bug de largeur sur Chrome
            y: '120px',
            //y: '0%',
            x: '0%',
            iconCls: 'windo_icon9',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            bodyStyle: {
                maxHeight: '720px' // hauteur max de window
            },
            items: [
                onglet_scrollWS,
                //onglet_scrollwfs,
                onglet_scrollwcs,
                onglet_scroll,
                onglet_checkbox,
                onglet_param,
                onglet_gml,
                onglet_coordxy,
                noglob_regionContent3
//                noglob_regionContent
                ],
            // Creation/Ajout des boutons
            fbar: ['->', {
                    text: tr("Close"),
                    handler: function () {
                        this.win.hide();
                    },
                    scope: this
            }, {
                    text: tr("Help"),
                    handler: function () {
                        window.open(Help_URL);
                    },
                    scope: this
            },
            /*{
               text: OpenLayers.i18n("Métadonnées"),
               handler: function() {
                   window.open(Metadata_URL);
               },
               scope: this
           },*/
                {
                    text: tr("Execute"),
                    handler: this.ExecuteWps,
                    scope: this
            }],
        });
        return noglob_myPanel;
    },
    /** -----------------------------------------------------------------------------
        ExecuteWps
        ----------------------------------------------------------------------------- */
    // Send the input fields in the window
    ExecuteWps: function () {
        initialisation.inputs.forXmlPost = []; // reset sinon ne peut pas rechoisir

        if (initialisation.inputs.workspace.list.length > 0 && initialisation.geoworkspace.WSField.getValue() == "") {
            GEOR.util.errorDialog({
                msg: tr("Please select your workspace !")
            });
        } else {
            // ----------------------------------------------------------------------
            // Inputs workspace
            // ----------------------------------------------------------------------
            for (var i = 0; i < initialisation.inputs.workspace.list.length; i++) {
                var name_inputs = initialisation.inputs.workspace.list[i];
                var tmpValue = initialisation.geoworkspace.WSField.getValue()
                    //                if (tmpValue == "" && initialisation.inputs.workspace[name_inputs].obj.minOccurs == 1) {
                    //                    initialisation.inputs.minOccurs.push(name_inputs+'minOccurs')
                    //                    GEOR.util.errorDialog({
                    //                        msg: tr("The field - ") + initialisation.inputs.workspace[name_inputs].obj.title + tr(" - is required !")
                    //                    });
                    //                    break
                    //                } else {
                    //                    var j = initialisation.inputs.minOccurs.length;
                    //                    while (j--) {
                    //                        initialisation.inputs.minOccurs.remove(name_inputs+'minOccurs')
                    //                    }
                    //                    if (tmpValue != "") {
                var tmpforXml = {
                    identifier: name_inputs,
                    data: {
                        literalData: {
                            value: tmpValue
                        }
                    }
                }
                initialisation.inputs.forXmlPost.push(tmpforXml);
                //                    }
                //                }
            }
            // ----------------------------------------------------------------------
            // Inputs Param
            // ----------------------------------------------------------------------
            for (var i = 0; i < initialisation.inputs.param.list.length; i++) {
                var name_inputs = initialisation.inputs.param.list[i];
                var tmpValue = initialisation.inputs.param[name_inputs].objForWindowInput.getValue()
                if (tmpValue == "" && initialisation.inputs.param[name_inputs].obj.minOccurs == 1) {
                    initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                    GEOR.util.errorDialog({
                        msg: tr("The field - ") + initialisation.inputs.param[name_inputs].obj.title + tr(" - is required !")
                    });
                    break
                } else {
                    var j = initialisation.inputs.minOccurs.length;
                    while (j--) {
                        initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                    }
                    if (tmpValue != "") {
                        var tmpforXml = {
                            identifier: name_inputs,
                            data: {
                                literalData: {
                                    value: tmpValue
                                }
                            }
                        }
                        initialisation.inputs.forXmlPost.push(tmpforXml);
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs WFS
            // ----------------------------------------------------------------------
            for (var i = 0; i < initialisation.inputs.scrollwfs.list.length; i++) {
                var name_inputs = initialisation.inputs.scrollwfs.list[i];
                var tmpValue = initialisation.inputs.scrollwfs[name_inputs].objForWindowInput.getValue();
                if (tmpValue == "" && initialisation.inputs.scrollwfs[name_inputs].obj.minOccurs == 1) {
                    initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                    GEOR.util.errorDialog({
                        msg: tr("The field - ") + initialisation.inputs.scrollwfs[name_inputs].obj.title + tr(" - is required !")
                    });
                    break
                } else {
                    var j = initialisation.inputs.minOccurs.length;
                    while (j--) {
                        initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                    }
                    if (tmpValue != "") {
                        var tmpforXml = {
                            identifier: name_inputs,
                            data: {
                                literalData: {
                                    value: tmpValue
                                }
                            }
                        }
                        initialisation.inputs.forXmlPost.push(tmpforXml);
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs WCS
            // ----------------------------------------------------------------------
            for (var i = 0; i < initialisation.inputs.scrollwcs.list.length; i++) {
                var name_inputs = initialisation.inputs.scrollwcs.list[i];
                var tmpValue = initialisation.inputs.scrollwcs[name_inputs].objForWindowInput.getValue();
                if (tmpValue == "" && initialisation.inputs.scrollwcs[name_inputs].obj.minOccurs == 1) {
                    initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                    GEOR.util.errorDialog({
                        msg: tr("The field - ") + initialisation.inputs.scrollwcs[name_inputs].obj.title + tr(" - is required !")
                    });
                    break
                } else {
                    var j = initialisation.inputs.minOccurs.length;
                    while (j--) {
                        initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                    }
                    if (tmpValue != "") {
                        var tmpforXml = {
                            identifier: name_inputs,
                            data: {
                                literalData: {
                                    value: tmpValue
                                }
                            }
                        }
                        initialisation.inputs.forXmlPost.push(tmpforXml);
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs Combobox
            // ----------------------------------------------------------------------
            if (initialisation.inputs.scroll.list.length > 0) {
                for (var i = 0; i < initialisation.inputs.scroll.list.length; i++) {
                    var name_inputs = initialisation.inputs.scroll.list[i];
                    var tmpValue = initialisation.inputs.scroll[name_inputs].objForWindowInput.getValue();
                    if (tmpValue == "" && initialisation.inputs.scroll[name_inputs].obj.minOccurs == 1) {
                        initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                        GEOR.util.errorDialog({
                            msg: tr("The field - ") + initialisation.inputs.scroll[name_inputs].obj.title + tr(" - is required !")
                        });
                        break
                    } else {
                        var j = initialisation.inputs.minOccurs.length;
                        while (j--) {
                            initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                        }
                        if (tmpValue != "") {
                            var tmpforXml = {
                                identifier: name_inputs,
                                data: {
                                    literalData: {
                                        value: tmpValue
                                    }
                                }
                            }
                            initialisation.inputs.forXmlPost.push(tmpforXml);
                        }
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs Coordinates
            // ----------------------------------------------------------------------
            if (initialisation.inputs.coordxy.list.length > 0) {
                for (var i = 0; i < initialisation.inputs.coordxy.list.length; i++) {
                    var name_inputs = initialisation.inputs.coordxy.list[i];
                    var tmpValue = initialisation.inputs.coordxy[name_inputs].objForWindowInput.getValue();
                    if (tmpValue == "" && initialisation.inputs.coordxy[name_inputs].obj.minOccurs == 1) {
                        initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                        GEOR.util.errorDialog({
                            msg: tr("The field - ") + initialisation.inputs.coordxy[name_inputs].obj.title + tr(" - is required !")
                        });
                        break
                    } else {
                        var j = initialisation.inputs.minOccurs.length;
                        while (j--) {
                            initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                        }
                        if (tmpValue != "") {
                            var tmpforXml = {
                                identifier: name_inputs,
                                data: {
                                    literalData: {
                                        value: tmpValue
                                    }
                                }
                            }
                            initialisation.inputs.forXmlPost.push(tmpforXml);
                        }
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs GML
            // ----------------------------------------------------------------------
            if (initialisation.inputs.gml.list.length > 0) {
                for (var i = 0; i < initialisation.inputs.gml.list.length; i++) {
                    var name_inputs = initialisation.inputs.gml.list[i];
                    var tmpValue = initialisation.inputs.gml[name_inputs].gmlValue;
                    if (tmpValue == "" && initialisation.inputs.gml[name_inputs].obj.minOccurs == 1) {
                        initialisation.inputs.minOccurs.push(name_inputs + 'minOccurs')
                        GEOR.util.errorDialog({
                            msg: tr("The field - ") + initialisation.inputs.gml[name_inputs].obj.title + tr(" - is required !")
                        });
                        break
                    } else {
                        var j = initialisation.inputs.minOccurs.length;
                        while (j--) {
                            initialisation.inputs.minOccurs.remove(name_inputs + 'minOccurs')
                        }
                        if (tmpValue != "") {
                            var tmpforXml = {
                                identifier: name_inputs,
                                data: {
                                    literalData: {
                                        value: tmpValue
                                    }
                                }
                            }
                            initialisation.inputs.forXmlPost.push(tmpforXml);
                        }
                    }
                }
            }
            // ----------------------------------------------------------------------
            // Inputs Checkbox
            // ----------------------------------------------------------------------
            if (initialisation.inputs.checkbox.list.length > 0) {
                for (var i = 0; i < initialisation.inputs.checkbox.list.length; i++) {
                    var name_inputs = initialisation.inputs.checkbox.list[i];
                    var tmpForXml = {
                        identifier: name_inputs,
                        data: {
                            literalData: {
                                value: initialisation.inputs.checkbox[name_inputs].objForWindowInput.getValue()
                            }
                        }
                    }
                    initialisation.inputs.forXmlPost.push(tmpForXml);
                }
            }
            // Test if all minOccurs "1" fields are filled 
            if (initialisation.inputs.minOccurs.length == 0) {
                mask_loader.show();
                // ----------------------------------------------------------------------
                // Outputs WMS
                // ----------------------------------------------------------------------
                for (var i = 0; i < initialisation.outputs.wms.list.length; i++) {
                    var name_outputs = initialisation.outputs.wms.list[i];
                    L_output_wms_forXml = {
                        asReference: false,
                        identifier: name_outputs
                    };
                    initialisation.outputs.forXmlResponse.push(L_output_wms_forXml);
                }

                // ----------------------------------------------------------------------
                // Outputs Param
                // ----------------------------------------------------------------------
                for (var i = 0; i < initialisation.outputs.param.list.length; i++) {
                    var name_outputs = initialisation.outputs.param.list[i];
                    L_output_param_forXml = {
                        asReference: false,
                        identifier: name_outputs
                    };
                    initialisation.outputs.forXmlResponse.push(L_output_param_forXml);
                }
                // ----------------------------------------------------------------------
                // Sends the query
                // ----------------------------------------------------------------------
                console.log("Une requête XML a été envoyée : ");

                var wpsFormat = new OpenLayers.Format.WPSExecute();
                // Creation de la requete XML
                var xmlString = wpsFormat.write({
                    identifier: WPS_identifier3,
                    dataInputs: initialisation.inputs.forXmlPost, //noglob_tableList_input_forXml,
                    responseForm: {
                        responseDocument: {
                            storeExecuteResponse: true,
                            lineage: false,
                            status: false,
                            outputs: initialisation.outputs.forXmlResponse
                        }
                    }
                });
                OpenLayers.Request.POST({
                    url: WPS_URL, // var contenant l'adresse recuperee auparavant dans le manifest.json
                    data: xmlString,
                    success: this.onExecuted,
                    failure: this.onError
                });
                //this.win.hide();
            }
        }
    },

    /** -----------------------------------------------------------------------------
        onExecuted
        ----------------------------------------------------------------------------- */
    onExecuted: function (resp) {
		noglob_regionContent3.update("<br>"+resp.responseText);
        mask_loader.hide();
        var getStatusExecute = function (dom) {
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
            for (var i = 0; i < initialisation.outputs.list.length; i++) { // Invariable
                var identifier = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], owsNS, "Identifier")[0].firstChild.nodeValue;
                var literalData = OpenLayers.Format.XML.prototype.getElementsByTagNameNS(outputs[i], wpsNS, "LiteralData");
                // ----------------------------------------------------------------------
                // Outputs WMS 
                // ----------------------------------------------------------------------
                for (var j = 0; j < initialisation.outputs.wms.list.length; j++) {
                    var name_outputs = initialisation.outputs.wms.list[j];
                    // Recover data from the output sent by the WPS server
                    if (identifier == name_outputs) {
                        initialisation.outputs.wms.addWms(name_outputs, literalData[0].firstChild.nodeValue);
                    }
                }

                // ----------------------------------------------------------------------
                // Outputs Param 
                // ----------------------------------------------------------------------
                for (var k = 0; k < initialisation.outputs.param.list.length; k++) {
                    var name_outputs = initialisation.outputs.param.list[k];
                    if (identifier == name_outputs) { // flag prob avec le i, peut etre en redondance car deja un i dans la boucle ??,
                        initialisation.outputs.param.addParam(name_outputs, literalData[0].firstChild.nodeValue);
                    }
                    //					noglob_execute_on_off = 0; // Limite le nombre de process wps a la fois
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
        var index = [];

        if (initialisation.outputs.wms.list.length > 0) {

            //noglob_myPanel.getEl().mask(tr("Loading layers..."), "x-mask-loading"); // mask window 

            // Add wms outputs layers dynamicly
            for (var i = 0; i < initialisation.outputs.wms.list.length; i++) {
                var name_outputs = initialisation.outputs.wms.list[i];
                layerUrlparse[i] = initialisation.outputs.wms[name_outputs].wmsValue.substr(0, initialisation.outputs.wms[name_outputs].wmsValue.indexOf('?')); // Recupere l'url avant le ? : http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs
                layerNameparse[i] = initialisation.outputs.wms[name_outputs].wmsValue.substring(initialisation.outputs.wms[name_outputs].wmsValue.indexOf('?') + 1); // Recupere le nom situe derriere le ? : cseb:vue_d_ensemble2 
            }

            // Add all outputs layers from WMS GetCapabilities
            // All outputs layers need to have the same URL workspace
            var store = GEOR.ows.WMSCapabilities({
                storeOptions: {
                    url: layerUrlparse[0].replace(/\?$/, '')
                },
                success: function (store, records) {
                    for (var i = 0; i < layerNameparse.length; i++) {
                        index[i] = store.find("name", layerNameparse[i]);
                        var idx = index[i];
                        if (idx < 0) {
                            noglob_myPanel.getEl().unmask();
                            GEOR.util.errorDialog({
                                msg: tr("layerfinder.layer.unavailable", {
                                    'NAME': layerName
                                })
                            });
                            return;
                        }
                        var r = records[idx];
                        var data = r.data;
                        var srs = layerStore.map.getProjection();
                        if (!r.get('srs') || (r.get('srs')[srs] !== true)) {
                            noglob_myPanel.getEl().unmask(); // unmask window
                            GEOR.util.errorDialog({
                                msg: tr("Layer projection is not compatible")
                            });
                            return;
                        }
                        // Set the copyright information to the "attribution" field
                        if (data.rights && !r.get("attribution")) {
                            r.set("attribution", {
                                title: data.rights
                            });
                        }
                        // If we have a metadataURL coming from the catalog,
                        // we use it instead of the one we get from the capabilities
                        // (as asked by Lydie - see http://applis-bretagne.fr/redmine/issues/1599#note-5)
                        if (data.metadataURL) {
                            r.set("metadataURLs", [data.metadataURL]);
                        }
                        layerStore.addSorted(r);
                    }
                    noglob_myPanel.getEl().unmask(); // unmask window

                    // zoom to the first added layer
                    var firstLayerIndex = index[0]
                    zoomToLayerRecordExtent(records[firstLayerIndex])
                },
                failure: function () {
                    noglob_myPanel.getEl().unmask(); // unmask window
                    GEOR.util.errorDialog({
                        msg: tr("Unreachable server or insufficient rights")
                    });
                }
            });
        }

        // ----------------------------------------------------------------------
        // Display all wps text outputs (L_output_param) on panel
        // ----------------------------------------------------------------------		
        var TextOut = [];
        if (initialisation.outputs.param.list.length > 0) {
            //console.log(initialisation.outputs.param.list);
            for (var i = 0; i < initialisation.outputs.param.list.length; i++) {
                var name_outputs = initialisation.outputs.param.list[i];
                //                var num = i + 1;
                //                var n = num.toString();
                TextOut[i] = ' - ' + initialisation.outputs.param[name_outputs].paramValue.replace(/(\r\n|\n|\r)/gm, "<br>") + '<br>';
            }
            //            noglob_regionContent.update(TextOut);
            GEOR.util.infoDialog({
                msg: TextOut
            });
        }
        GEOR.waiter.hide();
        // ----------------------------------------------------------------------
        // WMC
        // ----------------------------------------------------------------------
        setTimeout(function () { // la fonction se declence 20 seconde apres ?
            // Creation du WMC vierge
            var parserWMC = new OpenLayers.Format.WMC({
                layerOptions: {
                    // to prevent automatic restoring of PNG rather than JPEG:
                    noMagic: true
                }
            });
            // Create WMC
            var writeWMC = parserWMC.write(this.map);

            //console.log(writeWMC);
            // Set wms to queryable
            var writeWMCbis = writeWMC.replace('</Extension></Layer><Layer queryable="0"', '</Extension></Layer><Layer queryable="1"');
            var writeWMCbis1 = writeWMCbis.replace(/General.*General/, 'General><Window width="1293" height="765" /><BoundingBox minx="726842.041230160045" miny="6264001.34968379978" maxx="729930.574904300040" maxy="6265828.67239120044" SRS="EPSG:2154" /><Title /><Extension>  <ol:maxExtent xmlns:ol="http://openlayers.org/context" minx="-357823.236499999999" miny="5037008.69390000030" maxx="1313632.36280000000" maxy="7230727.37710000016" /></Extension></General');

            var layerStore2 = Ext.getCmp("mappanel").layers;
            var huhu6 = GEOR.wmc.write(layerStore2); //  ok
        }, 20250);
        //setTimeout();
    },

    /** -----------------------------------------------------------------------------
        onError
        ----------------------------------------------------------------------------- */
    onError: function (process) {
        mask_loader.hide();
        GEOR.util.infoDialog({
            msg: "Echec de l'execution du processus !<br>\n" + "Raison : " + process.exception.text
        });
    },

    /** -----------------------------------------------------------------------------
        showWindow
        ----------------------------------------------------------------------------- */
    showWindow: function () {
        if (!this.win) {
            this.win = this.createWindow();
        }
        this.win.show();
    },
    /**
     * Method: destroy
     * Called by GEOR_tools when deselecting this addon
     */
    destroy: function () {
        initialisation = {};
        if (noglob_myPanel != ""){
            noglob_myPanel.destroy();
        }
        GEOR.Addons.Base.prototype.destroy.call(this);
    }
});
