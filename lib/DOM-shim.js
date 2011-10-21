;(function (window, document, undefined) {///
///
/// Set variables
///
///

var 
	CharacterData = window.CharacterData,
	Comment = window.Comment,
	Document = window.Document,
	DocumentFragment = window.DocumentFragment,
	DocumentType = window.DocumentType,
	DOMImplementation = window.DOMImplementation,
	Element = window.Element,
	Node = window.Node,
	ProcessingInstruction = window.ProcessingInstruction,
	Text = window.Text,
	// prototypes
	CharacterDataProto = CharacterData && CharacterData.prototype,
	CommentProto = (Comment && Comment.prototype),
	DocumentProto = (Document && Document.prototype),
	DocumentFragmentProto = 
		(DocumentFragment && DocumentFragment.prototype),
	DocumentTypeProto = DocumentType && DocumentType.prototype,
	DOMImplementationProto = 
		(DOMImplementation && DOMImplementation.prototype),
	ElementProto = (Element && Element.prototype),
	NodeProto = (Node && Node.prototype),
	ProcessingInstructionProto = 
		(ProcessingInstruction && ProcessingInstruction.prototype),
	TextProto = (Text && Text.prototype);

/// Punch IE8 into submission
CharacterData || (CharacterData = function () {});
Comment || (Comment = function () {});
Document || (Document = function () {});
DocumentFragment || (DocumentFragment = function () {});
DocumentType || (DocumentType = function () {});
DOMImplementation || (DOMImplementation = function () {});
Node || (Node = function () {});
ProcessingInstruction || (ProcessingInstruction = function () {});
Text || (Text = function () {});

// We need Element.prototype or we have no chance
// Fix node first
NodeProto || (NodeProto = Element.prototype);

CharacterDataProto || 
	(CharacterDataProto = Object.create(NodeProto));
CommentProto || (CommentProto = Object.create(CharacterDataProto));
DocumentProto || (DocumentProto = document);
DocumentFragmentProto || 
	(DocumentFragmentProto = Object.create(NodeProto));
DocumentTypeProto ||
	(DocumentTypeProto = Object.create(NodeProto));
DOMImplementationProto || 
	(DOMImplementationProto = document.implementation);
ProcessingInstructionProto ||
	(ProcessingInstructionProto = Object.create(CharacterDataProto));
TextProto || (TextProto = Object.create(CharacterDataProto));

// link prototypes back up
if (CharacterData.prototype !== CharacterDataProto) {
	CharacterData.prototype = CharacterDataProto;
}
// Set the proper .constructor property
if (CharacterDataProto.constructor === Object) {
	CharacterDataProto.constructor = CharacterData;
}
if (Comment.prototype !== CommentProto) {
	Comment.prototype = CommentProto;	
}
if (CommentProto.constructor === Object) {
	CommentProto.constructor = Comment;
}
if (Document.prototype !== DocumentProto) {
	Document.prototype = DocumentProto;
}
if (DocumentProto.constructor === Object) {
	DocumentProto.constructor = Document;
}
if (DocumentFragment.prototype !== DocumentFragmentProto) {
	DocumentFragment.prototype = DocumentFragmentProto;	
}
if (DocumentFragmentProto.constructor === Object) {
	DocumentFragmentProto.constructor = DocumentFragment;
}
if (DocumentType.prototype !== DocumentTypeProto) {
	DocumentType.prototype = DocumentTypeProto;
}
if (DocumentTypeProto.constructor === Object) {
	DocumentTypeProto.constructor = DocumentType;
}
if (DOMImplementation.prototype !== DOMImplementationProto) {
	DOMImplementation.prototype = DOMImplementationProto;
}
if (DOMImplementationProto.constructor === Object) {
	DOMImplementationProto.constructor = DOMImplementation;
}
if (Node.prototype !== NodeProto) {
	Node.prototype = NodeProto;
}
if (NodeProto.constructor === Object) {
	NodeProto.constructor = Node;
}
if (ProcessingInstruction.prototype !== ProcessingInstructionProto) {
	ProcessingInstruction.prototype = ProcessingInstructionProto;
}
if (ProcessingInstructionProto.constructor === Object) {
	ProcessingInstructionProto.constructor = ProcessingInstruction;
}
if (Text.prototype !== TextProto) {
	Text.prototype = TextProto;
}
if (TextProto.constructor === Object) {
	TextProto.constructor = Text;
}

//write objects back to global scope
window.CharacterData = CharacterData;
window.Comment = Comment;
window.Document = Document;
window.DocumentFragment = DocumentFragment;
window.DocumentType = DocumentType;
window.DOMImplementation = DOMImplementation;
window.Node = Node;
window.ProcessingInstruction = ProcessingInstruction;
window.Text = Text;

// extra locals
var HTMLDocument = window.HTMLDocument;///
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
			Object.defineProperty(proto, name, obj);
		}
		
	}
}

function addGetterSetterToProto(props, proto) {
	Object.keys(props).forEach(function _each(name) {
		// fix for IE8
		if (proto === NodeProto && !propsBlackListForIE[name]) {
			// Fix docfrags
			if (HTMLDocument && !HTMLDocument.prototype.constructor) {
				addGetterSetterToProtoForEach(
					props, HTMLDocument.prototype, name);
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
			Object.defineProperty(proto, name, obj);
		}	
	}
}

function addPropsToProto(props, proto) {
	Object.keys(props).forEach(function _each(name) {
		// fix for IE8
		if (proto === NodeProto && !propsBlackListForIE[name]) {
			// Fix docfrags
			if (HTMLDocument && !HTMLDocument.prototype.constructor) {
				addPropsToProtoForEach(
					props, HTMLDocument.prototype, name);
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
}//
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

addPropsToProto(DOMImplementationProps, DOMImplementationProto)/*
var toArray = function (obj) {
    var arr = [];
    for (var i = 0, len = obj.length; i < len; i++) {
        arr[i] = obj[i];
    }
    return arr;
}

if (!Element.prototype.children) {
    Object.defineProperty(Element.prototype, "children", {
        configurable: true,
        get: function _get() {
            var arr = toArray(this.childNodes);
            arr = arr.filter(function (el) {
               return this.nodeType === 1;
            });
            return arr;
        }
    });
}

var frag = document.createDocumentFragment();
var div = document.createElement("div");
div.setAttribute("name", "foo");
frag.appendChild(div);
var documentGetElementByIdIsBroken = frag.getElementById("foo");

if (documentGetElementByIdIsBroken) {
    var oldGetById = document.getElementById;
    Object.defineProperty(document, "getElementById", {
        value: function _getById(id) {
            var el = oldGetById.call(document, id);
            if (e.getAttribute("id") === id) {
                return el;
            }
            return null;
        },
        configurable: true
    });
}

var addEventListenerIsBroken = false;
try {
    div.addEventListener("click", function () { });
} catch (e) {
    addEventListenerIsBroken = true;
}
if (addEventListenerIsBroken) {
    var oldEventListener = window.addEventListener;
    var eventListener = function (ev, cb, watch) {
        if (watch === undefined) {
            watch = false;
        }
        oldEventListener.call(this, ev, cb, watch);
    };
    window.addEventListener = 
        document.addEventListener = 
        Element.prototype.addEventListener = eventListener;
}
*/
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
	console.log("insides contains");
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
		if (el instanceof Text) {
			throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
		} else if (el instanceof Element) {
			if (hasEle) {
				throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
			} else {
				hasEle = true;
			}
		}
	}
}

function _preInsertElement(node, parent, child) {
	// TODO: Throw error based on pre-insert 4. 3. (doctype)
}

function _preInsertDocumentType(node, parent, child) {
	var children = parent.childNodes,
		pos = 0,
		firstEl = -1;

	for (var i = 0, len = children.length; i < len; i++) {
		var el = children[i];
		if (el instanceof DocumentType) {
			throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
		}
		if (el.isSameNode(child)) {
			pos = i;
		}
		if (el instanceof Element) {
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

	var condition = parent instanceof Document || parent instanceof DocumentFragment 
		|| parent instanceof Element;
	if (!condition) {
		throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
	}

	if (parent instanceof Document) {
		if (node instanceof Text || node instanceof Document) {
			throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
		}
		if (node instanceof DocumentFragment) {
			_preInsertDocumentFragment(node, parent, child);
		}
		if (node instanceof Element) {
			_preInsertElement(node, parent, child);
			
		}
		if (node instanceof DocumentType) {
			_preInsertDocumentType(node, parent, child);
		}
	}
	if (parent instanceof DocumentFragment || parent instanceof Element) {
		if (node instanceof Document || node instanceof DocumentType) {
			throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
		}
	}
	parent.ownerDocument.adoptNode(node);
	_insert(node, parent, child);
}

function _insert(node, parent, child) {
	// TODO: implement insert
}

function _isSameNode(node) {
	return this === node;
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

// TODO: refactor all instanceof to `.nodeType`

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
	var condition = this instanceof Text || this instanceof Comment
		|| this instanceof ProcessingInstruction;
	if (condition) {
		return this.data;
	}
	return null;
}

function _setNodeValue(value) {
	var condition = this instanceof Text || this instanceof Comment
		|| this instanceof ProcessingInstruction;
	if (condition) {
		_replaceData(this, 0, value.length, value);
	}
}

function _getTextContent() {
	var condition = this instanceof Text || this instanceof Comment
		|| this instanceof ProcessingInstruction;
	if (condition) {
		return this.data;
	} else if (this instanceof Element || this instanceof DocumentFragment) {
		var data = "";
		recursivelyWalk(this.childNodes, function (node) {
			if (node instanceof Text) {
				data += node.data;
			}
		});
		return data;
	}
	return null;
}

function _setTextContent(value) {
	var condition = this instanceof Text || this instanceof Comment
		|| this instanceof ProcessingInstruction;
	if (condition) {
		_replaceData(this, 0, value.length, value);
	} else if (this instanceof Element || this instanceof DocumentFragment) {
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

// TODO: Imeplement insertBefore

// TODO: Implement appendChild

// TODO: Implement replaceChild

// TODO: Implement removeChild

// TODO: Implement cloneNode

// TODO: Implement isSameNode

// TODO; Implement isEqualNode

// TODO: Implement lookupPrefix

// TODO: Implement lookupNamespaceURI

// TODO: Implement isDefaultNamespace
(function () {
	var txt = document.createTextNode("temp"),
		el = document.createElement("p");

	el.appendChild(txt);

	try {
		console.log("calling contains");
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
})();})(window, document);