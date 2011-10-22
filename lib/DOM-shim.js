;(function (window, document, undefined) { 
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

// TODO: Implement cloneNode

// TODO: Implement isEqualNode

// TODO: Implement lookupPrefix

// TODO: Implement lookupNamespaceURI

// TODO: Implement isDefaultNamespace

///
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
var HTMLDocument = window.HTMLDocument;
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
}
/*
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

})(window, document);