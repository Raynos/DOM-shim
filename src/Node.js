var Node = window.Node,
	NodeProto = window.Node.prototype,
	ElementProto = window.Element.prototype,
	TextProto = window.Text.prototype,
	CommentProto = window.Comment.prototype,
	ProcessingInstructionProto = window.ProcessingInstruction.prototype,
	DocumentFragmentProto = window.DocumentFragment.prototype,
	DocumentTypeProto = window.DocumentType.prototype,
	DocumentProto = window.Document.prototype;

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

function _addConstsToNode(constName) {
	if (!Node[constsName]) {
		Object.defineProperty(Node, constName, {
			value: nodeConsts[constsName],
			configurable: true,
			enumerable: true
		});
	}
}

Object.keys(nodeConts).forEach(_addConstsToNode);

if (!NodeProto.ownerDocument) {
	Object.defineProperty(NodeProto, "ownerDocument", {
		value: document,
		configurable: true,
		enumerable: true
	});
}

function _getNodeType() {
	if (ElementProto.isPrototypeOf(this)) {
		return Node.ELEMENT_NODE;
	} else if (TextProto.isPrototypeOf(this)) {
		return Node.TEXT_NODE;
	} else if (ProcessingInstructionProto.isPrototypeOf(this)) {
		return Node.PROCESSING_INSTRUCTION_NODE;
	} else if (CommentProto.isPrototypeOf(this)) {
		return Node.COMMENT_NODE;
	} else if (DocumentProto.isPrototypeOf(this)) {
		return Node.DOCUMENT_NODE;
	} else if (DocumentTypeProto.isPrototypeOf(this)) {
		return Node.DOCUMENT_TYPE_NODE;
	} else if (DocumentFragmentProto.isPrototypeOf(this)) {
		return Node.DOCUMENT_FRAGMENT_NODE;
	}
}

if (!NodeProto.nodeType) {
	Object.defineProperty(NodeProto, "nodeType", {
		get: _getNodeType,
		configurable: true,
		enumerable: true
	});
}

function _getNodeName() {
	if (ElementProto.isPrototypeOf(this)) {
		return this.tagName;
	} else if (TextProto.isPrototypeOf(this)) {
		return "#text";
	} else if (ProcessingInstructionProto.isPrototypeOf(this)) {
		return this.target
	} else if (CommentProto.isPrototypeOf(this)) {
		return "#comment";
	} else if (DocumentProto.isPrototypeOf(this)) {
		return "#document";
	} else if (DocumentTypeProto.isPrototypeOf(this)) {
		return this.name;
	} else if (DocumentFragmentProto.isPrototypeOf(this)) {
		return "#document-fragment";
	}
}

if (!NodeProto.nodeName) {
	Object.defineProperty(NodeProto, "nodeName", {
		get: _getNodeName,
		configurable: true,
		enumerable: true
	});
}

// TODO: Implement NodeProto.baseUri

// BUG: .parentNode cannot be shimmed

function _getParentElement() {
	var parent = this.parentNode;
	if (parent == null) {
		return null;
	}
	if (ElementProto.isPrototypeOf(parent)) {
		return parent;
	}
	return null;
}

if (!NodeProto.parentElement) {
	Object.defineProperty(NodeProto, "parentElement", {
		get: _getParentElement,
		configurable: true,
		enumerable: true
	});
}

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

if (!NodeProto.hasChildNodes) {
	Object.definePropert(NodeProto, "hasChildNodes", {
		value: _hasChildNodes,
		configurable: true,
		enumerable: true
	});
}

// BUG: .childNodes cannot be shimmed

function _getFirstChild() {
	var children = this.childNodes,
		firstChild = children && children[0];

	return firstChild || null;
}

if (!NodeProto.firstChild) {
	Object.defineProperty(NodeProto, "firstChild", {
		get: _getFirstChild,
		configurable: true,
		enumerable: true
	});
}

function _getLastChild() {
	var children = this.childNodes,
		lastChild = children && children[children.length -1];

	return lastChild || null;
}

if (!NodeProto.lastChild) {
	Object.defineProperty(NodeProto, "lastChild", {
		get: _getLastChild,
		configurable: true,
		enumerable: true
	});
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

if (!NodeProto.previousSibling) {
	Object.defineProperty(NodeProto, "previousSibling", {
		get: _getPreviousSibling,
		configurable: true,
		enumerable: true
	});
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

if (!NodeProto.nextSibling) {
	Object.defineProperty(NodeProto, "nextSibling", {
		get: _getNextSibling,
		enumerable: true,
		configurable: true
	});
}