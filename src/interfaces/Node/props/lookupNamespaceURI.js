function _locateNamespace(node, prefix) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.namespaceURI !== null && node.prefix === prefix) {
            return node.namespaceURI;
        }
        var attrs = node.attributes;
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if ((attr.prefix === "xmlns" && attr.localname === prefix) ||
                (attr.prefix === null && attr.localname === "xmlns")
            ) {
                return attr.value || null;
            }
        }
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix)
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
        var docElem = node.documentElement;
        if (docElem) {
            return _locateNamespace(docElem, prefix);
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE
    ) {
        return null;
    } else {
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix);
        }
        return null;
    }
}

function _lookupNamespaceURI(prefix) {
    return _locateNamespace(this, prefix);
}

domShim.props.Node.lookupNamespaceURI = {
    value: _lookupNamespaceURI
};