var HTMLPropertiesCollection = require("../window/HTMLPropertiesCollection.js");;

Object.defineProperty(window.Element.prototype, "properties", {
	"get" : function() {
		var thisObj = this;
		
		if(!thisObj["_"]) {
			thisObj["_"] = {};
		}
		var _ = thisObj["_"]["_mcrdt_"] || (thisObj["_"]["_mcrdt_"] = {});
		
		var properties = _.__properties_CACHE__;
		
		if(properties) {
			if(!window["microdata_liveProperties"]) {//Cached value
				return properties;
			}
			else properties.__clear__();
		}
		else properties = _.__properties_CACHE__ = new HTMLPropertiesCollection();
		
		var pending = [],
			props = [],
			references = [],
			current,
			k = -1,
			el;

		while(el = thisObj.childNodes[++k])
			if(el.nodeType === 1)pending.push(el);
		
		if(thisObj.getAttribute("itemref")) {
			references = thisObj.getAttribute("itemref").trim().split(/\s+/);

			references.forEach(function(reference) {
				var element = document.getElementById(reference);

				if(element)pending.push(element);
			});
		}

		pending = pending.filter(function(candidate, index) {
			var scope = null,
				parent = candidate,
				ancestors = [];

			if (pending.indexOf(candidate) !== index &&
				pending.indexOf(candidate, index) !== -1)
				return false;
			
			if(candidate["id"] && references.indexOf(candidate["id"]) !== -1)
				return true;

			while((parent = parent.parentNode) !== null && parent.nodeType === 1) {
				ancestors.push(parent);
				if(parent.getAttribute("itemscope") !== null) {
					scope = parent;
					break;
				}
			}

			if (scope !== null) {
				if (pending.indexOf(scope) !== -1)return false;

				return !ancestors.some(function(ancestor) {
					var elementIndex = -1,
						elementParent,
						elementScope = null;

					if ((elementIndex = pending.indexOf(ancestor)) !== -1) {
						elementParent = pending[elementIndex];

						while((elementParent = elementParent.parentNode) !== null &&
							   elementParent.nodeType === 1) {
							if (elementParent.getAttribute("itemscope") !== null) {
								elementScope = elementParent;
								break;
							}
						}
						if (elementScope === scope)return true;
					}
					return false;
				});
			}
			
			return true;
		});

		pending.sort(function(a, b) {
			return 3 - (b.compareDocumentPosition(a) & 6);
		});

		while((current = pending.pop())) {
			if(current.getAttribute("itemprop")) {
				props.push(current);
			}
			
			if (current.getAttribute("itemscope") === null) {
				k = current.childNodes.length;
				while(el = current.childNodes[--k])
					if(el.nodeType === 1)pending.push(el);
			}
		}
				
		
		props.forEach(function(property) {
			k = -1;
			current = property["itemProp"];
			while(el = current[++k])
				properties.__push__(property, property["itemValue"], el);
		});

		return properties;
	}
});
