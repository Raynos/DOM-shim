domShim.getters.Node = {};
domShim.common.Node._replaceData = function _replaceData(node, offset, count, data) {
    var length = node.length;
    var oldData = node.data;
    if (offset > length) {
        throwDOMException(DOMException.INDEX_SIZE_ERR);
    }
    if (offset + count > length) {
        count = length - offset;
    }
    var before = oldData.substring(offset);
    before += data;
    var after = oldData.substring(offset + count);
    before += after;
    node.data = before;
    // TODO: Fix ranges offset pointers
};