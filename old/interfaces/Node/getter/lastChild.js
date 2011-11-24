function _getLastChild() {
    var children = this.childNodes,
        lastChild = children && children[children.length -1];

    return lastChild || null;
}

domShim.getters.Node.lastChild = {
    get: _getLastChild
};