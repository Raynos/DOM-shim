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
