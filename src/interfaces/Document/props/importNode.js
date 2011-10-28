var _clone = domShim.common._clone,
    throwDOMException = domShim.utils.throwDOMException;

function _importNode(node, deep) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    if (deep === undefined) {
        deep = true;
    }
    var clone = _clone(node, this, deep);
    return clone;
}

domShim.props.Document.importNode = {
    value: _importNode
};