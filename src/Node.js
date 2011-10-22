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
