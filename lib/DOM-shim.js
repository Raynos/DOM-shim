;(function (window, document, undefined) { 
///
///
/// Set variables
///
///

var 
    CharacterData = window.CharacterData,
    Comment = window.Comment,
    CustomEvent = window.CustomEvent,
    Document = window.Document,
    DocumentFragment = window.DocumentFragment,
    DocumentType = window.DocumentType,
    DOMException = window.DOMException,
    DOMImplementation = window.DOMImplementation,
    Element = window.Element,
    Event = window.Event,
    EventTarget = window.EventTarget,
    Node = window.Node,
    ProcessingInstruction = window.ProcessingInstruction,
    Text = window.Text,
    Window = window.Window,
    // prototypes
    CharacterDataProto = CharacterData && CharacterData.prototype,
    CommentProto = (Comment && Comment.prototype),
    CustomEventProto = (CustomEvent && CustomEvent.prototype),
    DocumentProto = (Document && Document.prototype),
    DocumentFragmentProto = 
        (DocumentFragment && DocumentFragment.prototype),
    DocumentTypeProto = DocumentType && DocumentType.prototype,
    DOMExceptionProto = (DOMException && DOMException.prototype),
    DOMImplementationProto = 
        (DOMImplementation && DOMImplementation.prototype),
    ElementProto = (Element && Element.prototype),
    EventProto = (Event && Event.prototype),
    EventTargetProto = (EventTarget && EventTarget.prototype),
    NodeProto = (Node && Node.prototype),
    ProcessingInstructionProto = 
        (ProcessingInstruction && ProcessingInstruction.prototype),
    TextProto = (Text && Text.prototype),
    WindowProto = (Window && Window.prototype)

/// Punch IE8 into submission
CharacterData || (CharacterData = function () {});
Comment || (Comment = function () {});
CustomEvent || (CustomEvent = function (type, init) { return _CustomEvent(type, init); });
Document || (Document = function () {});
DocumentFragment || (DocumentFragment = function () {});
DocumentType || (DocumentType = function () {});
DOMException || (DOMException = function () {});
DOMImplementation || (DOMImplementation = function () {});
Event || (Event = function (type, init) { return _Event(type, init); });
EventTarget || (EventTarget = function () {});
Node || (Node = function () {});
ProcessingInstruction || (ProcessingInstruction = function () {});
Text || (Text = function () {});
Window || (Window = function () {});

// We need Element.prototype or we have no chance
// Fix eventtarget first
NodeProto || (NodeProto = Element.prototype);

CharacterDataProto || 
    (CharacterDataProto = Object.create(NodeProto));
CommentProto || (CommentProto = Object.create(CharacterDataProto));
DocumentProto || (DocumentProto = HTMLDocument.prototype);
DocumentFragmentProto || 
    (DocumentFragmentProto = Object.create(NodeProto));
DocumentTypeProto ||
    (DocumentTypeProto = Object.create(NodeProto));
DOMExceptionProto || 
    (DOMExceptionProto = {});
DOMImplementationProto || 
    (DOMImplementationProto = {});
EventProto || (EventProto = {});
EventTargetProto || (EventTargetProto = NodeProto);
// CustomEvent needs Event
CustomEventProto || (CustomEventProto = Object.create(EventProto));
ProcessingInstructionProto ||
    (ProcessingInstructionProto = Object.create(CharacterDataProto));
TextProto || (TextProto = Object.create(CharacterDataProto));
WindowProto || (WindowProto = {});

// link prototypes back up
if (CharacterData.prototype !== CharacterDataProto) {
    CharacterData.prototype = CharacterDataProto;
}
// Set the proper .constructor property
if (CharacterDataProto.constructor !== CharacterData) {
    CharacterDataProto.constructor = CharacterData;
}
if (Comment.prototype !== CommentProto) {
    Comment.prototype = CommentProto;   
}
if (CommentProto.constructor !== Comment) {
    CommentProto.constructor = Comment;
}
if (CustomEvent.prototype !== CustomEventProto) {
    CustomEvent.prototype = CustomEventProto;
}
if (CustomEventProto.constructor !== CustomEvent) {
    CustomEventProto.constructor = CustomEvent;
}
if (Document.prototype !== DocumentProto) {
    Document.prototype = DocumentProto;
}
if (DocumentProto.constructor !== Document) {
    DocumentProto.constructor = Document;
}
if (DocumentFragment.prototype !== DocumentFragmentProto) {
    DocumentFragment.prototype = DocumentFragmentProto; 
}
if (DocumentFragmentProto.constructor !== DocumentFragment) {
    DocumentFragmentProto.constructor = DocumentFragment;
}
if (DocumentType.prototype !== DocumentTypeProto) {
    DocumentType.prototype = DocumentTypeProto;
}
if (DocumentTypeProto.constructor !== DocumentType) {
    DocumentTypeProto.constructor = DocumentType;
}
if (DOMException.prototype !== DOMExceptionProto) {
    DOMException.prototype = DOMExceptionProto;
}
if (DOMException.constructor !== DOMException) {
    DOMException.constructor = DOMException;
}
if (DOMImplementation.prototype !== DOMImplementationProto) {
    DOMImplementation.prototype = DOMImplementationProto;
}
if (DOMImplementationProto.constructor !== DOMImplementation) {
    DOMImplementationProto.constructor = DOMImplementation;
}
if (Event.prototype !== EventProto) {
    Event.prototype = EventProto;
}
if (EventProto.constructor !== Event) {
    EventProto.constructor = Event;
}
if (EventTarget.prototype !== EventTargetProto) {
    EventTarget.prototype = EventTargetProto;
}
if (EventTargetProto.constructor !== EventTarget) {
    EventTargetProto.constructor = EventTarget;
}
if (Node.prototype !== NodeProto) {
    Node.prototype = NodeProto;
}
if (NodeProto.constructor !== Node) {
    NodeProto.constructor = Node;
}
if (ProcessingInstruction.prototype !== ProcessingInstructionProto) {
    ProcessingInstruction.prototype = ProcessingInstructionProto;
}
if (ProcessingInstructionProto.constructor !== ProcessingInstruction) {
    ProcessingInstructionProto.constructor = ProcessingInstruction;
}
if (Text.prototype !== TextProto) {
    Text.prototype = TextProto;
}
if (TextProto.constructor !== Text) {
    TextProto.constructor = Text;
}
if (Window.prototype !== WindowProto) {
    Window.prototype = WindowProto;
}
if (WindowProto.constructor !== Window) {
    WindowProto.constructor = Window;
}

//write objects back to global scope
window.CharacterData = CharacterData;
window.Comment = Comment;
window.Document = Document;
window.DocumentFragment = DocumentFragment;
window.DocumentType = DocumentType;
window.DOMImplementation = DOMImplementation;
window.DOMException = DOMException;
window.Event = Event;
window.EventTarget = EventTarget;
window.Node = Node;
window.ProcessingInstruction = ProcessingInstruction;
window.Text = Text;
window.Window = Window;

var HTMLNames = ["HTMLDocument", "HTMLLinkElement", "HTMLElement", "HTMLHtmlElement", "HTMLDivElement", "HTMLAnchorElement", 
"HTMLSelectElement", "HTMLOptionElement", "HTMLInputElement", "HTMLHeadElement", "HTMLSpanElement", "XULElement",
"HTMLBodyElement", "HTMLTableElement", "HTMLTableCellElement", "HTMLTextAreaElement", "HTMLScriptElement", 
"HTMLAudioElement", "HTMLMediaElement", "HTMLParagraphElement", "HTMLButtonElement", "HTMLLIElement", "HTMLUListElement", 
"HTMLFormElement", "HTMLHeadingElement", "HTMLImageElement", "HTMLStyleElement", "HTMLTableRowElement", 
"HTMLTableSectionElement", "HTMLBRElement"];

// extra locals
var HTMLEls = {};
HTMLNames.forEach(function (name) {
    HTMLEls[name] = window[name];
});
///
///
/// Helper functions
///
///

function recursivelyWalk(nodes, cb) {
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var ret = cb(node);
        if (ret) {
            return ret;
        }
        if (node.childNodes && node.childNodes.length > 0) {
            var ret = recursivelyWalk(node.childNodes, cb);
            if (ret) {
                return ret;
            }
        }
    }
}

function throwDOMException(code) {
    var ex = Object.create(DOMException.prototype);
    ex.code = code;
    throw ex;
}

var propsBlackListForIE = {
    nodeType: true,
    nodeName: true
};

function addGetterSetterToProtoForEach(props, proto, name) {
    var hasProperty = false,
        value = props[name];
    try {
        hasProperty = proto[name];
    } catch (e) {
        // IE9 throws errors
        hasProperty = proto.hasOwnProperty(name);
    }
    if (!hasProperty || value.force) {
        var obj = {
            enumerable: true,
            configurable: true
        };
        if (value.get) {
            obj.get = value.get;
        }
        if (value.set) {
            obj.set = value.set;
        }
        try {
            Object.defineProperty(proto, name, obj);    
        } catch (e) {
            // IE8 FFFFFFFFFFFFFFFFFFFFF
            delete obj.enumerable;
        }
        try {
            Object.defineProperty(proto, name, obj);
        } catch (e) {
            // IE8 this must be non-host object.
        }
        
    }
}

function addGetterSetterToProto(props, proto) {
    Object.keys(props).forEach(function _each(name) {
        // fix for IE8
        if (proto === NodeProto && !propsBlackListForIE[name]) {
            // Fix docfrags
            if (HTMLEls.HTMLDocument && !HTMLEls.HTMLDocument.prototype.constructor) {
                addGetterSetterToProtoForEach(
                    props, HTMLEls.HTMLDocument.prototype, name);
            }
            // fix text
            addGetterSetterToProtoForEach(props, Text.prototype, name);
        }
        addGetterSetterToProtoForEach(props, proto, name);
    });
}

function addPropsToProtoForEach(props, proto, name) {
    var value = props[name];
    var has = false;
    try {
        has = proto[name];
    } catch (e) {
        // IE9 throws errors
        has = proto.hasOwnProperty(name);
    }
    if (!has || value.force) {
        var obj = {
            configurable: true,
            enumerable: true,
            writable: true
        };

        if (value.hasOwnProperty("value")) {
            obj.value = value.value;
        }
        if (value.hasOwnProperty("writable")) {
            obj.writable = value.writable;
        }
        try {
            Object.defineProperty(proto, name, obj);    
        } catch (e) {
            // IE8 FFFFFFFFFFFFFFFFFFFFFFFFFFFF
            delete obj.enumerable;
        }
        try {
            Object.defineProperty(proto, name, obj);
        } catch (e) {
            // IE8 this must be non-host object.
        }
    }
}

function addPropsToProto(props, proto) {
    Object.keys(props).forEach(function _each(name) {
        // fix for IE8
        if (proto === NodeProto && !propsBlackListForIE[name]) {
            // Fix docfrags
            if (HTMLEls.HTMLDocument && !HTMLEls.HTMLDocument.prototype.constructor) {
                addPropsToProtoForEach(
                    props, HTMLEls.HTMLDocument.prototype, name);
            }
            // fix text
            addPropsToProtoForEach(props, Text.prototype, name);
        }
        addPropsToProtoForEach(props, proto, name);
    });
}

function addConstsToObject(consts, object) {
    Object.keys(consts).forEach(function _each(name) {
        var value = consts[name];
        if (!object[name]) {
            try {
                Object.defineProperty(object, name, {
                    value: value,
                    configurable: true,
                    enumerable: true
                }); 
            } catch (e) {
                // IE8 fails because Node is Object
                object[name] = value;
            }
        }
    });
}
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
///
///
/// Node constants
///
///

var nodeConsts = {
    "ELEMENT_NODE": 1,
    "ATTRIBUTE_NODE": 2,
    "TEXT_NODE": 3,
    "CDATA_SECTION_NODE": 4,
    "ENTITY_REFERENCE_NODE": 5,
    "ENTITY_NODE": 6,
    "PROCESSING_INSTRUCTION_NODE": 7,
    "COMMENT_NODE": 8,
    "DOCUMENT_NODE": 9,
    "DOCUMENT_TYPE_NODE": 10,
    "DOCUMENT_FRAGMENT_NODE": 11,
    "NOTATION_NODE": 12,
    "DOCUMENT_POSITION_DISCONNECTED": 0x01,
    "DOCUMENT_POSITION_PRECEDING": 0x02,
    "DOCUMENT_POSITION_FOLLOWING": 0x04,
    "DOCUMENT_POSITION_CONTAINS": 0x08,
    "DOCUMENT_POSITION_CONTAINED_BY": 0x10,
    "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC": 0x20
};

addConstsToObject(nodeConsts, Node);

///
///
/// Node.prototype properties
///
///

function _hasChildNodes() {
    if (this.firstChild || this.lastChild) {
        return true;
    }
    var children = this.childNodes;
    if (children && children.length > 0) {
        return true;
    }
    return false;
}

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
    var ret = recursivelyWalk(
        children,
        _testNodeForComparePosition.bind(null, other)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINED_BY +
            Node.DOCUMENT_POSITION_FOLLOWING;
    }

    var children = other.childNodes;
    var ret = recursivelyWalk(
        children, 
        _testNodeForComparePosition.bind(null, reference)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINS +
            Node.DOCUMENT_POSITION_PRECEDING;
    }

    var ret = recursivelyWalk(
        [referenceTop],
        _identifyWhichIsFirst
    );
    if (ret === "other") {
        return Node.DOCUMENT_POSITION_PRECEDING;
    } else {
        return Node.DOCUMENT_POSITION_FOLLOWING;
    }
}

function _contains(other) {
    var comparison = this.compareDocumentPosition(other);
    if (comparison === 0 || 
        comparison & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
        return true;
    }
    return false;
}

function _preInsertDocumentFragment (node, parent, child) {
    var hasEle = false;
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
        var el = node.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        } else if (el.nodeType === Node.ELEMENT_NODE) {
            if (hasEle) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            } else {
                hasEle = true;
            }
        }
    }
}

function _preInsertElement(node, parent, child) {
    var children = parent.childNodes,
        pos = 0;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.ELEMENT_NODE && child === null) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            if (i > pos) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _preInsertDocumentType(node, parent, child) {
    var children = parent.childNodes,
        pos = 0,
        firstEl = -1;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.ELEMENT_NODE) {
            firstEl === -1 && (firstEl = i);
        }
    }
    if (firstEl < pos || child === null && firstEl > -1) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
}

function _preInsert(node, parent, child) {
    if (child && !child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (parentOfParent.isSameNode(node)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parent.parentNode;
    } while (parentOfParent != null)

    var condition = parent.nodeType === Node.DOCUMENT_NODE || 
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE;
    if (!condition) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        if (node.nodeType === Node.TEXT_NODE || 
            node.nodeType === Node.DOCUMENT_NODE
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            _preInsertDocumentFragment(node, parent, child);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            _preInsertElement(node, parent, child);
            
        }
        if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
            _preInsertDocumentType(node, parent, child);
        }
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) &&
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    parent.ownerDocument.adoptNode(node);
    _insert(node, parent, child);
    return child;
}

function _insert(node, parent, child) {
    var nodes = [node];
    if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        nodes = node.childNodes;
    }
    var count = nodes.length;
    var children = parent.childNodes;
    var len = children.length;
    // TODO: handle ranges
    
    if (child === null) {
        for (var j = 0; i < count; j++) {
            children[len + j] = nodes[j];
        }
    } else {
        for (var i = len - 1; i >= 0; i--) {
            var el = children[i];
            children[i + count] = el;
            if (el === child) {
                for (var j = 0; i < count; j++) {
                    children[i + j] = nodes[j];
                }
                break;
            }
        }   
    }
    
    children.length = len + count;
}

function _replaceDocument(child, node, parent) {
    if (node.nodeType === Node.TEXT_NODE ||
        node.nodeType === Node.DOCUMENT_NODE
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        if (node.childNodes.length > 1 ||
            (node.firstChild && 
            node.firstChild.nodeType === Node.TEXT_NODE) 
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = children.length - 1; i >= 0; i--) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === DOCUMENT_TYPE_NODE && 
                !el.isSameNode(child)) &&
                (el.nodeType === ELEMENT_NODE && i < pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _replace(child, node, parent) {
    if (!child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (node.isSameNode(parentOfParent)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parentOfParent.parentNode;
    } while (parentOfParent !== null)

    if (!(parent.nodeType === Node.DOCUMENT_NODE ||
        parent.nodeType === Node.ELEMENT_NODE ||
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        _replaceDocument(child, node, parent);
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) && 
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    parent.ownerDocument.adoptNode(node);
    var ref = child.nextSibling;
    _remove(child, parent);
    _insertBefore(node, parent, ref);
    return child;
}

function _preremove(node, parent) {
    if (!node.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    _remove(node, parent);
    return node;
}

function _remove(node, parent) {
    var found = false,
        children = parent.childNodes;

    // TODO: handle ranges

    for (var i = 0, len = children.length; i < len; i++) {
        if (children[i].isSameNode(nodes)) {
            found = true;
        }
        if (found) {
            children[i] = children[i+1];
        }
    }
    children.length = len - 1;
}

function _clone(node, document, deep) {
    document = document || node.ownerDocument;
    var copy;
    if (node.nodeType === Node.ELEMENT_NODE) {
        copy = document.createElementNS(node.namespaceURI, node.prefix + ":" + node.nodeName);
        for (var i = 0, len = node.attributes.length; i < len; i++) {
            var attr = node.attributes[i];
            copy.setAttribute(attr.name, attr.value);
        }
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
        copy = document.implementation.createDocument("", "", null);
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        copy = document.createDocumentFragment();
    } else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        copy = document.implementation.createDocumentType(node.name, node.publicId, node.systemId);
    } else if (node.nodeType === Node.COMMENT_NODE) {
        copy = document.createComment(node.data);
    } else if (node.nodeType === Node.TEXT_NODE) {
        copy = document.createTextNode(node.data);
    } else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        copy = document.createProcessingInstruction(node.target, node.data);
    }
    // TODO: other cloning steps from other specifications
    if (deep) {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; i++) {
            copy.appendChild(children[i].cloneNode(node, document, deep));
        }
    }
    return copy;
}

function _insertBefore(node, child) {
    return _preInsert(node, this, child);
}

function _appendChild(node) {
    return this.insertBefore(node, null);
}

function _replaceChild(node, child) {
    return _replace(child, node, this);
}

function _removeChild(child) {
    return _remove(child, node);
}

function _cloneNode(flag) {
    if (flag === undefined) {
        flag = true;
    }
    return _clone(this, undefined, flag);
}

function _isSameNode(node) {
    return this === node;
}

function _isEqualNode(node) {
    if (node === null) {
        return false;
    }
    if (node.nodeType !== this.nodeType) {
        return false;
    }
    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        if (this.name !== node.name ||
            this.publicId !== node.publicId ||
            this.systemId !== node.systemId 
        ) {
            return false;
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (this.namespaceURI !== node.namespaceURI ||
            this.prefix !== node.prefix ||
            this.localName !== node.localName
        ) {
            return false;
        }
        for (var i = 0, len = this.attributes.length; i < len; i++) {
            var attr = this.attributes[length];
            var nodeAttr = node.getAttributeNS(attr.namespaceURI, attr.localName);
            if (nodeAttr === null || nodeAttr.value !== attr.value) {
                return false;
            }
        }
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        if (this.target !== node.target || this.data !== node.data) {
            return false;       
        }   
    }
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
        if (this.data !== node.data) {
            return false;
        }
    }
    if (node.childNodes.length !== this.childNodes.length) {
        return false;
    }
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
        var isEqual = node.childNodes[i].isEqualNode(this.childNodes[i]);
        if (isEqual === false) {
            return false;
        }
    }
    return true;
}

function _locateNamespacePrefix(el, namespace) {
    if (el.namespaceURI === namespace) {
        if (el.prefix == null) {
            return null;
        }
        return el.prefix;
    }
    var attrs = el.attributes;
    for (var i = 0, len = attrs.length; i < len; i++) {
        var attr = attrs[i];
        if (attr.prefix === "xmlns" && attr.value === namespace) {
            return attr.localname;
        }
    }
    var parent = node.parentElement
    if (parent !== null) {
        return _locateNamespacePrefix(parent, namespace);
    }
    return null;
}

function _locateNamespace(node, prefix) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.namespaceURI !== null && node.prefix === prefix) {
            return node.namespaceURI;
        }
        var attrs = node.attributes;
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if ((attr.prefix === "xmlns" && attr.localname === prefix) ||
                (attr.prefix === null && attr.localname === "xmlns")
            ) {
                return attr.value || null;
            }
        }
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix)
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
        var docElem = node.documentElement;
        if (docElem) {
            return _locateNamespace(docElem, prefix);
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE
    ) {
        return null;
    } else {
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix);
        }
        return null;
    }
}

function _lookupPrefix(namespace) {
    if (namespace === null || namespace === "") {
        return null;
    }
    if (this.nodeType === Node.ELEMENT_NODE) {
        return _locateNamespacePrefix(this, namespace);
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return _locateNamespacePrefix(this.documentElement, namespace);
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE ||
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        return null
    } else {
        var parent = this.parentElement;
        if (parent !== null) {
            return _locateNamespacePrefix(parent, namespace);
        }
        return null;
    }
}

function _lookupNamespaceURI(prefix) {
    return _locateNamespace(this, prefix);
}

function _isDefaultNamespace(namespace) {
    if (namespace === "") {
        namespace = null;
    }
    var defaultNamespace = _locateNamespace(this, null);
    return defaultNamespace === namespace;
}

var nodeProps = {
    "ownerDocument": {
        value: document,
        writable: false
    },
    "hasChildNodes": {
        value: _hasChildNodes
    },
    "compareDocumentPosition": {
        value: _compareDocumentPosition
    },
    "contains": {
        value: _contains
    },
    "isSameNode": {
        value: _isSameNode
    },
    "insertBefore": {
        value: _insertBefore
    },
    "appendChild": {
        value: _appendChild
    },
    "replaceChild": {
        value: _replaceChild
    },
    "removeChild": {
        value: _removeChild
    },
    "cloneNode": {
        value: _cloneNode
    },
    "isEqualNode": {
        value: _isEqualNode
    },
    "lookupPrefix": {
        value: _lookupPrefix
    },
    "lookupNamespaceURI": {
        value: _locateNamespace
    },
    "isDefaultNamespace": {
        value: _isDefaultNamespace
    }
};

addPropsToProto(nodeProps, NodeProto);

///
///
/// Node.prototyper getter/setters
///
///

function _getNodeType() {
    if (this instanceof Element) {
        return Node.ELEMENT_NODE;
    } else if (this instanceof Text) {
        return Node.TEXT_NODE;
    } else if (this instanceof ProcessingInstruction) {
        return Node.PROCESSING_INSTRUCTION_NODE;
    } else if (this instanceof Comment) {
        return Node.COMMENT_NODE;
    } else if (this instanceof Document) {
        return Node.DOCUMENT_NODE;
    } else if (this instanceof DocumentType) {
        return Node.DOCUMENT_TYPE_NODE;
    } else if (this instanceof DocumentFragment) {
        return Node.DOCUMENT_FRAGMENT_NODE;
    } 
}

function _getNodeName() {
    if (this.nodeType === Node.ELEMENT_NODE) {
        return this.tagName;
    } else if (this.nodeType === Node.TEXT_NODE) {
        return "#text";
    } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        return this.target
    } else if (this.nodeType === Node.COMMENT_NODE) {
        return "#comment";
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return "#document";
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE) {
        return this.name;
    } else if (this.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return "#document-fragment";
    }
}

function _getParentElement() {
    var parent = this.parentNode;
    if (parent == null) {
        return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent;
    }
    return null;
}

function _getFirstChild() {
    var children = this.childNodes,
        firstChild = children && children[0];

    return firstChild || null;
}

function _getLastChild() {
    var children = this.childNodes,
        lastChild = children && children[children.length -1];

    return lastChild || null;
}

function _getPreviousSibling() {
    var parent = this.parentNode,
        siblings = parent.childNodes;

    for (var i = 0, len = siblings.length; i < len; i++) {
        var node = siblings[i];
        if (node === this) {
            return siblings[i-1] || null;
        }
    }
}

function _getNextSibling() {
    var parent = this.parentNode,
        siblings = parent.childNodes;

    for (var i = 0, len = siblings.length; i < len; i++) {
        var node = siblings[i];
        if (node === this) {
            return siblings[i+1] || null;
        }
    }
}

function _replaceData(node, offset, count, data) {
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
}

function _getNodeValue() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    }
    return null;
}

function _setNodeValue(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    }
}

function _getTextContent() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        var data = "";
        recursivelyWalk(this.childNodes, function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                data += node.data;
            }
        });
        return data;
    }
    return null;
}

function _setTextContent(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        for (var i = 0, len = this.childNodes.length; i < len; i++) {
            this.removeChild(this.childNodes[i]);
        }
        if (value.length > 0) {
            var txt = document.createTextNode(value);
            this.appendChild(txt);
        }
    }
}

var nodeGetterSetters = {
    "nodeType": {
        get: _getNodeType
    },
    "nodeName": {
        get: _getNodeName
    },
    "parentElement": {
        get: _getParentElement
    },
    "firstChild": {
        get: _getFirstChild
    },
    "lastChild": {
        get: _getLastChild
    },
    "previousSibling": {
        get: _getPreviousSibling
    },
    "nextSibling": {
        get: _getNextSibling
    },
    "nodeValue": {
        get: _getNodeValue,
        set: _setNodeValue
    },
    "textContent": {
        get: _getTextContent,
        set: _setTextContent
    }
}

addGetterSetterToProto(nodeGetterSetters, NodeProto);

// TODO: Implement NodeProto.baseUri

// BUG: .parentNode cannot be shimmed

// BUG: .childNodes cannot be shimmed
//
//
// DOMException constants
//
//

var domExceptionConsts = {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2, // historical
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6, // historical
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10, // historical
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16, // historical
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25
};

var domExceptionNames = [
    undefined,
    "INDEX_SIZE_ERR",
    "DOMSTRING_SIZE_ERR",
    "HIERARCHY_REQUEST_ERR",
    "WRONG_DOCUMENT_ERR",
    "INVALID_CHARACTER_ERR",
    "NO_DATA_ALLOWED_ERR",
    "NO_MODIFICATION_ALLOWED_ERR",
    "NOT_FOUND_ERR",
    "NOT_SUPPORTED_ERR",
    "INUSE_ATTRIBUTE_ERR",
    "INVALID_STATE_ERR",
    "SYNTAX_ERR",
    "INVALID_MODIFICATION_ERR",
    "NAMESPACE_ERR",
    "INVALID_ACCESS_ERR",
    "VALIDATION_ERR",
    "TYPE_MISMATCH_ERR",
    "SECURITY_ERR",
    "NETWORK_ERR",
    "ABORT_ERR",
    "URL_MISMATCH_ERR",
    "QUOTA_EXCEEDED_ERR",
    "TIMEOUT_ERR",
    "INVALID_NODE_TYPE_ERR",
    "DATA_CLONE_ERR",
];
    

addConstsToObject(domExceptionConsts, DOMException);

// BUG: cannot shim code

function _getDOMExceptionName() {
    return domExceptionNames[this.code];
}

var domExceptionGetterSetters = {
    "name": {
        get: _getDOMExceptionName
    }
}

addGetterSetterToProto(domExceptionGetterSetters, DOMExceptionProto);
///
///
/// Event constants
///
///

var eventConsts = {
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3
};

addConstsToObject(eventConsts, Event);

///
///
/// Events.prototype properties
///
///

// BUG: Cannot shim type
// BUG: Cannot shim target
// BUG: Cannot shim currentTarget

// BUG: Cannot shim eventPhase
// BUG: Cannot shim stopPropagation
// BUG: Cannot shim stopImmediatePropagation
// BUG: Cannot shim bubbles / cancelable attributes
// BUG: Cannot shim preventDefault
// BUG: Cannot shim defaultPrevented
// BUG: Cannot shim isTrusted
// BUG: Cannot shim timeStamp

function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
}

var eventProps = {
    "initEvent": {
        value: _initEvent
    }
}

addPropsToProto(eventProps, EventProto);

///
///
/// Events.prototype getter/setters
///
///

// TODO: Shim CustomEvent

// TODO: Shim EventTarget

var eventListeners = [];

function _addEventListener(type, listener, capture) {
    if (this.attachEvent) {
        var cb = function () {
            listener.call(this, window.event);
        };
        eventListeners.push([type, listener, cb]);
        this.attachEvent("on" + type, cb);
    }
}

function _removeEventListener(type, listener, capture) {
    if (this.detachEvent) {
        for (var i = 0, len = eventListeners.length; i < len; i++) {
            var triplet = eventListeners[i];
            if (triplet[1] === listener && triplet[0] === type) {
                this.detachEvent("on" + type, triplet[2]);
                eventListeners.splice(i, 1);
                break;
            }
        }
    }
}

function _dispatchEvent(event) {
    if (this.fireEvent) {
        return this.fireEvent("on" + event.type);
    }
}

var eventTargetProps = {
    addEventListener: {
        value: _addEventListener
    },
    removeEventListener: {
        value: _removeEventListener
    },
    dispatchEvent: {
        value: _dispatchEvent
    }
};

addPropsToProto(eventTargetProps, EventTargetProto);
(function () {
    var txt = document.createTextNode("temp"),
        el = document.createElement("p");

    el.appendChild(txt);

    try {
        el.contains(txt);
    } catch (e) {
        // The contains method fails on text nodes in IE8
        // swap the contains method for our contains method
        addPropsToProtoForEach(
            {
                "contains": {
                    value: _contains,
                    force: true 
                }
            },
            NodeProto,
            "contains"
        );
    }
})();

(function () {
    function _cloneNodeOnProto(proto) {
        var cloneNodePD = Object.getOwnPropertyDescriptor(proto, "cloneNode");
        if (cloneNodePD === undefined) {
            cloneNodePD = {
                "enumerable": true,
                "writable": true,
                "configurable": true
            };
        }
        var oldCloneNode = cloneNodePD.value;
        cloneNodePD.value = function _cloneNode(bool) {
            if (bool === undefined) {
                bool = true;
            }
            return oldCloneNode.call(this, bool);
        };
        var flag = Object.defineProperty(proto, "cloneNode", cloneNodePD);
    }
    var el = document.createElement("p");

    try {
        el.cloneNode();
    } catch (e) {
        if (e.message === "Not enough arguments") {
            // Firefox things the argument is not optional
            [
                NodeProto,
                CommentProto,
                ElementProto,
                ProcessingInstructionProto,
                DocumentProto,
                DocumentTypeProto,
                DocumentFragmentProto
            ].forEach(_cloneNodeOnProto);

            Object.keys(HTMLEls).forEach(function (name) {
                _cloneNodeOnProto(HTMLEls[name].prototype);
            });
        }
    }
})();

(function () {
    var ex = Object.create(DOMExceptionProto);

    try {
        var temp = ex.code;
    } catch (e) {
        // IE9 cannot get code
        delete DOMExceptionProto.code;
    }
})();
})(window, document);