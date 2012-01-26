var recursivelyWalk = require(".../utils").recursivelyWalk;

module.exports = {
	interface: window.HTMLLabelElement || window.Element || window.Node,
	control: {
		get: getControl
	}
}

/*
https://developer.mozilla.org/en/DOM/HTMLLabelElement
http://www.w3.org/TR/html5/forms.html#dom-label-control
*/
function getControl() {
//    if(this.nodeName !== "LABEL")
//		return void 0;
	
	if(this.getAttribute("for") !== null)//hasAttribute
		return document.getElementById(this.htmlFor);
	
	return recursivelyWalk(this.childNodes,
			function(el) {
				if(~["INPUT", "BUTTON", "KEYGEN", "METER", "OUTPUT", "PROGRESS", "TEXTAREA", "SELECT"].indexOf(el.nodeName))
					return el
			}
		) || null;
}
