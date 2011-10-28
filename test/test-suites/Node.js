suites["Test Node"] = {
	"test nodeType": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.nodeType, Node.ELEMENT_NODE, "nodeType for element is correct");
		t.equal(nodes.txt.nodeType, Node.TEXT_NODE, "nodeType for text nodes is correct");
		t.equal(nodes.com.nodeType, Node.COMMENT_NODE, "nodeType for comment nodes is correct");
		t.equal(nodes.doc.nodeType, Node.DOCUMENT_NODE, "nodeType for document nodes is correct");
		t.equal(nodes.doctype.nodeType, Node.DOCUMENT_TYPE_NODE, "nodeType for documentType nodes is correct");
		t.equal(nodes.docfrag.nodeType, Node.DOCUMENT_FRAGMENT_NODE, "nodeType for documentFragment nodes is correct");
		t.done();
	},
	"test nodeName": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.nodeName, "P", "nodeName for element is correct");
		t.equal(nodes.txt.nodeName, "#text", "nodeName for text is correct");
		t.equal(nodes.com.nodeName, "#comment", "nodeName for comment is correct");
		t.equal(nodes.doc.nodeName, "#document", "nodeName for document is correct");
		t.equal(nodes.doctype.nodeName, "html5", "nodeName for documenttype is correct");
		t.equal(nodes.docfrag.nodeName, "#document-fragment", "nodeName for documentFragment is correct");
		t.done();
	},
	// TODO: Test baseUri
	"test ownerDocument": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.ownerDocument, document, "ownerDocument is the document");
		t.done();
	},
	// TODO: Test parentNode
	"test parentElement": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.el.parentElement, null, "parentElement is null for non-element");
		nodes.el.appendChild(nodes.el2);
		t.equal(nodes.el2.parentElement, nodes.el, "parentElement is an element");
		t.done();
	},
	"test hasChildNodes": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.hasChildNodes(), false, "hasChildNodes returns false for no children");
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.hasChildNodes(), true, "hasChildNodes returns true for children");
		t.done();
	},
	// TODO: Test childNodes
	"test firstChild": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.firstChild, null, "firstChild is null for no children");
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.firstChild, nodes.el, "firstChild is set correctly");
		t.done();
	},
	"test lastChild": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.lastChild, null, "lastChild is null for no children");
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.lastChild, nodes.txt, "lastChild is set correctly");
		t.done();
	},
	"test previousSibling": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.el.previousSibling, null, "previousSibling is null for no left sibling");
		t.equal(nodes.txt.previousSibling, nodes.el, "previousSibling is set correctly");
		t.done();
	},
	"test nextSibling": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.txt.nextSibling, null, "nextSibling is null for no right sibling");
		t.equal(nodes.el.nextSibling, nodes.txt, "nextSibling is set correctly");
		t.done();
	},
	"test compareDocumentPosition": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		var comparison = nodes.el.compareDocumentPosition(nodes.docfrag);
		t.equal(comparison & Node.DOCUMENT_POSITION_CONTAINS, Node.DOCUMENT_POSITION_CONTAINS,
			"docfrag contains el");
		t.equal(comparison & Node.DOCUMENT_POSITION_PRECEDING, Node.DOCUMENT_POSITION_PRECEDING,
			"docfrag precedes el");
		var comparison = nodes.docfrag.compareDocumentPosition(nodes.el);
		t.equal(comparison & Node.DOCUMENT_POSITION_CONTAINED_BY, Node.DOCUMENT_POSITION_CONTAINED_BY,
			"el is contained by docfrag");
		t.equal(comparison & Node.DOCUMENT_POSITION_FOLLOWING, Node.DOCUMENT_POSITION_FOLLOWING,
			"el is following docfrag");
		var comparison = nodes.el.compareDocumentPosition(nodes.el);
		t.equal(comparison, 0, "equal nodes return 0");
		var comparison = nodes.el.compareDocumentPosition(nodes.txt);
		t.equal(comparison & Node.DOCUMENT_POSITION_FOLLOWING, Node.DOCUMENT_POSITION_FOLLOWING,
			"text is following el");
		t.done();
	},
	"test contains": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.contains(nodes.el), true, "docfrag contains el");
		t.equal(nodes.el.contains(nodes.txt), false, "el does not contains txt");
		t.done();
	},
	"test nodeValue": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.nodeValue, null, "nodeValue is null for docfrag");
		nodes.docfrag.nodeValue = 42;
		t.equal(nodes.docfrag.nodeValue, null, "nodeValue is still null for docfrag");
		t.equal(nodes.txt.nodeValue, "", "nodeValue default for txt is empty string");
		nodes.txt.nodeValue = 42;
		t.equal(nodes.txt.nodeValue, 42, "nodeValue is set properly for txt nodes");
		t.done();
	},
	"test textContent": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.txt.textContent, "", "textContent for txt node defaults to empty string");
		nodes.txt.textContent = "foo";
		t.equal(nodes.txt.textContent, "foo", "textContent for txt node is properly set");
		t.equal(nodes.el.textContent, "", "textContent for el node is empty string");
		nodes.el.textContent = "foo";
		t.ok(nodes.el.firstChild, "el has a child");
		t.equal(nodes.el.firstChild.nodeType, Node.TEXT_NODE, "child is a text node");
		t.equal(nodes.el.firstChild.textContent, "foo", "text content of the child node is set");
		t.equal(nodes.el.textContent, "foo", "text content of the el is set");
		t.done();
	},
	"test insertBefore": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.txt);
		nodes.docfrag.insertBefore(nodes.el, nodes.txt);
		t.equal(nodes.el, nodes.docfrag.childNodes[0], "el is first child of domfrag");
		nodes.docfrag.insertBefore(nodes.el2, nodes.txt);
		t.equal(nodes.el2, nodes.docfrag.childNodes[1], "el2 is second child of domfrag");
		t.done();
	},
	"test appendChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.el, nodes.docfrag.childNodes[0], "el was appended correctly");
		nodes.docfrag.appendChild(nodes.el2);
		t.equal(nodes.el2, nodes.docfrag.childNodes[1], "el2 was appended correctly");
		t.done();
	},
	"test replaceChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.replaceChild(nodes.txt, nodes.el);
		t.equal(nodes.txt, nodes.docfrag.childNodes[0], "txt node was correctly replaced");
		nodes.docfrag.appendChild(nodes.el2);
		nodes.docfrag.replaceChild(nodes.el, nodes.el2);
		t.equal(nodes.el, nodes.docfrag.childNodes[1], "el node was correctly replaced into docfrag");
		t.done();
	},
	"test removeChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.docfrag.hasChildNodes(), true, "docfrag has children");
		nodes.docfrag.removeChild(nodes.el);
		t.equal(nodes.docfrag.hasChildNodes(), false, "node was correctly removed");
		t.done();
	},
	"test cloneNode": function (t) {
		var nodes = makeNodes();
		try {
			var clone = nodes.el.cloneNode();	
		} catch (e) {
			console.log(e);
		}
		
		t.equal(clone.isEqualNode(nodes.el), true, "the clone is the same");
		t.done(); 
	},
	"test isSameNode": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.txt.isSameNode(nodes.el), false, "nodes should be different");
		t.equal(nodes.el.isSameNode(nodes.el), true, "nodes should be the same");
		t.done();
	},
	"test isEqualNode": function (t) {
		var nodes = makeNodes();
		var clone = nodes.el.cloneNode();
		t.equal(clone.isEqualNode(nodes.el), true, "the clone is the same");
		t.done(); 
	}
};