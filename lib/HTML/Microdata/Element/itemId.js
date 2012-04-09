Object.defineProperty(window.Element.prototype, "itemId", {
	"get" : function() {
		var val = (this.getAttribute("itemid") || "").trim();
		
		if(val && !/\w+:(\/\/)?[\w][\w.\/]*/.test(val))val = location.href.replace(/\/[^\/]*$/, "/" + escape(val));
		
		return val;
	},
	"set" : function(val) {
		return this.setAttribute("itemid", val + "")
	}
});
