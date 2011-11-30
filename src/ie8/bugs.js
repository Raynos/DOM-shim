var utils = require("utils::index"),
    documentShim = require("shims::interfaces/Document"),
    nodeShim = require("shims::interfaces/Node"),
    elementShim = require("shims::interfaces/Element"),
	eventTargetShim = require("shims::interfaces/EventTarget");

module.exports = run;

function run() {

// IE8 Document does not inherit EventTarget
(function () {
    if (!document.addEventListener) {
        utils.addShimToInterface(eventTargetShim, document);
    }
})();

// IE8 window.addEventListener does not exist
(function () {
    if (!window.addEventListener) {
        window.addEventListener = document.addEventListener.bind(document);
    }
    if (!window.removeEventListener) {
        window.removeEventListener = document.removeEventListener.bind(document);
    }
    if (!window.dispatchEvent) {
        window.dispatchEvent = document.dispatchEvent.bind(document);
    }
})();


// IE8 hurr durr doctype is null
(function () {
    if (document.doctype === null) {
        Object.defineProperty(document, "doctype", documentShim.doctype);
    }
})();

// IE8 hates you and your f*ing text nodes
// I mean text node and document fragment and document no inherit from node
(function () {
    if (!document.createTextNode().contains) {
        utils.addShimToInterface(nodeShim, Text.prototype, Text);
    }

    if (!document.createDocumentFragment().contains) {
        utils.addShimToInterface(nodeShim, HTMLDocument.prototype, HTMLDocument);
    }

    if (!document.getElementsByClassName) {
        document.getElementsByClassName = elementShim.getElementsByClassName.value;
    }
})();

// IE8 can't write to ownerDocument
(function () {
    var el = document.createElement("div");
    try {
        el.ownerDocument = 42;
    } catch (e) {
        var pd = Object.getOwnPropertyDescriptor(Element.prototype, "ownerDocument");
        var ownerDocument = pd.get;
        Object.defineProperty(Element.prototype, "ownerDocument", {
            get: function () {
                if (this._ownerDocument) {
                    return this._ownerDocument;
                } else {
                    return ownerDocument.call(this);
                }
            },
            set: function (v) {
                this._ownerDocument = v;
            },
            configurable: true
        });
    }
})();

// IE - contains fails if argument is textnode
(function () {
    var txt = document.createTextNode("temp"),
        el = document.createElement("p");

    el.appendChild(txt);

    try {
        el.contains(txt);
    } catch (e) {
        // The contains method fails on text nodes in IE8
        // swap the contains method for our contains method
        Node.prototype.contains = nodeShim.contains.value;
    }
})();

require("all::bugs")();

}