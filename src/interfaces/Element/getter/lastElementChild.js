function _getLastElementChild() {
    var nodes = this.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

domShim.getters.Element.lastElementChild = {
    get: _getLastElementChild
};