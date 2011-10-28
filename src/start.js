domShim.utils = {};
domShim.props = {};
domShim.getters = {};
domShim.common = {};


domShim.utils.recursivelyWalk = function recursivelyWalk(nodes, cb) {
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var ret = cb(node);
        if (ret) {
            return ret;
        }
        if (node.childNodes && node.childNodes.length > 0) {
            var ret = recursivelyWalk(node.childNodes, cb);
            if (ret) {
                return ret;
            }
        }
    }
};

domShim.utils.throwDOMException = function throwDOMException(code) {
    var ex = Object.create(domShim.DOMException.prototype);
    ex.code = code;
    throw ex;
};

domShim.utils.addGetterToProto = (function () {
    var getterBlackListForIE = {
        nodeType: true,
        nodeName: true
    };    

    function addGetterToProtoForEach(props, proto, name) {
        var hasProperty = false,
            value = props[name];
        try {
            hasProperty = proto[name];
        } catch (e) {
            // IE9 throws errors
            hasProperty = proto.hasOwnProperty(name);
        }
        if (!hasProperty || value.force) {
            var obj = {
                enumerable: true,
                configurable: true
            };
            if (value.get) {
                obj.get = value.get;
            }
            if (value.set) {
                obj.set = value.set;
            }
            try {
                Object.defineProperty(proto, name, obj);    
            } catch (e) {
                // IE8 FFFFFFFFFFFFFFFFFFFFF
                delete obj.enumerable;
            }
            try {
                Object.defineProperty(proto, name, obj);
            } catch (e) {
                // IE8 this must be non-host object.
            }
            
        }
    }

    return function addGetterToProto(props, proto) {
        Object.keys(props).forEach(function _each(name) {
            // fix for IE8
            if (proto === domShim.Node.prototype && !getterBlackListForIE[name]) {
                // Fix docfrags
                if (domShim.HTMLEls.HTMLDocument && 
                    !domShim.HTMLEls.HTMLDocument.prototype.constructor
                ) {
                    addGetterToProtoForEach(
                        props, domShim.HTMLEls.HTMLDocument.prototype, name);
                }
                // fix text
                addGetterToProtoForEach(props, domShim.Text.prototype, name);
            }
            addGetterToProtoForEach(props, proto, name);
        });
    }
})();

domShim.utils.addPropsToProto = (function () {

    function addPropsToProtoForEach(props, proto, name) {
        var value = props[name];
        var has = false;
        try {
            has = proto[name];
        } catch (e) {
            // IE9 throws errors
            has = proto.hasOwnProperty(name);
        }
        if (!has || value.force) {
            var obj = {
                configurable: true,
                enumerable: true,
                writable: true
            };

            if (value.hasOwnProperty("value")) {
                obj.value = value.value;
            }
            if (value.hasOwnProperty("writable")) {
                obj.writable = value.writable;
            }
            try {
                Object.defineProperty(proto, name, obj);    
            } catch (e) {
                if (e.type === "redefine_disallowed") {
                    // Chrome says no. Try writing to it
                    proto[name] = obj.value;
                } else {
                    console.log(e);
                    // IE8 FFFFFFFFFFFFFFFFFFFFFFFFFFFF
                    delete obj.enumerable;    
                }
            }
            try {
                Object.defineProperty(proto, name, obj);
            } catch (e) {
                // IE8 this must be non-host object.
            }
        }
    }

    return function addPropsToProto(props, proto) {
        Object.keys(props).forEach(function _each(name) {
            // fix for IE8
            if (proto === domShim.Node.prototype) {
                // Fix docfrags
                if (domShim.HTMLEls.HTMLDocument && 
                    !domShim.HTMLEls.HTMLDocument.prototype.constructor
                ) {
                    addPropsToProtoForEach(
                        props, domShim.HTMLEls.HTMLDocument.prototype, name);
                }
                // fix text
                addPropsToProtoForEach(props, domShim.Text.prototype, name);
            }
            addPropsToProtoForEach(props, proto, name);
        });
    };

})();

domShim.utils.addConstsToObject = function addConstsToObject(consts, object) {
    Object.keys(consts).forEach(function _each(name) {
        var value = consts[name];
        if (!object[name]) {
            try {
                Object.defineProperty(object, name, {
                    value: value,
                    configurable: true,
                    enumerable: true
                }); 
            } catch (e) {
                // IE8 fails because Node is Object
                object[name] = value;
            }
        }
    });
};

(function () {

    var shimConstructor = {
        "CustomEvent": true,
        "Event": true
    };

    var interfaces = [
        "CharacterData", "Comment", "CustomEvent", "Document", "DocumentFragment", 
        "DocumentType", "DOMException", "DOMImplementation", "Element",
        "Event", "EventTarget", "Node", "ProcessingInstruction", "Text",
        "Window"
    ];

    // Extract each interface from window and either shim the constructor
    // or default the constructor

    interfaces.forEach(function (name) {
        var constructor = window[name];
        var proto = constructor && constructor.prototype;

        if (shimConstructor[name]) {
            constructor || (constructor = function () {
                domShim["_" + name].apply(this, arguments);
            });
        } else {
            constructor || (constructor = function () {});
        }

        domShim[name] = constructor;
        domShim["proto"+name] = proto;
    });

    // The rest depend on these three



    domShim.protoNode || 
        (domShim.protoNode = domShim.protoElement);

    domShim.protoCharacterData || 
        (domShim.protoCharacterData = Object.create(domShim.protoNode));

    domShim.protoEvent || (domShim.protoEvent = {});

    var shimPrototypes = {
        "Comment": Object.create(domShim.protoCharacterData),
        "CustomEvent": Object.create(domShim.protoEvent),
        // IE8 needs HTMLDocument for proper inheritance
        "Document": window.HTMLDocument && window.HTMLDocument.prototype,
        "DocumentFragment": Object.create(domShim.protoNode),
        "DocumentType": Object.create(domShim.protoNode),
        "DOMException": {},
        "DOMImplementation": {},
        "Element": {}, // If Element doesn't exist we are doomed.
        "EventTarget": domShim.protoNode,
        "ProcessingInstruction": Object.create(domShim.protoCharacterData),
        "Text": Object.create(domShim.protoCharacterData),
        "Window": {}
    };

    // Set default prototype values
    Object.keys(shimPrototypes).forEach(function (key) {
        var proto = domShim["proto"+key];
        proto || (domShim["proto"+key] = shimPrototypes[key]);
    });

    var HTMLNames = [
        "HTMLDocument", "HTMLLinkElement", "HTMLElement", "HTMLHtmlElement", 
        "HTMLDivElement", "HTMLAnchorElement", "HTMLSelectElement", 
        "HTMLOptionElement", "HTMLInputElement", "HTMLHeadElement", 
        "HTMLSpanElement", "XULElement", "HTMLBodyElement", "HTMLTableElement", 
        "HTMLTableCellElement", "HTMLTextAreaElement", "HTMLScriptElement", 
        "HTMLAudioElement", "HTMLMediaElement", "HTMLParagraphElement", 
        "HTMLButtonElement", "HTMLLIElement", "HTMLUListElement", 
        "HTMLFormElement", "HTMLHeadingElement", "HTMLImageElement", 
        "HTMLStyleElement", "HTMLTableRowElement", "HTMLTableSectionElement", 
        "HTMLBRElement"
    ];

    domShim.HTMLEls = {};

    HTMLNames.forEach(function (name) {
        domShim.HTMLEls[name] = window[name];
    });

    // punch them back into the window
    interfaces.forEach(function (name) {
        var constructor = domShim[name],
            proto = domShim["proto"+name];

        if (constructor.prototype !== proto) {
            constructor.prototype = proto;
        }
        if (proto.constructor !== constructor) {
            proto.constructor = constructor;
        }
        window[name] = constructor;
        delete domShim["proto"+name];
    });
    
})();

