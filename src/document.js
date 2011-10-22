//
//
// Document.prototype values
//
//

var documentProps = {};

addPropsToProto(documentProps, DocumentProto);

function _createDocumentType(qualifiedName, publicId, systemId) {
	var o = Object.create(DocumentTypeProto);
	o.name = qualifiedName;
	o.publicId = publicId;
	o.systemId = systemId;
	o.ownerDocument = document;
	return o;
}

var DOMImplementationProps = {
	"createDocumentType": {
		value: _createDocumentType
	}
};

addPropsToProto(DOMImplementationProps, DOMImplementationProto)