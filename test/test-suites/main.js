window.makeNodes = function () {
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

window.toArray = function (obj) {
	var arr = [];
	for (var i = 0, len = obj.length; i < len; i++) {
		arr[i] = obj[i];
	}
	return arr;
};

require("./Document");
require("./Element");
require("./Event");
require("./EventTarget");
require("./Node");