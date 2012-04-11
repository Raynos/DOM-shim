//http://www.w3.org/TR/html5/common-dom-interfaces.html#domsettabletokenlist-0

var DOMTokenList = require("DOMTokenList");

module.exports = DOMSettableTokenList;

function DOMSettableTokenList(getter, setter) {
	DOMTokenList.call(this, getter, setter);
}
DOMSettableTokenList.prototype = Object.create(DOMTokenList.prototype)
DOMSettableTokenList.prototype.constructor = DOMSettableTokenList;

Object.defineProperty(DOMSettableTokenList.prototype, "value", {
	enumerable : true,
	get : function() {
		return this._getString()
	},
	set : function(newValue) {
		return this._setString(newValue)
	}
})