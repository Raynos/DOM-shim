function _locateNamespacePrefix(el, namespace) {
    if (el.namespaceURI === namespace) {
        if (el.prefix == null) {
            return null;
        }
        return el.prefix;
    }
    var attrs = el.attributes;
    for (var i = 0, len = attrs.length; i < len; i++) {
        var attr = attrs[i];
        if (attr.prefix === "xmlns" && attr.value === namespace) {
            return attr.localname;
        }
    }
    var parent = node.parentElement
    if (parent !== null) {
        return _locateNamespacePrefix(parent, namespace);
    }
    return null;
}

function _lookupPrefix(namespace) {
    if (namespace === null || namespace === "") {
        return null;
    }
    if (this.nodeType === Node.ELEMENT_NODE) {
        return _locateNamespacePrefix(this, namespace);
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return _locateNamespacePrefix(this.documentElement, namespace);
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE ||
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        return null
    } else {
        var parent = this.parentElement;
        if (parent !== null) {
            return _locateNamespacePrefix(parent, namespace);
        }
        return null;
    }
}

domShim.props.Node.lookupPrefix = {
    value: _lookupPrefix
};