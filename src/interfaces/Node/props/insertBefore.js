function _preInsertDocumentFragment (node, parent, child) {
    var hasEle = false;
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
        var el = node.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        } else if (el.nodeType === Node.ELEMENT_NODE) {
            if (hasEle) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            } else {
                hasEle = true;
            }
        }
    }
}

function _preInsertElement(node, parent, child) {
    var children = parent.childNodes,
        pos = 0;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.ELEMENT_NODE && child === null) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            if (i > pos) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _preInsertDocumentType(node, parent, child) {
    var children = parent.childNodes,
        pos = 0,
        firstEl = -1;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.ELEMENT_NODE) {
            firstEl === -1 && (firstEl = i);
        }
    }
    if (firstEl < pos || child === null && firstEl > -1) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
}

function _preInsert(node, parent, child) {
    if (child && !child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (parentOfParent.isSameNode(node)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parent.parentNode;
    } while (parentOfParent != null)

    var condition = parent.nodeType === Node.DOCUMENT_NODE || 
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE;
    if (!condition) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        if (node.nodeType === Node.TEXT_NODE || 
            node.nodeType === Node.DOCUMENT_NODE
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            _preInsertDocumentFragment(node, parent, child);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            _preInsertElement(node, parent, child);
            
        }
        if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
            _preInsertDocumentType(node, parent, child);
        }
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) &&
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    parent.ownerDocument.adoptNode(node);
    _insert(node, parent, child);
    return child;
}

function _insert(node, parent, child) {
    var nodes = [node];
    if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        nodes = node.childNodes;
    }
    var count = nodes.length;
    var children = parent.childNodes;
    var len = children.length;
    // TODO: handle ranges
    
    if (child === null) {
        for (var j = 0; i < count; j++) {
            children[len + j] = nodes[j];
        }
    } else {
        for (var i = len - 1; i >= 0; i--) {
            var el = children[i];
            children[i + count] = el;
            if (el === child) {
                for (var j = 0; i < count; j++) {
                    children[i + j] = nodes[j];
                }
                break;
            }
        }   
    }
    
    children.length = len + count;
}

function _insertBefore(node, child) {
    return _preInsert(node, this, child);
}

domShim.props.Node.insertBefore = {
    value: _insertBefore
}