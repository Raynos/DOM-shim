var DOMSettableTokenList = require("DOMSettableTokenList.js");

function getDSTL_property(node, attributeName) {
	if(!node["_"]) {
		node["_"] = {};
	}
	
	var attributeValue = node.getAttribute(attributeName),
		_ = node["_"]["_mcrdt_"] || (node["_"]["_mcrdt_"] = {}),
		_currentValue = _[attributeName];
	
	if(!_currentValue) {
		_currentValue = _[attributeName] = new DOMSettableTokenList(attributeValue, function() {
			node.setAttribute(attributeName, this + "");
		});
	}
	else if(attributeValue !== null && _currentValue + "" !== attributeValue) {
		_currentValue.update(attributeValue);
	}
	
	return _currentValue;
}
