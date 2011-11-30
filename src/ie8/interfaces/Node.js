var Node = require("all::interfaces/Node"),
    recursivelyWalk = require("utils::index").recursivelyWalk,
	pd = require("utils::pd");

module.exports = pd.extend(Node, {
	constants: {
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
	},
    contains: {
        value: contains  
    },
    compareDocumentPosition: {
        value: compareDocumentPosition
    },
	isEqualNode: {
		value: isEqualNode
	},
    textContent: {
        get: getTextContent,
        set: setTextContent
    }
});

function contains(other) {
    return recursivelyWalk(this.childNodes, function (node) {
         if (node === other) return true;
    }) || false;
}

function isEqualNode(node) {
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
        if (this.namespaceURI != node.namespaceURI ||
            this.prefix != node.prefix ||
            this.localName != node.localName
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

function getTextContent() {
    if ('innerText' in this) {
        return this.innerText;
    }
    if ('data' in this && this.appendData) {
        return this.data;
    }
}

function setTextContent(value) {
    if ('innerText' in this) {
        this.innerText = value;
        return;
    }
    if ('data' in this && this.replaceData) {
        this.replaceData(0, this.length, value);
        return;
    }
}

function compareDocumentPosition(other) {
    var ret = 0;
    if (this.contains) {
        if (this !== other && this.contains(other)) {
            ret += 16;
        }
        if (this !== other && other.contains(this)) {
            ret += 8;
        }
        if (this.sourceIndex >= 0 && other.sourceIndex >= 0) {
            if (this.sourceIndex < other.sourceIndex) {
                ret += 4;
            }
            if (this.sourceIndex > other.sourceIndex) {
                ret += 2;
            }
        } else {
            ret += 1;
        }
    } 
    return ret;
}