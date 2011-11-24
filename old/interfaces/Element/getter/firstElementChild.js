function _getFirstElementChild() {
    var nodes = this.childNodes;
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

domShim.getters.Element.firstElementChild = {
    get: _getFirstElementChild
};