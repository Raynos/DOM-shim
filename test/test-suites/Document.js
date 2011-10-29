var counter = 0;

function injectIs(cb) {
    var i = document.createElement("i");
    i.className = "clas";
    i.id = "i1";
    var i2 = document.createElement("i");
    document.body.appendChild(i);
    document.body.appendChild(i2);
    cb(i, i2);
    document.body.removeChild(i);
    document.body.removeChild(i2);
}

suites["test Document"] = {
    "test doctype": function (t) {
        var doc = document.doctype;
        t.equal(doc.nodeType, Node.DOCUMENT_TYPE_NODE, "doctype is not a document node");
        t.done();
    },
    "test documentElement": function (t) {
        var docEl = document.documentElement;
        t.ok(docEl, "document Element does not exist");
        t.done();
    },
    "test getElementsByTagName": function (t) {
        injectIs(function (i, i2) {
            var is = toArray(document.getElementsByTagName("i"));    
            t.notEqual(is.indexOf(i), -1, "i is not in is");
            t.notEqual(is.indexOf(i2), -1, "i2 is not in is");
            t.equal(is.length, 2, "length is not correct");
        });
        t.done();
    },
    "test getElementsByClassName": function (t) {
        injectIs(function (i) {
            var byClass = toArray(document.getElementsByClassName("clas"));
            t.equal(i, byClass[0], "not found by class");
            t.equal(byClass.length, 1, "too many elements found");
        });
        t.done();
    },
    "test getDocumentById": function (t) {
        injectIs(function (i) {
            var el = document.getElementById("i1");
            t.equal(el, i, "not found by id");
        });
        t.done();
    },
    "test createElement": function (t) {
        var e = document.createElement("pre");
        t.equal(e.tagName, "PRE", "tag name is not as expected");
        t.done();
    },
    "test createElementNS": function (t) {
        var e = document.createElementNS("*", "PRE");
        t.equal(e.tagName, "PRE", "tag name is not as expected");
        t.done();
    },
    "test createDocumentFragment": function (t) {
        var e = document.createDocumentFragment();
        t.equal(e.nodeType, Node.DOCUMENT_FRAGMENT_NODE, "is not a doc fragment");
        t.done();
    },
    "test createTextNode": function (t) {
        var e = document.createTextNode("some text");
        t.equal(e.nodeType, Node.TEXT_NODE, "is not a text node");
        t.equal(e.data, "some text", "data not set correctly");
        t.done();
    },
    "test createComment": function (t) {
        var e = document.createComment("some text");
        t.equal(e.nodeType, Node.COMMENT_NODE, "is not a comment");
        t.equal(e.data, "some text", "data not set correctly");
        t.done();
    },
    "test importNode": function (t) {
        var e = document.createElement("div");
        var clone = document.importNode(e);
        t.equal(true, e.isEqualNode(clone), "clone is not equal");
        t.done();
    },
    "test adoptNode": function (t) {
        var e = document.createElement("div");
        document.adoptNode(e);
        t.equal(document, e.ownerDocument, "owner Document is not set");
        t.done();
    },
    "test createEvent": function (t) {
        t.expect(2)
        function handler() {
            t.ok(true, "it did not fire");
            document.removeEventListener("click", handler);
        }

        var ev = document.createEvent("Event");
        ev.initEvent("click", false, false);
        t.equal(Object.getPrototypeOf(ev), Event.prototype, 
            "event is not an event");
        document.addEventListener("click", handler);
        document.dispatchEvent(ev);
        t.done();
    }
}