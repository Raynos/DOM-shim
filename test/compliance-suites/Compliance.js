function _methodError(t, name, method) {
	return t.ok(false, name + " does not have method " + method);
}

function _methodPass(t, name, method) {
	return t.ok(true, name + " has method " + method);
}

var makeNodes = function () {
	// TODO: Test ProcessingInstruction
	return {
		"el": document.createElement("p"),
		"el2": document.createElement("p"),
		"txt": document.createTextNode(""),
		"com": document.createComment(""),
		"doc": document,
		"doctype": document.implementation.createDocumentType("html5", "", ""),
		"docfrag": document.createDocumentFragment()
	};
};

function _hasMethod(obj, method, t, name) {
	do {
		try {
			var pd = Object.getOwnPropertyDescriptor(obj, method);	
		} catch (e) {
			// IE8 getOwnPropertyDescriptor fails on non-dom
			// so this is not DOM and shimmed
			console.log("some error in getpd" + name + method);
			console.log(e);
			return _methodError(t, name, method); 
		}
		try {
			obj = Object.getPrototypeOf(obj);	
		} catch (e) {
			// IE8 may throw pointer error
			console.log("some error in getPrototypeOf" + name + method);
			console.log(e);
			return _methodError(t, name, method); 
		}
	} while (pd == null && obj !== null);

	if (obj === null) {
		console.log("obj is null" + name + method);
		return _methodError(t, name, method); 
	}
	if (pd === null) {
		console.log("pd is null" + name + method);
		return _methodError(t, name, method); 
	}
	// Check for `.call` property as IE8 thinks functions are typeof "object"
	if (typeof pd.value !== "function" && (!pd.value || !pd.value.call)) {
		console.log("value of method is not function" + name + method);
		console.log(typeof pd.value);
		return _methodError(t, name, method); 
	}
	var f = pd.value;
	try {
		var str = f.toString();
		if (str.indexOf("[native code]") === -1) {
			console.log("non native code" + name + method);
			return _methodError(t, name, method);
		}
	} catch (e) {
		// toString fails in IE8
		// however that means its a valid host method
	}
	return _methodPass(t, name, method);
}

function _propError(t, name, method) {
	return t.ok(false, name + " does not have property " + method);
}

function _propPass(t, name, method) {
	return t.ok(true, name + " has property " + method);
}

function _hasProp(obj, method, t, name) {
	do {
		try {
			var pd = Object.getOwnPropertyDescriptor(obj, method);	
		} catch (e) {
			if (e.message === "Could not convert JavaScript argument") {
				// Firefox says no you cant ask the propertyDescriptor of a host object
				return _propPass(t, name, method);
			} else if (e.message === "Illegal operation on WrappedNative prototype object") {
				// Firefox says no with another error message
				return _propPass(t, name, method);
			} else {
				console.log("called getOwnpd on non-host object");
				console.log(e);
				// IE8 getOwnPropertyDescriptor fails on non-dom
				// so this is not DOM and shimmed
				return _propError(t, name, method); 	
			}
		}
		try {
			obj = Object.getPrototypeOf(obj);	
		} catch (e) {
			console.log("failed to get prototype");
			console.log(e);
			// IE8 may throw pointer error
			return _propError(t, name, method);
		}
	} while (pd == null && obj !== null);

	if (obj === null) {
		console.log("obj is null");
		return _propError(t, name, method); 
	}
	if (pd === null) {
		console.log("pd is null");
		return _propError(t, name, method); 
	}
	var get = pd.get;
	if (!get && !pd.hasOwnProperty("value")) {
		console.log("no get and no value");
		return _propError(t, name, method); 	
	}
	try {
		var str = get.toString();
		if (str.indexOf("[native code]") === -1) {
			console.log("custom code", name, method);
			return _propError(t, name, method);
		}
	} catch (e) {
		// toString fails in IE8
		// however that means its a valid host method
	}
	return _propPass(t, name, method);
};



var testNodeCompliance = function (node, t, name) {
	[
		"contains",
		"hasChildNodes",
		"compareDocumentPosition",
		"insertBefore",
		"appendChild",
		"replaceChild",
		"removeChild",
		"cloneNode",
		"isSameNode",
		"isEqualNode",
		"lookupPrefix",
		"lookupNamespaceURI",
		"isDefaultNamespace"
	].forEach(function (method) {
		_hasMethod(node, method, t, name);	
	});
	[
		"nodeType", 
		"nodeName",
		"baseURI",
		"ownerDocument",
		"parentNode",
		"parentElement",
		"childNodes",
		"firstChild",
		"lastChild",
		"previousSibling",
		"nextSibling",
		"nodeValue",
		"textContent"
	].forEach(function (prop) {
		_hasProp(node, prop, t, name);	
	});
};

suites["Browser Compliance"] = {
	"Node interface": function (t) {
		var nodes = makeNodes();
		Object.keys(nodes).forEach(function (name) {
			var node = nodes[name];
			testNodeCompliance(node, t, name);
		});
		t.done();
	}
};