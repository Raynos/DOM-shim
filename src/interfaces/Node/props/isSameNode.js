function _isSameNode(node) {
    return this === node;
}

domShim.props.Node.isSameNode = {
    value: _isSameNode
};