function _isDefaultNamespace(namespace) {
    if (namespace === "") {
        namespace = null;
    }
    var defaultNamespace = this.lookupNamespaceURI(null);
    return defaultNamespace === namespace;
}

domShim.props.Node.isDefaultNamespace = {
    value: _isDefaultNamespace
};