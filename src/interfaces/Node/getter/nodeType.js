function _getNodeType() {
    if (this instanceof Element) {
        return Node.ELEMENT_NODE;
    } else if (this instanceof Text) {
        return Node.TEXT_NODE;
    } else if (this instanceof ProcessingInstruction) {
        return Node.PROCESSING_INSTRUCTION_NODE;
    } else if (this instanceof Comment) {
        return Node.COMMENT_NODE;
    } else if (this instanceof Document) {
        return Node.DOCUMENT_NODE;
    } else if (this instanceof DocumentType) {
        return Node.DOCUMENT_TYPE_NODE;
    } else if (this instanceof DocumentFragment) {
        return Node.DOCUMENT_FRAGMENT_NODE;
    } 
}

domShim.getters.Node.nodeType = {
    "nodeType": {
        get: _getNodeType
    }
};