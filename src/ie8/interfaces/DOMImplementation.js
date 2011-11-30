module.exports = {
    createDocumentType: {
	    value: createDocumentType
	}
};

function createDocumentType(qualifiedName, publicId, systemId) {
    var o = {};
    o.name = qualifiedName;
    o.publicId = publicId;
    o.systemId = systemId;
    o.ownerDocument = document;
    o.nodeType = Node.DOCUMENT_TYPE_NODE;
    o.nodeName = qualifiedName;
    return o;
}