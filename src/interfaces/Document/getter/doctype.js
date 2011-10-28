function _getDocType() {
    // TODO: remove assumption that DOCTYPE is the first node
    return this.childNodes[0];
}

domShim.getters.Document.doctype = {
    get: _getDocType
};