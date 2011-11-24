var shims = require("interfaces"),
	utils = require("./utils");

var getRealInterface = (function () {

	function getFallbackInterface(name) {
		var interface;
		if (name === "Node") {
			interface = window.Element;
		} else if (name === "CustomEvent") {
			interface = window.Event;
		} else if (name === "EventTarget") {
			interface = window.Element;
		} else if (name === "Document") {
			interface = window.HTMLDocument;
		}
		return interface;
	}

	return function getRealInterface(name) {
		var interface = window[name];
		if (interface === undefined) {
			interface = getFallbackInterface(name);
		}
		return interface;
	}
	
}());

Object.keys(shims).forEach(function _eachShim(name) {
	var constructor = getRealInterface(name);
	var proto = constructor.prototype;
	var shim = shims[name];

	if (shim.constructor) {
		window[name] = constructor = shim.constructor;
		shim.constructor.prototype = proto;
		delete shim.constructor;
	}

	utils.addShimToInterface(shim, proto, constructor);
});

require("./bugs");