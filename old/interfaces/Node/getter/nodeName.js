function _getNodeName() {
    if (this.nodeType === Node.ELEMENT_NODE) {
        return this.tagName;
    } else if (this.nodeType === Node.TEXT_NODE) {
        return "#text";
    } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        return this.target
    } else if (this.nodeType === Node.COMMENT_NODE) {
        return "#comment";
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return "#document";
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE) {
        return this.name;
    } else if (this.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return "#document-fragment";
    }
}

domShim.getters.Node.nodeName = {
    get: _getNodeName  
};