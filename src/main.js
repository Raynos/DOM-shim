var shims = require("shims::interfaces"),
	utils = require("utils");

Object.keys(shims).forEach(function _eachShim(name) {
	var shim = shims[name];
	var constructor = window[name];
	if (!constructor) {
		 constructor = window[name] = shim.interface;
	}
	delete shim.interface;
	var proto = constructor.prototype;
	

	if (shim.hasOwnProperty("constructor")) {
		window[name] = constructor = shim.constructor;
		shim.constructor.prototype = proto;
		delete shim.constructor;
	}

	utils.addShimToInterface(shim, proto, constructor);
});

require("shims::bugs")();