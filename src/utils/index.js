var hasOwnProperty = Object.prototype.hasOwnProperty;


var HTMLNames = [
    "HTMLDocument", "HTMLLinkElement", "HTMLElement", "HTMLHtmlElement", 
    "HTMLDivElement", "HTMLAnchorElement", "HTMLSelectElement", 
    "HTMLOptionElement", "HTMLInputElement", "HTMLHeadElement", 
    "HTMLSpanElement", "XULElement", "HTMLBodyElement", "HTMLTableElement", 
    "HTMLTableCellElement", "HTMLTextAreaElement", "HTMLScriptElement", 
    "HTMLAudioElement", "HTMLMediaElement", "HTMLParagraphElement", 
    "HTMLButtonElement", "HTMLLIElement", "HTMLUListElement", 
    "HTMLFormElement", "HTMLHeadingElement", "HTMLImageElement", 
    "HTMLStyleElement", "HTMLTableRowElement", "HTMLTableSectionElement", 
    "HTMLBRElement"
];

module.exports = {
	addShimToInterface: addShimToInterface,
	throwDOMException: throwDOMException,
	HTMLNames: HTMLNames
}

function throwDOMException(code) {
    var ex = Object.create(DOMException.prototype);
    ex.code = code;
    throw ex;
}

function addShimToInterface(shim, proto, constructor) {
	Object.keys(shim).forEach(function _eachShimProperty(name) {
		if (name === "constants") {
			var constants = shim[name];
			Object.keys(constants).forEach(function _eachConstant(name) {
				if (!hasOwnProperty.call(constructor, name)) {
					constructor[name] = constants[name];	
				}
			});
			return;
		}

		if (!hasOwnProperty.call(proto, name)) {
			var pd = shim[name];
			if (pd.value) {
				pd.writable = false;
			}
			pd.configurable = true;
			pd.enumerable = false;
			Object.defineProperty(proto, name, pd);	
		}
	});
}