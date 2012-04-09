var getDSTL_property = require("../utils/getDSTL_property.js");

Object.defineProperty(window.Element.prototype, "itemType", {
	"get" : function() {
		return getDSTL_property(this, "itemtype")
	},
	"set" : function(val) {
		return this.setAttribute("itemtype", val)
	}
});
