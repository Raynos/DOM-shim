module.exports = {
	interface: window.HTMLElement || window.Element || window.Node,
	labels: {
		get: getLabels
	}
}

/*
https://developer.mozilla.org/en/DOM/HTMLInputElement
http://www.w3.org/TR/html5/forms.html#dom-lfe-labels
require: HTMLLabelElement.control
*/
function getLabels() {
	//if(!~["INPUT", "BUTTON", "KEYGEN", "METER", "OUTPUT", "PROGRESS", "TEXTAREA", "SELECT"].indexOf(this.nodeName))
	//	return void 0;
	
	var node = this,
		/**
		 * represents the list of label elements, in [!]tree order[!]
		 * @type {Array}
		 */
		result = this.id ?
			Array.prototype.slice.apply(document.querySelectorAll("label[for='" + this.id + "']")) :	
			[],
		_lastInTreeOrder_index = result.length - 1;

	while((node = node.parentNode) && (!node.control || node.control === this))
		if(node.nodeName === "LABEL") {
			
			while(result[_lastInTreeOrder_index] && 
				result[_lastInTreeOrder_index].compareDocumentPosition(node) & 2)//DOCUMENT_POSITION_PRECEDING
				_lastInTreeOrder_index--;
			result.splice(_lastInTreeOrder_index + 1, 0, node)
		}
		
	return result;
}
