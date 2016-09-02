Ext.namespace("GEOR.Addons");

/*
 * TODO: 
 * - handle dlform
 * - handle ACLs
 * - wizard (1 choose layers (NOK report here) 2 choose extent 3 choose formats 4 enter email )
 * - modifyFeature control improved: non symetrical mode when OpenLayers.Control.ModifyFeature.RESIZE
 */
var enableprojet = [] ;
var enablemethod = [] ;

GEOR.Addons.Newreferential = Ext.extend(GEOR.Addons.Base, {
    win: null,
    jsonFormat: null,
    layer: null,
    modifyControl: null,
    resField: null,
    item: null,
    wps_Config: null,
    WPS_URL: null,
    WPS_identifier: null,
    wpsInitialized: false,

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */

        describeProcess: function (url, identifier) {
        var onDescribeP = this.onDescribeProcess;
        // console.log (onDescribeP)
        // console.log ("onDescribeP ="+onDescribeP);
        
        OpenLayers.Request.GET({
            url: url,
            params: {
                "SERVICE": "WPS",
                "VERSION": "1.0.0",
                "REQUEST": "DescribeProcess",
                "IDENTIFIER": identifier
            },
            success: function(response) {
                var wpsProcess = new OpenLayers.Format.WPSDescribeProcess().read(response.responseText).processDescriptions[identifier];
                onDescribeP(wpsProcess);

        
            },
            failure: function() {
                GEOR.util.errorDialog({
                    msg: OpenLayers.i18n('Server unavailable')
                });
            }
        });
    },

    /**
     * Method: onDescribeProcess
     * Callback executed when the describeProcess response
     * is received.
     *
     * Parameters:
     * response - XML response
     */

    onDescribeProcess: function (process) {

        findDataInputsByIdentifier = function (datainputs, identifier) {
            var datainput, i;

            for (i = 0; i < datainputs.length; i++) {
                if (datainputs[i].identifier === identifier) {
                    datainput = datainputs[i];
                    break;
                }
            }
            return datainput;
        };
        // console.log ("findDataInputsByIdentifier ="+findDataInputsByIdentifier);

        var projet = findDataInputsByIdentifier(process.dataInputs,"projet");
        var Workspace = findDataInputsByIdentifier(process.dataInputs,"Workspace");
        var bbox = findDataInputsByIdentifier(process.dataInputs,"bbox");
        var layer = findDataInputsByIdentifier(process.dataInputs,"layer");
        var inputdem = findDataInputsByIdentifier(process.dataInputs,"inputdem");
        var resolution = findDataInputsByIdentifier(process.dataInputs,"resolution");
        var methodresampling = findDataInputsByIdentifier(process.dataInputs,"methodresampling");      
        var dataprojet = [];
        var datamethod = [];
        
        for (var obj in projet.literalData.allowedValues) {
            if (projet.literalData.allowedValues.hasOwnProperty(obj)) {
                if (enableprojet.length < 1 || enableprojet.indexOf(obj) > -1) { // enableDEM defined in GEOR_custom.js or not
                    dataprojet.push([obj]);
                }
            }
        }
        
        
        for (var obj in methodresampling.literalData.allowedValues) {
            if (methodresampling.literalData.allowedValues.hasOwnProperty(obj)) {
                if (enablemethod.length < 1 || enablemethod.indexOf(obj) > -1) { // enableDEM defined in GEOR_custom.js or not
                    datamethod.push([obj]);
                }
            }
        }
        wps_Config = {
     
            projet: {
                value: "geoxxx",
                title: projet.title,
                allowedValues: dataprojet
            },
            
            Workspace: {
                value: (Workspace.literalData.defaultValue)?Workspace.literalData.defaultValue:'default_workspace',
                title: Workspace.title
            },
            bbox: {
                value: (bbox.literalData.defaultValue)?bbox.literalData.defaultValue:'',
                title: bbox.title
            },
             inputdem: {
                value: (inputdem.literalData.defaultValue)?inputdem.literalData.defaultValue:'default',
                title: inputdem.title
            },
            
             layer: {
                value: (layer.literalData.defaultValue)?layer.literalData.defaultValue:'default',
                title: layer.title
            },
             resolution: {
                value: (resolution.literalData.defaultValue)?resolution.literalData.defaultValue:'10',
                title: resolution.title
            },
              methodresampling: {
                value: "bilinear",
                title: methodresampling.title,
                allowedValues: datamethod
            }
            
        };
        this.wpsInitialized = true;
    },
 
    init: function(record) {
        this.jsonFormat = new OpenLayers.Format.JSON();
        var style = {
            externalGraphic: GEOR.config.PATHNAME + "/app/addons/newreferential/img/shading.png",
            graphicWidth: 16,
            graphicHeight: 16,
            graphicOpacity: 1,
            graphicXOffset: -8,
            graphicYOffset: -8,
            graphicZIndex: 10000,
            strokeColor: "blue",
            strokeWidth: 2,
            fillOpacity: 0,
            cursor: "pointer"
        };
        this.layer = new OpenLayers.Layer.Vector("__georchestra_extractor", {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                "default": Ext.applyIf({}, style),
                "select": Ext.applyIf({}, style)
            })
        });
        this.modifyControl = new OpenLayers.Control.ModifyFeature(this.layer, {
            standalone: true,
            mode: OpenLayers.Control.ModifyFeature.RESHAPE | 
                OpenLayers.Control.ModifyFeature.RESIZE | 
                OpenLayers.Control.ModifyFeature.DRAG,
            autoActivate: true
        });

        if (this.target) {
            // create a button to be inserted in toolbar:
            this.components = this.target.insertButton(this.position, {
                xtype: 'button',
                tooltip: this.getTooltip(record),
                iconCls: 'extractor-icon',
                handler: this.showWindow,
                scope: this
            });
            this.target.doLayout();
        } else {
            // create a menu item for the "tools" menu:
            this.item =  new Ext.menu.CheckItem({
                text: this.getText(record),
                qtip: this.getQtip(record),
                iconCls: 'extractor-icon',
                handler: this.showWindow,
                scope: this
            });
        }
        if (this.options.showWindowOnStartup == true) {
            this.showWindow();
        };
        var lang = OpenLayers.Lang.getCode();
        // this.toolbar  = (this.options.toolbarplacement === "bottom") ? Ext.getCmp("mappanel").bottomToolbar : (this.options.toolbarplacement === "top") ? Ext.getCmp("mappanel").topToolbar : null; 
        WPS_URL = this.options.WPS_URL;
        WPS_identifier = this.options.WPS_identifier;

        if (this.wpsInitialized === false) {
            this.describeProcess(WPS_URL, WPS_identifier);
        };
        
    },
    
    createWindow: function() {
        var FIELD_WIDTH = 170,
            base = {
                forceSelection: true,
                editable: false,
                triggerAction: 'all',
                mode: 'local',
                width: FIELD_WIDTH,
                labelSeparator: OpenLayers.i18n("labelSeparator"),
                valueField: 'value',
                displayField: 'text'
        };
        var projetStore = new Ext.data.SimpleStore({
                fields: [{
                    name: 'value',
                    mapping: 0
                }],
                data: wps_Config.projet.allowedValues
            });
            
                var methodStore = new Ext.data.SimpleStore({
                fields: [{
                    name: 'value',
                    mapping: 0
                }],
                data: wps_Config.methodresampling.allowedValues
            });
            
            
         
         this.projectField  = new Ext.form.ComboBox({
                name: 'project',
                fieldLabel: tr ("project"),
                store: projetStore,
                valueField: 'value',
                value: wps_Config.projet.value,
                displayField: 'value',
                editable: false,
                mode: 'local',
                triggerAction: 'all',
                width: FIELD_WIDTH
            });
            

        this.workspaceField = new Ext.form.TextField({
            fieldLabel: OpenLayers.i18n("Workspace"),
            name: "workspace",
            width: FIELD_WIDTH,
            labelSeparator: OpenLayers.i18n("labelSeparator"),
            value: this.options.defaultWorkspace
        });
        this.resField = new Ext.form.NumberField({
            fieldLabel: OpenLayers.i18n("Resolution for MNT (m)"),
            name: "resolution",
            width: FIELD_WIDTH,
            labelSeparator: OpenLayers.i18n("labelSeparator"),
            value: this.options.defaultRasterResolution,
            decimalPrecision: 0
        });
        this.methodField = new Ext.form.ComboBox(Ext.apply({
            name: "methodresampling",
            fieldLabel: OpenLayers.i18n("Method of Resampling"),
            value: this.options.defaultmethod,
            store: new Ext.data.SimpleStore({
                fields: ['text'],
                data: this.options.methodresampling
            })
        }, base));
        
        this.methodField  = new Ext.form.ComboBox({
                name: 'methodresampling',
                fieldLabel: tr ("methodresampling"),
                store: methodStore,
                valueField: 'value',
                value: wps_Config.methodresampling.value,
                displayField: 'value',
                editable: false,
                mode: 'local',
                triggerAction: 'all',
                width: FIELD_WIDTH
            });
            
        this.adressField = new Ext.form.TextField({
            fieldLabel: OpenLayers.i18n("Feed Adress"),
            name: "adress",
            width: FIELD_WIDTH,
            labelSeparator: OpenLayers.i18n("labelSeparator"),
            value: this.options.defaultadress
        });
        this.layerField = new Ext.form.TextField({
            fieldLabel: OpenLayers.i18n("Layer Name"),
            name: "layer",
            width: FIELD_WIDTH,
            labelSeparator: OpenLayers.i18n("labelSeparator"),
            value: this.options.defaultlayer
        });
        return new Ext.Window({
            closable: true,
            closeAction: 'hide',
            width: 330,
            height: 300,
            title: OpenLayers.i18n("addon_extractor_popup_title"),
            border: false,
            buttonAlign: 'left',
            layout: 'fit',
            items: [{
                xtype: 'form',
                labelWidth: 120,
                bodyStyle: "padding:5px;",
                items: [
                    this.projectField,
                    this.workspaceField,
                    this.resField,                
                    this.methodField,
                    this.adressField,
                    this.layerField

                ]
            }],
            fbar: ['->', {
                text: OpenLayers.i18n("Close"),
                handler: function() {
                    this.win.hide();
                },
                scope: this
            }, {
                text: OpenLayers.i18n("Extract"),
                handler: this.extract,
                scope: this
            }],
            listeners: {
                "show": function() {
                    if (!this.layer.features.length) {
                        this.layer.addFeatures([
                            new OpenLayers.Feature.Vector(
                                this.map.getExtent().scale(0.83).toGeometry()
                            )
                        ]);
                    }
                    this.map.addLayer(this.layer);
                    this.map.zoomToExtent(
                        this.layer.features[0].geometry.getBounds().scale(1.2)
                    );
                    this.map.addControl(this.modifyControl);
                    this.modifyControl.selectFeature(this.layer.features[0]);
                },
                "hide": function() {
                    this.map.removeLayer(this.layer);
                    this.modifyControl.unselectFeature(this.layer.features[0]);
                    this.map.removeControl(this.modifyControl);
                    this.item && this.item.setChecked(false);
                    this.components && this.components.toggle(false);
                },
                scope: this
            }
        });
    },

    showWindow: function() {
        if (!this.win) {
            this.win = this.createWindow();
        }
        this.win.show();
    },
    
    
   
    

    doExtract: function(okLayers) {
        var bboxs = String(this.layer.features[0].geometry.getBounds());
        var reso = String(parseInt(this.resField.getValue()));
        var inputs;
        var projet = {
            identifier: "projet",
            data: {literalData: {value: this.projectField.getValue()}}
        };
        var Workspace = {
            identifier: "Workspace",
            data: {literalData: {value: this.workspaceField.getValue()}}
        };
        var bbox = {
            identifier: "bbox",
            data: {literalData: {value: bboxs}}
        };
        var inputdem = {
            identifier: "inputdem",
            data: {literalData: {value: this.adressField.getValue()}}
        };
        var layer = {
            identifier: "layer",
            data: {literalData: {value: this.layerField.getValue()}}
        };
        var methodresampling = {
            identifier: "methodresampling",
            data: {literalData: {value: this.methodField.getValue()}}
        };
        var resolution = {
            identifier: "resolution",
            data: {literalData: {value: String(parseInt(this.resField.getValue()))}}
        };

        inputs = [projet,Workspace,bbox,inputdem,layer,methodresampling,resolution] ;

        var wpsFormat = new OpenLayers.Format.WPSExecute();
        var xmlString = wpsFormat.write({
            identifier: this.options.WPS_identifier,
            dataInputs: inputs, 
            responseForm: {
                responseDocument: {
                    storeExecuteResponse: true,
                    lineage: false,
                    status: false/*,
                    outputs: [{
                        asReference: false,
                        identifier: "url"
                    },{
                        asReference: false,
                        identifier: "layer"
                    }]*/
                }
            }
        });
        OpenLayers.Request.POST({
            url: this.options.WPS_URL,
            data: xmlString,
            success: this.onExecuted,
            failure: this.onError
        });
    },

    onExecuted: function (resp) {
	    console.log ("succes : "+ resp);
	                        GEOR.util.infoDialog({
                        msg: OpenLayers.i18n('The extraction request succeeded')
                    });
    },	   
    
    onError: function (resp) {
	    console.log ("erreur : "+ resp);
	      GEOR.util.errorDialog({
                        msg: OpenLayers.i18n('The extraction request failed.')
                    });
    },
    	 
    extract: function() {

        var okLayers = [], nokLayers = [], count = this.map.layers.length;
        Ext.each(this.map.layers, function(layer) {
            if (!layer.getVisibility() || !layer.url) {
                count--;
                return;
            }
            GEOR.waiter.show();
            GEOR.ows.WMSDescribeLayer(layer, {
                success: function(store, records) {
                    count--;
                    var r, match = null;
                    for (var i=0, len = records.length; i<len; i++) {
                        r = records[i];
                        if ((r.get("owsType") == "WFS" || r.get("owsType") == "WCS") &&
                            r.get("owsURL") &&
                            r.get("typeName")) {

                            match = {
                                "owsUrl": r.get("owsURL"),
                                "owsType": r.get("owsType"),
                                "layerName": r.get("typeName")
                            };
                            break;
                        }
                    }
                    if (match) {
                        okLayers.push(match);
                    } else {
                        nokLayers.push(layer);
                    }
                    if (count === 0) {
                        this.doExtract(okLayers);
                    }
                },
                failure: function() {
                    count--;
                    nokLayers.push(layer);
                    if (count === 0) {
                        this.doExtract(okLayers);
                    }
                },
                scope: this
            });
        }, this);
    },

    destroy: function() {
        this.win && this.win.hide();
        this.layer = null;
        this.jsonFormat = null;
        this.modifyControl = null;
        
        GEOR.Addons.Base.prototype.destroy.call(this);
    }
});
