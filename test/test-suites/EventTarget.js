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
    },
    "test adding events twice doesn't work": function (t) {
        t.expect(1);
        var count = 0;
        var et = document.body;

        var ev = new Event("click");

        function handler(ev) {
            count++;
        }
        et.addEventListener("click", handler);
        et.addEventListener("click", handler);
        et.dispatchEvent(ev);
        t.ok(count === 1, "event handler fired twice");
        t.done();
        et.removeEventListener("click", handler);
    },
    "test works with real events": function (t) {
        t.expect(1);
        var count = 0;
        var et = document.body;
        if (!et.fireEvent ||
            et.addEventListener.toString().indexOf("[native code]") !== -1
        ) {
            t.ok(true, "test irrelevant");
            return t.done();
        }

        function handler (ev) {
            console.log("handler inside fired");
            count++;
        }
        et.addEventListener("click", handler);
        et.fireEvent("onclick");
        t.ok(count === 1, "event handler didn't fire");
        t.done();
        et.removeEventListener("click", handler);
    }
}