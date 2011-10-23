suites["test Events"] = {
    "test addEventListener": function (t) {
        t.expect(2);
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.addEventListener("click", function _handler1(ev) {
            t.ok(ev, "event has an event object");
            t.equal(ev.type, "click", "event type is correctly set");
            t.done();
            document.body.removeChild(el);
            el.removeEventListener("click", _handler1);
        });
        var ev = document.createEvent("UIEvent");
        ev.initEvent("click", false, false);
        el.dispatchEvent(ev);
    },
    "test dispatchEvent": function (t) {
        t.expect(1);
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.addEventListener("click", function _handler2() {
            t.ok(true, "event listener was called");
            t.done();
            el.removeEventListener("click", _handler2);
        });
        var ev = document.createEvent("UIEvent");
        ev.initEvent("click", false, false);
        el.dispatchEvent(ev);  
    },
    "test removeEventListener": function (t) {
        t.expect(1);
        var counter = 0;
        function _handler3() {
            counter++;
        }
        function _handler4() {
            counter++;
            document.removeEventListener("click", _handler4);
        }
        document.addEventListener("click", _handler3);
        document.addEventListener("click", _handler4);
        document.addEventListener("keyup", function _handler5() {
            t.equal(counter, 1, "counter is correctly set");
            t.done();
            document.removeEventListener("keyup", _handler5);
        });
        document.removeEventListener("click", _handler3);
        var ev = document.createEvent("UIEvent");
        ev.initEvent("click", false, false);
        document.dispatchEvent(ev);
        var ev = document.createEvent("UIEvent");
        ev.initEvent("keyup", false, false);
        document.dispatchEvent(ev);
    }
}