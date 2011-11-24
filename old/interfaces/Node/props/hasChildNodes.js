function _hasChildNodes() {
    if (this.firstChild || this.lastChild) {
        return true;
    }
    var children = this.childNodes;
    if (children && children.length > 0) {
        return true;
    }
    return false;
}

domShim.props.Node.hasChildNodes = {
    value: _hasChildNodes
};