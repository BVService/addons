New referential ADDON
=====================

This addon allows users to create a new study area or workspace and automacally extract layers usefull to model from different sources.

author: @ybenchekroun

Typical configuration to include in your GEOR_custom.js file:

    {
        "id": "newreferential_0",
        "name": "Newreferential",
        "title": {
            "en": "New referential",
            "es": "nuevo referencial",
            "fr": "Nouveau référentiel"
        },
        "description": {
            "en": "This addon allows one to create a new study area for BV Service project and automacally extract publish layers usefull to model from different sources.",
            "es": "This addon allows one to create a new study area for BV Service project and automacally extract publish layers usefull to model from different sources.",
            "fr": "Cet addon permet de créer un nouvelle zone d'étude pour le projet BV Service. Il extrait automatiquement les couches utiles et les publie sur un GeoServer."
        },
        "roles": [
            "ROLE_MOD_EXTRACTORAPP"
        ],
        "options": {
            "showWindowOnStartup": false,
            "srsData": [
                ["EPSG:4326", "WGS84 (EPSG:4326)"],
                ["EPSG:3857", "Spherical Mercator (EPSG:3857)"]
            ],
            "defaultSRS": "EPSG:4326",
            "defaultVectorFormat": "shp", // must be one of shp, mif, tab, kml
            "defaultRasterFormat": "geotiff", // must be one of geotiff, tiff
            "defaultRasterResolution": 50 // in centimeters
        }
    }

The above options are the defaults. Feel free to customize their values.

If ```showWindowOnStartup``` is set to true, the extractor window pops up as soon as the addon is loaded.
