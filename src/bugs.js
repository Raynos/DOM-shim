// IE - contains fails if argument is textnode
(function () {
    var txt = document.createTextNode("temp"),
        el = document.createElement("p");

    el.appendChild(txt);

    try {
        el.contains(txt);
    } catch (e) {
        // The contains method fails on text nodes in IE8
        // swap the contains method for our contains method
        domShim.utils.addPropsToProto(
            {
                "contains": {
                    value: domShim.props.Node.contains.value,
                    force: true 
                }
            },
            Node.prototype
        );
    }
})();

// Firefox fails on .cloneNode thinking argument is not optional
(function () {
    function _cloneNodeOnProto(proto) {
        var cloneNodePD = Object.getOwnPropertyDescriptor(proto, "cloneNode");
        if (cloneNodePD === undefined) {
            cloneNodePD = {
                "enumerable": true,
                "writable": true,
                "configurable": true
            };
        }
        var oldCloneNode = cloneNodePD.value;
        cloneNodePD.value = function _cloneNode(bool) {
            if (bool === undefined) {
                bool = true;
            }
            return oldCloneNode.call(this, bool);
        };
        var flag = Object.defineProperty(proto, "cloneNode", cloneNodePD);
    }
    var el = document.createElement("p");

    try {
        el.cloneNode();
    } catch (e) {
        if (e.message === "Not enough arguments") {
            // Firefox things the argument is not optional
            [
                domShim.Node.prototype,
                domShim.Comment.prototype,
                domShim.Element.prototype,
                domShim.ProcessingInstruction.prototype,
                domShim.Document.prototype,
                domShim.DocumentType.prototype,
                domShim.DocumentFragment.prototype
            ].forEach(_cloneNodeOnProto);

            Object.keys(domShim.HTMLEls).forEach(function (name) {
                _cloneNodeOnProto(domShim.HTMLEls[name].prototype);
            });
        }
    }
})();

// IE9 throws an error when trying to access .code on the 
// DOMException prototype
(function () {
    var ex = Object.create(domShim.DOMException.prototype);

    try {
        var temp = ex.code;
    } catch (e) {
        // IE9 cannot get code
        delete domShim.DOMException.prototype.code;
    }
})();

// IE8 Document does not inherit EventTarget
(function () {
    if (!document.addEventListener) {
        domShim.utils.addPropsToProto(
            domShim.props.EventTarget, domShim.Document.prototype);
    }
})();

// FF fails when you "forgot" the optional parameter
(function () {
    var dummy = function () {};
    try {
        document.addEventListener("click", dummy);
    } catch (e) {
        var old = EventTarget.prototype.addEventListener;
        domShim.utils.addPropsToProto(
            {
                "addEventListener": {
                    value: function (type, listener, optional) {
                        optional = optional || false;
                    },
                    force: true
                }
            },
            EventTarget.prototype
        );
    } finally {
        document.removeEventListener("click", dummy);
    }
})();

// Chrome throws error if using Error
// IE9 says Event is an object and not a function -.- 
// IE8 doesn't like it and gives a different error messsage!
(function () {
    try {
        new Event("click");
    } catch (e) {
        if (e.message === "Illegal constructor" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support this property or method"
        ) {
            var proto = Event.prototype;
            window.Event = function () {
                domShim._Event.apply(this, arguments);
            }
            Event.prototype = proto;
        }
    }
})();

// Chrome initEvent will not work on Event.prototype objects
// IE9 says you cant call .initEvent either
// IE8 says no and uses a different error message!
(function () {
    try {
        var e = new Event("click");    
    } catch (e) {
        if (e.message === "Illegal invocation" ||
            e.message === "Invalid calling object" ||
            e.message === "Object doesn't support property or method 'initEvent'"
        ) {
            // fix it by rewriting Event.
            var proto = Event.prototype;
            window.Event = function () {
                var e = document.createEvent("Events");
                domShim._Event.apply(e, arguments);
                return e;
            }
            Event.prototype = proto;
        }
    }
})();

// Chrome calling .initEvent on a CustomEvent object is a no-no
// IE9 doesn't like it either
// IE8 says no in its own special way.
(function () {
    try {
        var c = new CustomEvent("magic");
    } catch (e) {
        if (e.type === "illegal_invocation" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support property or method 'initEvent'"
        ) {
            var proto = CustomEvent.prototype;
            window.CustomEvent = function () {
                var e = document.createEvent("Event");
                domShim._CustomEvent.apply(e, arguments);
                return e;
            }
            CustomEvent.prototype = proto;
        }
    }
})();

// IE8 window.addEventListener does not exist
(function () {
    if (!window.addEventListener) {
        window.addEventListener = document.addEventListener.bind(document);
    }
    if (!window.removeEventListener) {
        window.removeEventListener = document.removeEventListener.bind(document);
    }
    if (!window.dispatchEvent) {
        window.dispatchEvent = document.dispatchEvent.bind(document);
    }
})();