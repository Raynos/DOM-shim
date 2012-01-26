var DOMTokenList = require("all::interfaces/DOMTokenList").constructor;

module.exports = {
	parentElement: {
		get: getParentElement
	},
    classList: {
        get: getClassList
    },
	labels: {
		get: getlabels
	}
}

function getParentElement() {
    var parent = this.parentNode;
    if (parent == null) {
        return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent;
    }
    return null;
}

function getClassList() {
    var el = this;

    if (this._classList) {
        return this._classList;
    } else {
        var dtlist = new DOMTokenList(
            function _getClassName() {
                return el.className || "";
            },
            function _setClassName(v) {
                el.className = v;
            }
        );
        this._classList = dtlist;
        return dtlist;
    }
}

/*
https://developer.mozilla.org/en/DOM/HTMLInputElement
http://www.w3.org/TR/html5/forms.html#dom-lfe-labels
require: HTMLLabelElement.control

TODO:: fix wrong "labels" implimantation in Opera 11.6* https://twitter.com/statuses/162234890039988224
*/
function getlabels() {
	if(!~["INPUT", "BUTTON", "KEYGEN", "METER", "OUTPUT", "PROGRESS", "TEXTAREA", "SELECT"].indexOf(this.nodeName))
		return void 0;
	
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