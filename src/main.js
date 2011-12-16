var shims = require("data::shims"),
	utils = require("utils");

shims.forEach(function _eachShim(name) {
	var shim = require("interfaces::" + name);
	var constructor = window[name];
	if (!constructor) {
		 constructor = window[name] = shim.interface;
	}
	delete shim.interface;
	var proto = constructor.prototype;
	if (shim.prototype) {
		proto = constructor.prototype = shim.prototype;
		delete shim.prototype;
	}

	console.log("adding interface ", name);

	if (shim.hasOwnProperty("constructor")) {
		window[name] = constructor = shim.constructor;
		shim.constructor.prototype = proto;
		delete shim.constructor;
	}

	utils.addShimToInterface(shim, proto, constructor);

	require("bugs::" + name)();
});