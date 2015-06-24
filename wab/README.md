WAB ADDON
================
author: @JVanhouteghem

**Description**

Wab (WPS Addon Builder) is a generic WPS addon for mapfishapp viewer. It works efficiently across all major web browser (Firefox, Chrome, Safari).

Wab has several advantages:
- It saves time: each inputs is generated directly from the WPS file.
- Its easy to use: it is not necessary to know Javascript and ExtJs library.

---------------------------------------------------------------------------

**How to use ?**

Wab automatically creates the inputs window that will run the WPS in mapfishapp. The creation of this inputs is the reading result of the identifier in the Describe Process.

| Name        | Type   | Details               | WPS name input                                                                                                                            |
|-------------|--------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Parameter   | Input  | Fill-in-the-Blank     | ```self.addLiteralInput (identifier="L_input_paramX", title = "foo", type = type(""))```                                                        |
| Coordinates | Input  | Click on the map      | ```self.addLiteralInput (identifier="L_input_coordxyX",title = "foo", abstract = "foobis", type = type("")) ```                                 |
| Combobox    | Input  | ---                   | ```self.addLiteralInput (identifier="L_input_scrollX",title = "foo",abstract = "foo",type = type(""), allowedValues=[10,4,"foo"], default=4)``` |
| Checkbox    | Input  | ---                   | ```self.addLiteralInput (identifier="L_input_checkboxX",title = "foo",type = type(""))```                                                       |
| GML         | Input  | Load gml from desktop | ```self.addComplexInput (identifier="C_input_gmlX",title = "foo",abstract = "",formats = [{'mimeType': 'text/xml'}]) ```                        |
| Load WMS    | Output | ---                   | ```self.addLiteralOutput (identifier="L_output_wmsX",title="")```                                                                               |
| Info window | Output | ---                   | ```self.addLiteralOutput (identifier="L_output_paramX",title="foo")```|
---------------------------------------------------------------------------

**Install** 

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
