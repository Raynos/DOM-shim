throwDOMException = domShim.utils.throwDOMException;

function _createElementNS(namespace, name) {
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

domShim.props.Document.createElementNS = {
    value: _createElementNS
};