function _preremove(node, parent) {
    if (!node.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    _remove(node, parent);
    return node;
}

function _remove(node, parent) {
    var found = false,
        children = parent.childNodes;

    // TODO: handle ranges

    for (var i = 0, len = children.length; i < len; i++) {
        if (children[i].isSameNode(nodes)) {
            found = true;
        }
        if (found) {
            children[i] = children[i+1];
        }
    }
    children.length = len - 1;
}

function _removeChild(child) {
    return _remove(child, node);
}

domShim.props.Node.removeChild = {
    value: _removeChild
};