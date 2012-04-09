document.getItems = function(typesToFound) {
	typesToFound = (typesToFound || "").trim().split(/\s+/);
	
	var microItems = this.querySelectorAll("[itemscope]"),
		node,
		matches = [],
		i = -1;
	
	while(node = microItems[++i]) {
		var itemTypes = node.itemType,
			curType,
			accept;
		
		if(itemTypes.length &&
		   !node.getAttribute("itemprop") &&
		   (!("itemScope" in node) || node["itemScope"]) &&
		   typesToFound.some(function(type) {
			  return itemTypes.contains(type)
		   })) {
			matches.push(node)
		}
	}
	
	return matches;
};