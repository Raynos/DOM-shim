var _replaceData = domShim.common.Node._replaceData;

function _getNodeValue() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    }
    return null;
}

function _setNodeValue(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    }
}

domShim.getters.Node.nodeValue = {
    get: _getNodeValue,
    set: _setNodeValue
};