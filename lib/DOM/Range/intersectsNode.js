window.Range.prototype.intersectsNode = intersectsNode

function intersectsNode(node) {
    var nodeRange = node.ownerDocument.createRange();
    try {
        nodeRange.selectNode(node);
    } catch (err) {
        nodeRange.selectNodeContents(node);
    }

    return this.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
        this.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
}