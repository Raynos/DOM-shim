var recursivelyWalk = require("index::utils/recursivelyWalk");

module.exports = {
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
	
	if(thisObj.getAttribute("for") !== null)//hasAttribute
		return document.getElementById(thisObj.htmlFor);
	
	var /**
		 * @type {HTMLInputElement|NULL} result
		 */
		result = recursivelyWalk(this.childNodes,
			function(el) {
				if(~["INPUT", "BUTTON", "KEYGEN", "METER", "OUTPUT", "PROGRESS", "TEXTAREA", "SELECT"].indexOf(el.nodeName))
					return el
			}
		) || null;
		
	return result;
}
