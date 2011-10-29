function createElement() {
    var e = document.createElement("div");
    var div1 = document.createElement("div");
    div1.className = "divo";
    var div2 = document.createElement("div");
    div2.className = "divo";
    var p1 = document.createElement("p");
    p1.className = "po";
    e.appendChild(document.createTextNode("foo"));
    e.appendChild(div1);
    e.appendChild(p1);
    p1.appendChild(div2);
    return e;
}

suites["test Element"] = {
    "test classList": function (t) {
        var el = document.createElement("div");
        el.className = "baz";
        var clist = el.classList;
        t.equal(clist.contains("baz"), true, 
            "class list does not contain baz");
        clist.remove("baz");
        clist.add("foo");
        t.equal(el.className, "foo", 
            "class name is not adjusted properly");
        clist.remove("foo");
        t.equal(el.className, "", "class name is not adjusted properly");
        clist.add("bar");
        t.ok(clist.contains("bar"), "class list contains is broken");
        t.equal(clist[0], "bar", "index does not work");
        clist.add("foo");
        t.equal(clist.item(1), "foo", "item does not work");
        t.equal(clist.toggle("foo"), false, 
            "toggle does not return boolean");
        t.equal(clist.contains("foo"), false, 
            "contains does not show properly");
        t.equal(clist.toggle("foo"), true, "toggle does not return true");
        t.equal(clist.contains("foo"), true, "toggle did not add token");
        t.done();
    },
    "test children": function (t) {
        var el = document.createElement("div");
        el.textContent = "foobar";
        var sub = document.createElement("div");
        el.appendChild(sub);
        t.equal(el.children.length, 1, 
            "children does not have length one");
        t.equal(el.children[0], sub, "child is not sub");
        t.done();       
    }, 
    "test getElementsByTagName": function (t) {
        var e = createElement();
        var els = toArray(e.getElementsByTagName("div"));
        t.equal(els.length, 2, "size is incorrect");
        t.notEqual(els.indexOf(e.childNodes[1]), -1, 
            "does not contain div1");
        t.notEqual(els.indexOf(e.childNodes[2].childNodes[0]), -1, 
            "does not contain div2");
        t.done();
    },
    "test getElementsByClassName": function (t) {
        var e = createElement();
        var els = toArray(e.getElementsByClassName("divo"));
        t.equal(els.length, 2, "size is incorrect");
        t.notEqual(els.indexOf(e.childNodes[1]), -1, 
            "does not contain div1");
        t.notEqual(els.indexOf(e.childNodes[2].childNodes[0]), -1, 
            "does not contain div2");
        t.done();
    },
    "test firstElementChild": function (t) {
        var e = createElement();
        t.equal(e.firstElementChild, e.childNodes[1],
            "first element child is incorrect");
        t.done();
    },
    "test lastElementChild": function (t) {
        var e = createElement();
        t.equal(e.lastElementChild, e.childNodes[2],
            "last element child is incorrect");
        t.done();
    },
    "test previousElementSibling": function (t) {
        var e = createElement();
        t.equal(e.childNodes[1].previousElementSibling, null,
            "previous element sibling is incorrect 1");
        t.equal(e.childNodes[2].previousElementSibling, e.childNodes[1],
            "previous element sibling is incorrect 2");
        t.done();
    },
    "test nextElementSibling": function (t) {
        var e = createElement();
        t.equal(e.childNodes[1].nextElementSibling, e.childNodes[2],
            "next element siblign is incorrect");
        t.done();
    },
    "test childElementCount": function (t) {
        var e = createElement();
        t.equal(e.childElementCount, 2, "child element count is wrong");
        t.done();
    }
}