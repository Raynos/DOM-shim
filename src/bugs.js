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
// Opera agress that its not optional.
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
        var oldCloneNode = cloneNodePD.value || 
            domShim.props.Node.cloneNode.value;

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
        if (e.message === "Not enough arguments" ||
            e.message === "WRONG_ARGUMENTS_ERR"
        ) {
            // Firefox things the argument is not optional
            [
                Node.prototype,
                Comment.prototype,
                Element.prototype,
                ProcessingInstruction.prototype,
                Document.prototype,
                DocumentType.prototype,
                DocumentFragment.prototype
            ].forEach(_cloneNodeOnProto);

            Object.keys(domShim.HTMLEls).forEach(function (name) {
                var thing = domShim.HTMLEls[name];
                if (thing) {
                    _cloneNodeOnProto(thing.prototype);    
                }
            });
        }
    }
})();

// IE8 Document does not inherit EventTarget
(function () {
    if (!document.addEventListener) {
        domShim.utils.addPropsToProto(
            domShim.props.EventTarget, Document.prototype);
    }
})();

// IE9 accessing DOMException.prototype.code throws an error
// Firefox also thinks accessing DOMException.prototype.code throws an error
(function () {
    var e = Object.create(DOMException.prototype);
    try {
        e.code;
    } catch (err) {
        if (err.message === "Invalid calling object" ||
            err.message === "Illegal operation on WrappedNative prototype object"
        ) {
            var pd = Object.getOwnPropertyDescriptor(DOMException.prototype, "code");
            var _getter = pd.get;
            pd.get = function () {
                if (this._code) {
                    return this._code;
                } else {
                    return _getter.call(this);
                }
            };
            pd.set = function (v) {
                this._code = v;
            }
            Object.defineProperty(DOMException.prototype, "code", pd);
        }
    }
})();

// Fixing yet another bug no-one cares about.
// FireFox says no on accessing DOMException.prototype.name
(function () {
    var e = Object.create(DOMException.prototype);
    e.code = 18;
    try {
        e.name;
    } catch (err) {
        if (err.message === "Illegal operation on WrappedNative prototype object") {
            var pd = Object.getOwnPropertyDescriptor(DOMException.prototype, "name");
            var _getter = pd.get;
            pd.get = function () {
                try {
                    return _geter.call(this);
                } catch (e) {
                    return domShim.getters.DOMException.name.get.call(this);
                }
            };
            Object.defineProperty(DOMException.prototype, "name", pd);
        }
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
// Firefox also says no
// Safari says me too, me too!
(function () {
    try {
        new Event("click");
    } catch (e) {
        if (e.message === "Illegal constructor" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support this property or method" ||
            e.message === "Event is not a constructor" ||
            e.message === "'[object EventConstructor]' is not a constructor (evaluating 'new Event(\"click\")')"
        ) {
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
// Firefox agrees this cannot be done
// Safari says lul wut?
(function () {
    try {
        var c = new CustomEvent("magic");
    } catch (e) {
        if (e.type === "illegal_invocation" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support property or method 'initEvent'" ||
            e.message === "CustomEvent is not a constructor" ||
            e.message === "Type error"
        ) {
            var proto = CustomEvent.prototype;
            window.CustomEvent = function () {
                var e = document.createEvent("CustomEvent");
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

// IE9 thinks the argument is not optional
// FF thinks the argument is not optional
(function () {
    var e = document.createElement("div");
    try {
        document.importNode(e);
    } catch (e) {
        if (e.message === "Argument not optional" ||
            e.message === "Not enough arguments"    
        ) {
            var importNode = document.importNode;
            document.importNode = function (node, bool) {
                if (bool === undefined) {
                    bool = true;
                }
                return importNode.call(this, node, bool);
            }
        }
    }
})();

// IE8 can't write to ownerDocument
(function () {
    var el = document.createElement("div");
    try {
        el.ownerDocument = 42;
    } catch (e) {
        // IE8 Srs? Whitespace in error messages. FFFFFFFFFFFF
        if (e.message === "Member not found.\r\n") {
            var pd = Object.getOwnPropertyDescriptor(Element.prototype, "ownerDocument");
            var ownerDocument = pd.get;
            Object.defineProperty(Element.prototype, "ownerDocument", {
                get: function () {
                    if (this._ownerDocument) {
                        return this._ownerDocument;
                    } else {
                        return ownerDocument.call(this);
                    }
                },
                set: function (v) {
                    this._ownerDocument = v;
                },
                configurable: true
            });
        }
    }
})();