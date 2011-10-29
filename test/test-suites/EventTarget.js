suites["test EventTarget"] = {
    "test EventTarget": function (t) {
        t.expect(1);
        var et = document.createElement("fake");

        var ev = new CustomEvent("type", {
            detail: {
                "foo": "bar"
            }
        });

        function handler(ev) {
            t.equal(ev.detail.foo, "bar", 
                "event did not work as expected");
            et.removeEventListener("type", handler)
        }

        et.addEventListener("type", handler);
        et.dispatchEvent(ev);
        t.done();
    }
}