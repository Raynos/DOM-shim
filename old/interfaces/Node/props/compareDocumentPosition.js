function _testNodeForComparePosition(node, other) {
    if (node.isSameNode(other)) {
        return true;
    }
}

function _compareDocumentPosition(other) {
    function _identifyWhichIsFirst(node) {
        if (node.isSameNode(other)) {
            return "other";
        } else if (node.isSameNode(reference)) {
            return "reference";
        }
    }

    var reference = this,
        referenceTop = this,
        otherTop = other;

    if (this.isSameNode(other)) {
        return 0;
    }
    while (referenceTop.parentNode) {
        referenceTop = referenceTop.parentNode;
    }
    while (otherTop.parentNode) {
        otherTop = otherTop.parentNode;
    }

    if (!referenceTop.isSameNode(otherTop)) {
        return Node.DOCUMENT_POSITION_DISCONNECTED;
    }

    var children = reference.childNodes;
    var ret = domShim.utils.recursivelyWalk(
        children,
        _testNodeForComparePosition.bind(null, other)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINED_BY +
            Node.DOCUMENT_POSITION_FOLLOWING;
    }

    var children = other.childNodes;
    var ret = domShim.utils.recursivelyWalk(
        children, 
        _testNodeForComparePosition.bind(null, reference)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINS +
            Node.DOCUMENT_POSITION_PRECEDING;
    }

    var ret = domShim.utils.recursivelyWalk(
        [referenceTop],
        _identifyWhichIsFirst
    );
    if (ret === "other") {
        return Node.DOCUMENT_POSITION_PRECEDING;
    } else {
        return Node.DOCUMENT_POSITION_FOLLOWING;
    }
}


domShim.props.Node.compareDocumentPosition = {
    value: _compareDocumentPosition
};