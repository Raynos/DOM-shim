var DOMSettableTokenList = require("DOMSettableTokenList.js");

module.exports = getDSTL_property;

function getDSTL_property(node, attributeName) {
	if(!node["_"]) {
		node["_"] = {};
	}
	
	var _ = node["_"]["_mcrdt_"] || (node["_"]["_mcrdt_"] = {}),
		_currentValue = _[attributeName];
	
	if(!_currentValue) {
		_currentValue = _[attributeName] = new DOMSettableTokenList(
			node.getAttribute.bind(node, attributeName), 
			function() {
				node.setAttribute(attributeName, this + "");
			}
		);
	}
	else {
		var attributeValue = node.getAttribute(attributeName);
		
		if(attributeValue !== null && _currentValue + "" !== attributeValue) {
			_currentValue.update(attributeValue);
		}
	}
	
	return _currentValue;
}
