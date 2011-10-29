suites["test Events"] = {
    "test addEventListener": function (t) {
        t.expect(2);
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.addEventListener("click", function _handler1(ev) {
            t.ok(ev, "event has an event object");
            t.equal(ev.type, "click", "event type is correctly set");
            document.body.removeChild(el);
            el.removeEventListener("click", _handler1);
        });
        var ev = document.createEvent("Event");
        ev.initEvent("click", false, false);
        el.dispatchEvent(ev);
        t.done();
    },
    "test dispatchEvent": function (t) {
        t.expect(1);
        var el = document.createElement("div");
        document.body.appendChild(el);
        el.addEventListener("click", function _handler2() {
            t.ok(true, "event listener was called");
            el.removeEventListener("click", _handler2);
        });
        var ev = document.createEvent("Event");
        ev.initEvent("click", false, false);
        el.dispatchEvent(ev);
        t.done();
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
        function _handler5() {
            t.equal(counter, 1, "counter is correctly set");
            document.removeEventListener("keyup", _handler5);
        }

        document.addEventListener("click", _handler3);
        document.addEventListener("click", _handler4);
        document.addEventListener("keyup", _handler5);
        document.removeEventListener("click", _handler3);
        var ev = document.createEvent("Event");
        ev.initEvent("click", false, false);
        document.dispatchEvent(ev);
        var ev = document.createEvent("Event");
        ev.initEvent("keyup", false, false);
        document.dispatchEvent(ev);
        t.done();
    },
    "test Event constructor": function (t) {
        t.expect(3);
        var e = new Event("click");
        t.equal(Object.getPrototypeOf(e), Event.prototype, 
            "prototype is not as expected");
        t.equal(e.type, "click", "type not set correctly");
        var handler = function () {
            t.ok(true, "did not fire");
            window.removeEventListener("click", handler);
        };
        window.addEventListener("click", handler)
        window.dispatchEvent(e);    
        t.done();
    },
    "test CustomEvent constructor": function (t) {
        t.expect(3);
        var called = 0;
        var e = new CustomEvent("magic", {
            bubbles: true
        });
        t.equal(Object.getPrototypeOf(e), CustomEvent.prototype, 
            "prototype is not as expected");
        t.equal(e.type, "magic", "type not set correctly");
        var handler = function () {
            if (++called === 2) {
                t.ok(called, "did not fire");
                window.removeEventListener("magic", handler);
            }
        };
        window.addEventListener("magic", handler);
        window.dispatchEvent(e);
        document.documentElement.firstChild.dispatchEvent(e);
        t.done();
    },
    "test CustomEvent detail": function (t) {
        t.expect(1);
        var e = new CustomEvent("someEv", {
            detail: {
                "flag": true
            }
        });
        var handler = function (ev) {
            t.equal(ev.detail.flag, true, "detail does not work");
            document.removeEventListener("someEv", handler);
        }
        document.addEventListener("someEv", handler);
        document.dispatchEvent(e);
        t.done();
    }
}