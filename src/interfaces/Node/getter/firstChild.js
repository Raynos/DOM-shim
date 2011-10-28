function _getFirstChild() {
    var children = this.childNodes,
        firstChild = children && children[0];

    return firstChild || null;
}

domShim.getters.Node.firstChild = {
    get: _getFirstChild
};