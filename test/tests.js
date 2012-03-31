suite("CharacterData", function () {
    test("after", function () {
        var text = document.createTextNode("foo"),
            container = document.createElement("div")

        container.appendChild(text)
        text.after("foo")
        text.after(document.createElement("div"))
        text.after("bar", document.createElement("p"))
        console.log(container.childNodes)
        assert(container.childNodes[4].data === "foo",
            "foo was not inserted")
        assert(container.childNodes[3].tagName === "DIV",
            "div was not inserted")
        assert(container.childNodes[2].data === "bar",
            "bar was not inserted")
        assert(container.childNodes[1].tagName === "P",
            "p was not inserted")
    })
})