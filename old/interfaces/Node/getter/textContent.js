var _replaceData = domShim.common.Node._replaceData,
    recursivelyWalk = domShim.utils.recursivelyWalk;

function _getTextContent() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        var data = "";
        recursivelyWalk(this.childNodes, function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                data += node.data;
            }
        });
        return data;
    }
    return null;
}

function _setTextContent(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        for (var i = 0, len = this.childNodes.length; i < len; i++) {
            this.removeChild(this.childNodes[i]);
        }
        if (value.length > 0) {
            var txt = document.createTextNode(value);
            this.appendChild(txt);
        }
    }
}

domShim.getters.Node.textContent = {
    get: _getTextContent,
    set: _setTextContent
};