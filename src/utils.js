var hasOwnProperty = Object.prototype.hasOwnProperty;

function addShimToInterface(shim, proto, constructor) {
	Object.keys(shim).forEach(function _eachShimProperty(name) {
		if (name === "constants") {
			var constants = shim[name];
			Object.keys(constants).forEach(function _eachConstant(name) {
				if (!hasOwnProperty.call(constructor, name)) {
					constructor[name] = constants[name];	
				}
			});
			return;
		}

		if (!hasOwnProperty.call(proto, name)) {
			var pd = shim[name];
			pd.writable = false;
			pd.configurable = true;
			pd.enumerable = false;
			Object.defineProperty(proto, name, pd);	
		}
	});
}

module.exports = {
	addShimToInterface: addShimToInterface
}