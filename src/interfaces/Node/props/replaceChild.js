
function _replaceDocument(child, node, parent) {
    if (node.nodeType === Node.TEXT_NODE ||
        node.nodeType === Node.DOCUMENT_NODE
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        if (node.childNodes.length > 1 ||
            (node.firstChild && 
            node.firstChild.nodeType === Node.TEXT_NODE) 
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = children.length - 1; i >= 0; i--) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === DOCUMENT_TYPE_NODE && 
                !el.isSameNode(child)) &&
                (el.nodeType === ELEMENT_NODE && i < pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _replace(child, node, parent) {
    if (!child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (node.isSameNode(parentOfParent)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parentOfParent.parentNode;
    } while (parentOfParent !== null)

    if (!(parent.nodeType === Node.DOCUMENT_NODE ||
        parent.nodeType === Node.ELEMENT_NODE ||
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        _replaceDocument(child, node, parent);
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) && 
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    parent.ownerDocument.adoptNode(node);
    var ref = child.nextSibling;
    _remove(child, parent);
    _insertBefore(node, parent, ref);
    return child;
}

function _replaceChild(node, child) {
    return _replace(child, node, this);
}

domShim.props.Node.replaceChild = {
    value: _replaceChild
};