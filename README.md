Mark-Text-Macro
===============

Allows marking text in files by pressing alt+M, persists across file close/reopen

You can change the color of the highlight by settings the pref via a macro (just delete it afterwards):

```js
var hexColor = "#FF0000";
ko.prefs.setLong('ext_marksel_color', ("require" in window) ? 
                                        require("ko/color").RGBToBGR(hexColor) : 
                                        xtk.color.hexToLong(hexColor));
```
