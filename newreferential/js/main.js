Ext.namespace("GEOR.Addons");

/*
 * TODO: 
 * - handle dlform
 * - handle ACLs
 * - wizard (1 choose layers (NOK report here) 2 choose extent 3 choose formats 4 enter email )
 * - modifyFeature control improved: non symetrical mode when OpenLayers.Control.ModifyFeature.RESIZE
 */
var enableprojet = [] ;

GEOR.Addons.Newreferential = Ext.extend(GEOR.Addons.Base, {
    win: null,
    jsonFormat: null,
    layer: null,
    modifyControl: null,
    item: null,
    wps_Config: null,
    WPS_URL: null,
    WPS_identifier: null,
    wpsInitialized: false,
    layerStore: null,
    map : null,
    extentzoom : null ,
    checkshow : null ,

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
    
        var dataprojet = [];
        
        for (var obj in projet.literalData.allowedValues) {
            if (projet.literalData.allowedValues.hasOwnProperty(obj)) {
                if (enableprojet.length < 1 || enableprojet.indexOf(obj) > -1) { // enableDEM defined in GEOR_custom.js or not
                    dataprojet.push([obj]);
                }
            }
        }
        
        wps_Config = {
     
            projet: {
                value: "bvservice",
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
            }
        };
        this.wpsInitialized = true;
    },
 
    init: function(record) {
        this.jsonFormat = new OpenLayers.Format.JSON();
        layerStore = Ext.getCmp("mappanel").layers;
        var style = {
            externalGraphic: GEOR.config.PATHNAME + "/app/addons/newreferential/img/shading.png",
            graphicWidth: 16,
            graphicHeight: 16,
            graphicOpacity: 1,
            graphicXOffset: -8,
            graphicYOffset: -8,
            graphicZIndex: 10000,
            strokeColor: "red",
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
        
        this.contextshow = new Ext.form.Checkbox({ 
					id: 'checkbox',
					width: FIELD_WIDTH,
					xtype: 'checkbox',
					fieldLabel: "Afficher les couches générées",
					checked: true
            });
            
        checkshow=this.contextshow;
        
            noglob_regionContent = new Ext.Panel({ //new Ext.form.Panel({ is not a constructor
            title: OpenLayers.i18n("rapport_extraction"),
            activate: true,
            region: 'south',
            collapsible: true,
            collapsed: false,
            split: true,
    });
    
    
    var onglet2 = {
            closable: true,
            closeAction: 'hide', //FAIL noglob_myPanel.hide,
			title: OpenLayers.i18n("param_extract"),
            plain: true,
            buttonAlign: 'right',
            autoScroll: true, 
            items: [{
                xtype: 'form',
                labelWidth: 120,
                bodyStyle: "padding:5px;",
                items: [
                    this.projectField,
                    this.workspaceField,
                    this.contextshow

                ]
            }]
        };


        return new Ext.Window({
            title: OpenLayers.i18n("addon_extractor_popup_title"),
            closable: true,
            closeAction: 'hide', 
            width: 330, // auto provoque un bug de largeur sur Chrome
			height:Ext.getBody().getViewSize().height - 121,//62,
			y: '90px',//'31px', 
			x: '0%',
            plain: true,
            buttonAlign: 'right',
            autoScroll: true,
            items: [
            onglet2,
            noglob_regionContent
            ],
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
                    map = this.map ;
                    if (!this.layer.features.length) {
                        this.layer.addFeatures([
                            new OpenLayers.Feature.Vector(
                                this.map.getExtent().scale(0.3).toGeometry()
                            )
                        ]);
                    }
                    this.map.addLayer(this.layer);
                   /*
                    this.map.zoomToExtent(
                        this.layer.features[0].geometry.getBounds().scale(1)
                    );
                    */ 
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
        extentzoom=bboxs.split(",");
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


        inputs = [projet,Workspace,bbox] ;

        var wpsFormat = new OpenLayers.Format.WPSExecute();
        var xmlString = wpsFormat.write({
            identifier: this.options.WPS_identifier,
            dataInputs: inputs, 
            responseForm: {
                responseDocument: {
                    storeExecuteResponse: true,
                    lineage: false,
                    status: false,
                    outputs: [{
                        asReference: false,
                        identifier: "output"
                    }
                    ]
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
        someText=resp.responseText.split("||");
        rapport=someText[1].replace(/(\r\n|\n|\r)/gm,"<br>");
        noglob_regionContent.update("<br>"+rapport);
        if(checkshow.checked == true)
                {
        lignes=someText[1].split(/(\r\n|\n|\r)/gm);
        
        var listnamelayer = [];
        var adressewms = ""
        var nomcouche = "";
        for (var i=0; i<lignes.length; i++)
        {
            positionlink = lignes[i].indexOf('http');
            positionnamelayer = lignes[i].indexOf('Avec le nom de la couche');
            
            if (positionnamelayer > -1)
            {
                nomcouche=lignes[i].split(":");
                listnamelayer.push(nomcouche[1]+":"+nomcouche[2]);    
            }
            else if (positionlink > -1 && adressewms == "" )
            {
              adressewms = lignes[i];
            }
            
        };
        
        
        for (var j=0; j<listnamelayer.length; j++)
        {
         //   var layerNameparse3 = listnamelayer[j].replace(' ',''); // 
            //var layerUrlparse3 = adressewms; // http://geoxxx.agrocampus-ouest.fr:80/geoserverwps/wfs

        // PART 2 : Ajout du WMS	
            var wmsname = "wms"+String(j)
			var wmsdyn3 = new OpenLayers.Layer.WMS(wmsname,
					adressewms, 
					{'layers': listnamelayer[j].replace(' ',''),transparent: true} //, transparent: true, format: 'image/gif'
					//,{isBaseLayer: true}
				);
            var c3 = GEOR.util.createRecordType();
            var layerRecord3 = new c3({
                layer: wmsdyn3,
                name: listnamelayer[j].replace(' ',''), 
                type: "WMS"
            });
            eval(
            'var clone'+String(j)+' = layerRecord3.clone();'
           +' GEOR.ows.hydrateLayerRecord(clone'+String(j)+', {'
                +'success: function() {'
                   +' clone'+String(j)+'.get("layer").setName(clone'+String(j)+'.get("title"));'
                    +'layerStore.addSorted(clone'+String(j)+');'
                +'},'
                +'failure: function() {'
                   +' GEOR.util.errorDialog({'
                       +' msg: "Impossible d obtenir les informations de la couche !"'

                    +'});'
                    +'GEOR.waiter.hide();'
                +'},'
              +'  scope: this'
           +' });')

     }
     var mapforzoom = clone0.get('layer').map ; 
                    var llbbox = OpenLayers.Bounds.fromArray(extentzoom); 
					map.zoomToExtent(llbbox);	
 }
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
            
            GEOR.ows.WMSDescribeLayer(layer, {
                success: function(store, records) {
                    GEOR.waiter.show();
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
                   GEOR.waiter.hide(); 
                },
                failure: function() {
                    GEOR.waiter.show();
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
