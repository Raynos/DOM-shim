function _appendChild(node) {
    return this.insertBefore(node, null);
}

domShim.props.Node.appendChild = {
    value: _appendChild
};