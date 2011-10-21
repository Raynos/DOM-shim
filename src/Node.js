var Node = window.Node,
	NodeProto = window.Node.prototype,
	Element = window.Element,
	ElementProto = window.Element.prototype,
	Text = window.Text,
	TextProto = window.Text.prototype,
	Comment = window.Comment,
	CommentProto = window.Comment.prototype,
	ProcessingInstruction = window.ProcessingInstruction,
	ProcessingInstructionProto = window.ProcessingInstruction.prototype,
	DocumentFragment = window.DocumentFragment,
	DocumentFragmentProto = window.DocumentFragment.prototype,
	DocumentType = window.DocumentType,
	DocumentTypeProto = window.DocumentType.prototype,
	Document = window.Document,
	DocumentProto = window.Document.prototype;

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
	if (!Node[constName]) {
		Object.defineProperty(Node, constName, {
			value: nodeConsts[constName],
			configurable: true,
			enumerable: true
		});
	}
}

Object.keys(nodeConsts).forEach(_addConstsToNode);

if (!NodeProto.ownerDocument) {
	Object.defineProperty(NodeProto, "ownerDocument", {
		value: document,
		configurable: true,
		enumerable: true
	});
}

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

if (!NodeProto.nodeType) {
	Object.defineProperty(NodeProto, "nodeType", {
		get: _getNodeType,
		configurable: true,
		enumerable: true
	});
}

function _getNodeName() {
	if (this instanceof Element) {
		return this.tagName;
	} else if (this instanceof Text) {
		return "#text";
	} else if (this instanceof ProcessingInstruction) {
		return this.target
	} else if (this instanceof Comment) {
		return "#comment";
	} else if (this instanceof Document) {
		return "#document";
	} else if (this instanceof DocumentType) {
		return this.name;
	} else if (this instanceof DocumentFragment) {
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

if (!NodeProto.compareDocumentPosition) {
	Object.defineProperty(NodeProto, "compareDocumentPosition", {
		value: _compareDocumentPosition,
		enumerable: true,
		configurable: true,
		writable: true
	});
}

function _contains(other) {
	var comparison = this.compareDocumentPosition(other);
	if (comparison === 0 || 
		comparison & Node.DOCUMENT_POSITION_CONTAINED_BY
	) {
		return true;
	}
}

if (!NodeProto.contains) {
	Object.defineProperty(NodeProto, "contains", {
		value: _contains,
		enumerable: true,
		configurable: true,
		writable: true
	});
}

// TODO: Implement nodeValue

// TODO: Implement textContent

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
