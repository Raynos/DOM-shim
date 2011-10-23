//
//
// Document.prototype values
//
//

function _createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
    return Object.create(EventProto);
}

var documentProps = {
    "createEvent": {
        value: _createEvent
    }
};

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

addPropsToProto(DOMImplementationProps, DOMImplementationProto);