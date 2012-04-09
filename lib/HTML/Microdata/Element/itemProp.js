var getDSTL_property = require("../utils/getDSTL_property.js");

Object.defineProperty(window.Element.prototype, "itemProp", {
	"get" : function() {
		return getDSTL_property(this, "itemprop")
	},
	"set" : function(val) {
		return this.setAttribute("itemprop", val)
	}
});
