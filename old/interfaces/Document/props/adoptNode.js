var recursivelyWalk = domShim.utils.recursivelyWalk,
    throwDOMException = domShim.utils.throwDOMException

function _adopt(node, doc) {
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

function _adoptNode(node) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    _adopt(node, this);
    return node;
}


domShim.props.Document.adoptNode = {
    value: _adoptNode
};