var getDSTL_property = require("../utils/getDSTL_property.js");

Object.defineProperty(window.Element.prototype, "itemRef", {
	"get" : function() {
		return getDSTL_property(this, "itemref")
	},
	"set" : function(val) {
		return this.setAttribute("itemref", val)
	}
});
