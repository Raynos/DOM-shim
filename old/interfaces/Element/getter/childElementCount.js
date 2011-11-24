function _getChildElementCount() {
    return this.children.length;
}

domShim.getters.Element.childElementCount = {
    get: _getChildElementCount
}