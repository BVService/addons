WAB ADDON
================
author: @Vanhouteghem

Description 

Wab (WPS Addon Builder) is a generic WPS addon for mapfishapp viewer.
This addon automatically creates the inputs window that will run the WPS. The creation of the inputs is the reading result of the Describe Process.

Wab has several advantages:
- It saves time: each inputs is generated directly from the WPS file.
- Its easy to use: it is not necessary to know Javascript and ExtJs library.

Install 

Typical configuration to include in your GEOR_custom.js file:

    {
        "id": "wab",
        "name": "wab",
        "preloaded": true,
        "title": {
            "en": "wab",
            "es": "wab",
            "fr": "wab"
        },
        "description": {
            "en": "WPS addon",
            "es": "WPS addon",
            "fr": "Addon WPS"
        },
        "options": {
        }
    }
