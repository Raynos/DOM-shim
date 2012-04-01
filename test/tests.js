suite("CharacterData", function () {
    var text, container

    setup(function () {
        text = document.createTextNode("foo")
        container = document.createElement("div")

        container.appendChild(text)
    })

    test("after", function () {
        text.after("foo")
        text.after(document.createElement("div"))
        text.after("bar", document.createElement("p"))
        assert(container.childNodes[4].data === "foo",
            "foo was not inserted")
        assert(container.childNodes[3].tagName === "DIV",
            "div was not inserted")
        assert(container.childNodes[2].tagName === "P",
            "p was not inserted")
        assert(container.childNodes[1].data === "bar",
            "bar was not inserted")
        container.removeChild(text)
        text.after("foobar")
    })

    test("remove", function () {
        text.remove()
        assert(container.childNodes.length === 0,
            "container still has children")

        text.remove()
    })

    test("before", function () {
        text.before("foo")
        text.before(document.createElement("div"))
        text.before("bar", document.createElement("p"))
        assert(container.childNodes[0].data === "foo",
            "foo was not inserted")
        assert(container.childNodes[1].tagName === "DIV",
            "div was not inserted")
        assert(container.childNodes[2].data === "bar",
            "bar was not inserted")
        assert(container.childNodes[3].tagName === "P",
            "p was not inserted")

        container.removeChild(text)
        text.before("foobar")  
    })

    test("replace", function () {
        text.replace(document.createTextNode("bar"))
        assert(container.firstChild.data === "bar",
            "foo was not replaced")

        container.firstChild.replace(
            document.createTextNode("foobab"),
            document.createTextNode("foobaz")
        )

        assert(container.childNodes[0].data === "foobab",
            "foobab not inserted")
        assert(container.childNodes[1].data === "foobaz",
            "foobaz not inserted")

        container.firstChild.replace(document.createElement("div"))

        assert(container.firstChild.tagName === "DIV",
            "div not inserted")

        text.replace(document.createTextNode("baz"))
    })
})

suite("DocumentType", function () {
    var doctype = document.doctype, 
        container = doctype.parentNode

    teardown(function () {
        if (doctype.parentNode === null) {
            container.insertBefore(doctype, container.firstChild)
        }
    })

    test("after", function () {
        doctype.after(document.createComment("foo"))
        assert(doctype.nextSibling.data === "foo",
            "foo was not inserted")
    })

    test("remove", function () {
        doctype.remove()
        assert(doctype.parentNode === null,
            "doctype was not removed")
    })

    test("before", function () {
        doctype.before(document.createComment("bar"))
        assert(doctype.previousSibling.data === "bar",
            "bar was not inserted")
    })

    test("replace", function () {
        var anchor = doctype.nextSibling
        doctype.replace(document.createComment("baz"))
        assert(anchor.previousSibling.data === "baz",
            "baz was not inserted")
    })
})

suite("Document", function () {
    test("append", function () {
        document.append(document.createComment("foo"))
        assert(document.lastChild.data === "foo",
            "div is not appended")
    })

    test("prepend", function () {
        document.prepend(document.createComment("bar"))
        assert(document.firstChild.data === "bar",
            "span is not prepended")
    })
})

suite("Element", function () {
    var elem, container

    setup(function () {
        elem = document.createElement("div")
        container = document.createElement("div")
        container.appendChild(elem)
    })

    test("append", function () {
        elem.append("foo")
        elem.append("bar")
        assert(elem.firstChild.data === "foo",
            "foo was not appended")
        assert(elem.childNodes[1].data === "bar",
            "bar was not appended")
    })

    test("prepend", function () {
        elem.prepend("foo")
        elem.prepend("bar")
        assert(elem.childNodes[1].data === "foo",
            "foo was not prepended")
        assert(elem.childNodes[0].data === "bar",
            "bar was not prepended")
    })

    test("after", function () {
        elem.after("foo")
        assert(container.childNodes[1].data === "foo",
            "foo was not aftered")
    })

    test("remove", function () {
        elem.remove()
        assert(container.childNodes.length === 0,
            "elem was not removed")
    })

    test("before", function () {
        elem.before("foo")
        assert(container.childNodes[0].data === "foo",
            "foo was not befored")
    })

    test("replace", function () {
        elem.replace("foo")
        assert(container.childNodes[0].data === "foo" &&
            elem.parentNode === null,
            "foo was not replaced")
    })
})

suite("CustomEvent", function () {
    test("Constructor", function () {
        var ev = new CustomEvent("magic", {
            detail: "foobar"
        })
        assert(ev.type === "magic",
            "type is not magic")
    })

    test("detail", function () {
        var ev = new CustomEvent("magic", {
            detail: "foobar"
        })
        
        assert(ev.detail === "foobar",
            "detail is not foobar")
    })
})

suite("DocumentFragment", function () {
    var frag

    setup(function () {
        frag = document.createDocumentFragment()
    })

    test("append", function () {
        frag.append("foo")
        frag.append("bar")
        assert(frag.childNodes[0].data === "foo",
            "appended foo")
    })

    test("prepend", function () {
        frag.prepend("foo")
        frag.prepend("bar")
        assert(frag.childNodes[1].data === "foo",
            "appended foo")
    })
})

suite("Event", function () {
    test("Constructor", function () {
        var ev = new Event("click")

        assert(ev.type === "click",
            "type is not click")
    })

    test("timeStamp", function () {
        var ev = new Event("click")

        assert(typeof ev.timeStamp === "number",
            "timestamp is not a number")
    })
})

suite("Range", function () {
    test("intersectsNode", function () {
        var r = document.createRange()

        var node = document.createTextNode("foo"),
            node2 = document.createTextNode("bar"),
            div = document.createElement("div")

        div.style.display = "none"

        document.body.appendChild(div)

        div.appendChild(node)
        div.appendChild(node2)

        r.setStartBefore(node)
        r.setEndAfter(node2)

        var bool = r.intersectsNode(div)
        assert(bool, "intersectNode did not work")
    })
})