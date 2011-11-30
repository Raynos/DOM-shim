var throwDOMException = require("utils::index").throwDOMException,
    recursivelyWalk = require("utils::index").recursivelyWalk,
	clone = require("utils::index").clone;

module.exports = {
    adoptNode: {
        value: adoptNode  
    },
    createElementNS: {
        value: createElementNS  
    },
	createEvent: {
		value: createEvent
	},
    doctype: {
        get: getDocType
    },
	importNode: {
		value: importNode	
	},
	interface: function () { },
    prototype: document
};

function createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
}   

function importNode(node, deep) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    if (deep === undefined) {
        deep = true;
    }
    return clone(node, this, deep);
}

function getDocType() {
    var docType = this.childNodes[0];
    // TODO: remove assumption that DOCTYPE is the first node
    Object.defineProperty(docType, "nodeType", {
       get: function () { return Node.DOCUMENT_TYPE_NODE; } 
    });
    return docType;
}

function createElementNS(namespace, name) {
    var prefix, localName;

    if (namespace === "") {
        namespace = null;
    }
    // TODO: check the Name production
    // TODO: check the QName production
    if (name.indexOf(":") > -1) {
        var split = name.split(":");
        prefix = split[0];
        localName = split[1];
    } else {
        prefix = null;
        localName = name;
    }
    if (prefix === "" || prefix === "undefined") {
        prefix = null;
    }
    if ((prefix !== null && namespace === null) ||
        (
            prefix === "xml" &&
            namespace !== "http://www.w3.org/XML/1998/namespace"    
        ) ||
        (
            (name === "xmlns" || prefix === "xmlns") &&
            namespace !== "http://www.w3.org/2000/xmlns/"    
        ) ||
        (
            namespace === "http://www.w3.org/2000/xmlns/" &&
            (name !== "xmlns" && prefix !== "xmlns")
        )
    ) {
        throwDOMException(DOMException.NAMESPACE_ERR);
    }
    var el = this.createElement(localName);
    el.namespaceURI = namespace;
    el.prefix = prefix;
    return el;
}

function adopt(node, doc) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        // TODO: base URL change
    }
    if (node.parentNode !== null) {
        node.parentNode.removeChild(node);
    }
    recursivelyWalk([node], function (node) {
        node.ownerDocument = doc;
    });
}

function adoptNode(node) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    adopt(node, this);
    return node;
}