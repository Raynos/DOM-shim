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
            domShim.Node.prototype
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