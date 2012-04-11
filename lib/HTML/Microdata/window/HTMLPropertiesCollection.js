var PropertyNodeList = require("PropertyNodeList.js");

module.exports = HTMLPropertiesCollection;

window.HTMLPropertiesCollection = function HTMLPropertiesCollection() {
	var thisObj = this;

	thisObj.length = 0;
	thisObj.names = [];
}

HTMLPropertiesCollection.prototype.__clear__ = function() {
	var thisObj = this;
	
	for(var i in thisObj)
		if(thisObj[i] instanceof PropertyNodeList) {
			thisObj[i] = null;
			delete thisObj[i];
		}
	
	thisObj["length"] = 0;
	thisObj["names"] = [];
}

HTMLPropertiesCollection.prototype.__push__ = function(newNode, prop_value, name) {
	var thisObj = this;
	
	thisObj[thisObj["length"]++] = newNode;
	
	if(!~thisObj["names"].indexOf(name)) {
		thisObj["names"].push(name);
	};
	
	(
		thisObj[name] || (thisObj[name] = new PropertyNodeList())
	)__push__(newNode, prop_value);
}

HTMLPropertiesCollection.prototype.namedItem = function(p_name) {
	return this[p_name] instanceof PropertyNodeList ? this[p_name] : new PropertyNodeList();
}

HTMLPropertiesCollection.prototype.toString = function() {
	return "[object HTMLPropertiesCollection]";
}

HTMLPropertiesCollection.prototype.item = function(_index) {
	var thisObj = this;
	
	if(isNaN(_index))_index = 0;
	
	return thisObj[_index] || null;
}