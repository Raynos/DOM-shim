var utils = require("utils::index"),
	DOMTokenList = require("interfaces/DOMTokenList").constructor;

module.exports = {
    constructor: DOMSettableTokenList
};

module.exports.constructor.prototype = module.exports;

function DOMSettableTokenList(getter, setter) {
	DOMTokenList.call(this, getter, setter);
}
;(function inherit(Child, Parent) {
	(Child.prototype = Object.create(Parent.prototype)).constructor = Child;
})(DOMSettableTokenList, DOMTokenList);

Object.defineProperty(DOMSettableTokenList.prototype, "value", {
	enumerable : true,
	get : function() {
		return this._getString()
	},
	set : function(newValue) {
		return this._setString(newValue)
	}
})