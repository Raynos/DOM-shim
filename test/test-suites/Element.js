suites["test Element"] = {
    "test classList": function (t) {
        var el = document.createElement("div");
        var clist = el.classList;
        clist.add("foo");
        t.equal(el.className, "foo", "class name is not adjusted properly");
        clist.remove("foo");
        t.equal(el.className, "", "class name is not adjusted properly");
        clist.add("bar");
        t.ok(clist.contains("bar"), "class list contains is broken");
        t.equal(clist[0], "bar", "index does not work");
        clist.add("foo");
        t.equal(clist.item(1), "foo", "item does not work");
        t.equal(clist.toggle("foo"), false, "toggle does not return boolean");
        t.equal(clist.contains("foo"), false, "contains does not show properly");
        t.equal(clist.toggle("foo"), true, "toggle does not return true");
        t.equal(clist.contains("foo"), true, "toggle did not add token");
        t.done();
    },
    "test children": function (t) {
        var el = document.createElement("div");
        el.textContent = "foobar";
        var sub = document.createElement("div");
        el.appendChild(sub);
        t.equal(el.children.length, 1, "children does not have length one");
        t.equal(el.children[0], sub, "child is not sub");
        t.done();
    }
}