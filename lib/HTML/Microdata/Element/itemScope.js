Object.defineProperty(window.Element.prototype, "itemScope", {
	"get" : function() {
		return this.getAttribute("itemscope") !== null
	}, 
	"set" : function(val) {
		val ? this.setAttribute("itemscope", "") : this.removeAttribute("itemscope");
		
		return val;
	}
});
