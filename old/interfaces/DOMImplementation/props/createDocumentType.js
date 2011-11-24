function _createDocumentType(qualifiedName, publicId, systemId) {
    var o = Object.create(DocumentType.prototype);
    o.name = qualifiedName;
    o.publicId = publicId;
    o.systemId = systemId;
    o.ownerDocument = document;
    return o;
}

domShim.props.DOMImplementation.createDocumentType = {
    value: _createDocumentType
};