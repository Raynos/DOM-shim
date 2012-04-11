module.exports = PropertyNodeList;

window.PropertyNodeList = function PropertyNodeList() {
	var thisObj = this;

	thisObj.length = 0;
	thisObj.values = [];
}

PropertyNodeList.prototype.__push__ = function(newNode, prop_value) {
	var thisObj = this;
	
	thisObj[thisObj.length++] = newNode;
	thisObj.values.push(prop_value)
}

PropertyNodeList.prototype.getValues = function() {
	var _value = [], k = -1, el;
	
	while(el = this[++k])
		_value.push(el["itemValue"]);
	
	return _value;
}

PropertyNodeList.prototype.toString = function() {
	return "[object PropertyNodeList]";
}

PropertyNodeList.prototype.item = function(_index) {
	var thisObj = this;
	
	if(isNaN(_index))_index = 0;
	
	return thisObj[_index] || null;
}