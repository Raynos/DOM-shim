;(function (window, document, domShim, undefined) { 

;(function () { 
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

domShim.common._clone = function _clone(node, document, deep) {
    document = document || node.ownerDocument;
    var copy;
    if (node.nodeType === Node.ELEMENT_NODE) {
        var namespace = node.nodeName;
        if (node.prefix) {
            namespace = node.prefix + ":" + namespace;
        }
        copy = document.createElementNS(node.namespaceURI, namespace);
        for (var i = 0, len = node.attributes.length; i < len; i++) {
            var attr = node.attributes[i];
            copy.setAttribute(attr.name, attr.value);
        }
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
        copy = document.implementation.createDocument("", "", null);
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        copy = document.createDocumentFragment();
    } else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        copy = document.implementation.createDocumentType(node.name, node.publicId, node.systemId);
    } else if (node.nodeType === Node.COMMENT_NODE) {
        copy = document.createComment(node.data);
    } else if (node.nodeType === Node.TEXT_NODE) {
        copy = document.createTextNode(node.data);
    } else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        copy = document.createProcessingInstruction(node.target, node.data);
    }
    // TODO: other cloning steps from other specifications
    if (deep) {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; i++) {
            copy.appendChild(children[i].cloneNode(node, document, deep));
        }
    }
    return copy;
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

    domShim.interfaces = [
        "CharacterData", "Comment", "CustomEvent", "Document", "DocumentFragment", 
        "DocumentType", "DOMException", "DOMImplementation", "Element",
        "Event", "EventTarget", "Node", "ProcessingInstruction", "Text",
        "Window"
    ];

    // Extract each interface from window and either shim the constructor
    // or default the constructor

    domShim.interfaces.forEach(function (name) {
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

    var ev, cev;
    try {
        ev = document.createEvent("Event");
        cev = document.createEvent("CustomEvent");
    } catch (e) {
        // IE8 says lol no.
        ev = cev = document.createEventObject();
    }

    domShim.protoNode || 
        (domShim.protoNode = domShim.protoElement);

    domShim.protoCharacterData || 
        (domShim.protoCharacterData = Object.create(domShim.protoNode));

    domShim.protoEvent || 
        (domShim.protoEvent = Object.getPrototypeOf(ev));

    var shimPrototypes = {
        "Comment": Object.create(domShim.protoCharacterData),
        "CustomEvent": Object.getPrototypeOf(cev),
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
    domShim.interfaces.forEach(function (name) {
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


})(); 

;(function () { 
domShim._CustomEvent = function (type, dict) {
    dict = dict || {};
    dict.detail = dict.detail || null;
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    if (this.initCustomEvent) {
        this.initCustomEvent(type, dict.bubbles, dict.catchable, dict.detail);
    } else {
        this.initEvent(type, dict.bubbles, dict.catchable);
        this.detail = dict.detail;
    }
}
})(); 

domShim.getters.Document = {}; 

;(function () { 
function _getDocType() {
    // TODO: remove assumption that DOCTYPE is the first node
    return this.childNodes[0];
}

domShim.getters.Document.doctype = {
    get: _getDocType
};
})(); 

domShim.utils.addGetterToProto(domShim.getters.Document, domShim.Document.prototype); 

domShim.props.Document = {}; 

;(function () { 
var _clone = domShim.common._clone,
    throwDOMException = domShim.utils.throwDOMException;

function _importNode(node, deep) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    if (deep === undefined) {
        deep = true;
    }
    var clone = _clone(node, this, deep);
    return clone;
}

domShim.props.Document.importNode = {
    value: _importNode
};
})(); 

;(function () { 
function _getElementsByClassName(clas) {
    // TODO: Use real algorithm defined in DOM4
    var arr = [];
    domShim.utils.recursivelyWalk(document.childNodes, function (el) {
        var cname = el.className;
        cname = " " + cname + " ";
        if (cname.indexOf(" " + clas + " ") > -1) {
            arr.push(el);
        }
    });
    return arr;
};

domShim.props.Document.getElementsByClassName = {
    value: _getElementsByClassName
};
})(); 

;(function () { 
function _createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
    return Object.create(Event.prototype);
}

domShim.props.Document.createEvent = {
    value: _createEvent
};
})(); 

;(function () { 
throwDOMException = domShim.utils.throwDOMException;

function _createElementNS(namespace, name) {
    var prefix, localName;

    if (namespace === "") {
        namespace = null;
    }
    // TODO: check the Name production
    // TODO: check the QName production
    if (name.indexOf(":") > -1) {
        var split = name.split(":");
        prefix = split[0];
        localName = split[1];
    } else {
        prefix = null;
        localName = name;
    }
    if (prefix === "" || prefix === "undefined") {
        prefix = null;
    }
    if ((prefix !== null && namespace === null) ||
        (
            prefix === "xml" &&
            namespace !== "http://www.w3.org/XML/1998/namespace"    
        ) ||
        (
            (name === "xmlns" || prefix === "xmlns") &&
            namespace !== "http://www.w3.org/2000/xmlns/"    
        ) ||
        (
            namespace === "http://www.w3.org/2000/xmlns/" &&
            (name !== "xmlns" && prefix !== "xmlns")
        )
    ) {
        throwDOMException(DOMException.NAMESPACE_ERR);
    }
    var el = this.createElement(localName);
    el.namespaceURI = namespace;
    el.prefix = prefix;
    return el;
}

domShim.props.Document.createElementNS = {
    value: _createElementNS
};
})(); 

;(function () { 
var recursivelyWalk = domShim.utils.recursivelyWalk,
    throwDOMException = domShim.utils.throwDOMException

function _adopt(node, doc) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        // TODO: base URL change
    }
    if (node.parentNode !== null) {
        node.parentNode.removeChild(node);
    }
    recursivelyWalk([node], function (node) {
        node.ownerDocument = doc;
    });
}

function _adoptNode(node) {
    if (node.nodeType === Node.DOCUMENT_NODE) {
        throwDOMException(DOMException.NOT_SUPPORTED_ERR);
    }
    _adopt(node, this);
    return node;
}


domShim.props.Document.adoptNode = {
    value: _adoptNode
};
})(); 

domShim.utils.addPropsToProto(domShim.props.Document, domShim.Document.prototype); 

;(function () { 
var domExceptionConsts = {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2, // historical
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6, // historical
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10, // historical
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16, // historical
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25
};

domShim.utils.addConstsToObject(domExceptionConsts, domShim.DOMException);
})(); 

domShim.getters.DOMException = {}; 

;(function () { 
var domExceptionNames = [
    undefined,
    "INDEX_SIZE_ERR",
    "DOMSTRING_SIZE_ERR",
    "HIERARCHY_REQUEST_ERR",
    "WRONG_DOCUMENT_ERR",
    "INVALID_CHARACTER_ERR",
    "NO_DATA_ALLOWED_ERR",
    "NO_MODIFICATION_ALLOWED_ERR",
    "NOT_FOUND_ERR",
    "NOT_SUPPORTED_ERR",
    "INUSE_ATTRIBUTE_ERR",
    "INVALID_STATE_ERR",
    "SYNTAX_ERR",
    "INVALID_MODIFICATION_ERR",
    "NAMESPACE_ERR",
    "INVALID_ACCESS_ERR",
    "VALIDATION_ERR",
    "TYPE_MISMATCH_ERR",
    "SECURITY_ERR",
    "NETWORK_ERR",
    "ABORT_ERR",
    "URL_MISMATCH_ERR",
    "QUOTA_EXCEEDED_ERR",
    "TIMEOUT_ERR",
    "INVALID_NODE_TYPE_ERR",
    "DATA_CLONE_ERR",
];

function _getDOMExceptionName() {
    return domExceptionNames[this.code];
}

domShim.getters.DOMException.name = {
    get: _getDOMExceptionName
};
})(); 

domShim.utils.addGetterToProto(domShim.getters.DOMException, domShim.DOMException.prototype); 

domShim.props.DOMImplementation = {}; 

;(function () { 
function _createDocumentType(qualifiedName, publicId, systemId) {
    var o = Object.create(DocumentType.prototype);
    o.name = qualifiedName;
    o.publicId = publicId;
    o.systemId = systemId;
    o.ownerDocument = document;
    return o;
}

domShim.props.DOMImplementation.createDocumentType = {
    value: _createDocumentType
};
})(); 

domShim.utils.addPropsToProto(domShim.props.DOMImplementation, domShim.DOMImplementation.prototype); 

domShim.getters.Element = {}; 

;(function () { 
function _getPreviousElementSibling() {
    var el = this;
    do {
        el = el.previousSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}

domShim.getters.Element.previousElementSibling = {
    get: _getPreviousElementSibling
};
})(); 

;(function () { 
function _getNextElementSibling() {
    var el = this;
    do {
        var el = el.nextSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}

domShim.getters.Element.nextElementSibling = {
    get: _getNextElementSibling
};
})(); 

;(function () { 
function _getLastElementChild() {
    var nodes = this.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

domShim.getters.Element.lastElementChild = {
    get: _getLastElementChild
};
})(); 

;(function () { 
function _getFirstElementChild() {
    var nodes = this.childNodes;
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

domShim.getters.Element.firstElementChild = {
    get: _getFirstElementChild
};
})(); 

;(function () { 
var throwDOMException = domShim.utils.throwDOMException;

function DOMTokenList(getter, setter) {
    this._getString = getter;
    this._setString = setter;
    _fixIndex(this, getter().split(" "));
}

function _fixIndex(clist, list) {
    for (var i = 0, len = list.length; i < len; i++) {
        clist[i] = list[i];
    }
    delete clist[len];
}

function _handleErrors(token) {
    if (token === "") {
        throwDOMException(DOMException.SYNTAX_ERR);
    }
    // TODO: test real space chacters
    if (token.indexOf(" ") > -1) {
        throwDOMException(DOMException.INVALID_CHARACTER_ERR);
    }
}

function _getList(clist) {
    var str = clist._getString();
    if (str === "") {
        return [];
    } else {
        return str.split(" ");
    }
}

Object.defineProperties(DOMTokenList.prototype, {
    item: {
        value: function (index) {
            if (index >= this.length) {
                return null;
            }
            return this._getString().split(" ")[index];
        }
    },
    contains: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            return list.indexOf(token) > -1;
        }
    },
    add: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            if (list.indexOf(token) > -1) {
                return;
            }
            list.push(token);
            this._setString(list.join(" ").trim());
            _fixIndex(this, list);
        }
    },
    remove: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            var index = list.indexOf(token);
            if (index > -1) {
                list.splice(index, 1);
                this._setString(list.join(" ").trim());
            }
            _fixIndex(this, list);
        }
    },
    toggle: {
        value: function (token) {
            if (this.contains(token)) {
                this.remove(token);
                return false;
            } else {
                this.add(token);
                return true;
            }
        }
    },
    toString: {
        value: function () {
            return this._getString();
        }
    }
});

try {
    Object.defineProperty(DOMTokenList.prototype, "length", {
        get: function () {
            return this._getString().split(" ").length;   
        }
    })
} catch (e) {
    if (e.message === "getters & setters can not be defined on this javascript engine") {
        // IE8 says no getters!
    } else {
        console.log(e);
    }
}

function _getClassList(el) {
   if (this._classList) {
       return this._classList;
   } else {
       return new DOMTokenList(
            function _getClassName() {
                return el.className || "";
            },
            function _setClassName(v) {
                el.className = v;
            }
       );
   }
}

domShim.getters.Element.classList = {
    get: function () {
        return _getClassList(this);
    }
}
})(); 

;(function () { 
function _getChildElementCount() {
    return this.children.length;
}

domShim.getters.Element.childElementCount = {
    get: _getChildElementCount
}
})(); 

domShim.utils.addGetterToProto(domShim.getters.Element, domShim.Element.prototype); 

domShim.props.Element = {}; 

;(function () { 
var recursivelyWalk = domShim.utils.recursivelyWalk;

// TODO: use real algorithm
function _getElementsByClassName(clas) {
    var ar = [];
    recursivelyWalk(this.childNodes, function (el) {
        if (el.classList.contains(clas)) {
            ar.push(el);
        }
    });
    return ar;
}

domShim.props.Element.getElementsByClassName = {
    value: _getElementsByClassName
};
})(); 

domShim.utils.addPropsToProto(domShim.props.Element, domShim.Element.prototype); 

;(function () { 
domShim._Event = function (type, dict) {
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    this.initEvent(type, dict.bubbles, dict.catchable);
};
})(); 

;(function () { 
var eventConsts = {
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3
};

domShim.utils.addConstsToObject(eventConsts, domShim.Event.prototype);
})(); 

domShim.props.Event = {}; 

;(function () { 
function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

domShim.props.Event.initEvent = {
    value: _initEvent  
};
})(); 

domShim.utils.addPropsToProto(domShim.props.Event, domShim.Event.prototype); 

;(function () { 
domShim.common.EventTarget = {};
})(); 

domShim.props.EventTarget = {}; 

;(function () { 
domShim.common.EventTarget.eventListeners = [];
})(); 

;(function () { 
var eventListeners = domShim.common.EventTarget.eventListeners;

function _removeEventListener(type, listener, capture) {
    if (this.detachEvent) {
        for (var i = 0, len = eventListeners.length; i < len; i++) {
            var triplet = eventListeners[i];
            if (triplet[1] === listener && triplet[0] === type) {
                this.detachEvent("on" + type, triplet[2]);
                eventListeners.splice(i, 1);
                break;
            }
        }
    }
}

domShim.props.EventTarget.removeEventListener = {
    value: _removeEventListener
};
})(); 

;(function () { 
var eventListeners = domShim.common.EventTarget.eventListeners;

function _dispatchEvent(ev) {
    function handler(event) {
        if (event.propertyName === "domShim") {
            eventListeners.forEach(function (tuple) {
                if (tuple[0] === ev.type) {
                    tuple[1].call(this, ev);
                }
            });
            that.detachEvent("onpropertychange", handler);
        }
    }

    if (this.fireEvent) {
        var ret;
        try {
            ret = this.fireEvent("on" + ev.type);
        } catch (e) {
            // IE8 fireEvent on custom property fails
            if (e.message === "Invalid argument.") {
                var that = this;
                // IE8 does not work with document & propertychange
                if (that === document) {
                    that = document.documentElement;
                }
                that.attachEvent("onpropertychange", handler);
                that.domShim = 42;
            // IE8 says no if its not in the DOM.
            } else if (e.message === "Unspecified error.") {
                document.body.appendChild(this);
                this.dispatchEvent(ev);
                document.body.removeChild(this);
            }
        }
        return ret;
    }
}

domShim.props.EventTarget.dispatchEvent = {
    value: _dispatchEvent
};
})(); 

;(function () { 
var eventListeners = domShim.common.EventTarget.eventListeners;

function _addEventListener(type, listener, capture) {
    if (this.attachEvent) {
        var cb = function (event) {
            listener.call(this, event);
        };
        eventListeners.push([type, listener, cb]);
        this.attachEvent("on" + type, cb);
    }
}

domShim.props.EventTarget.addEventListener = {
    value: _addEventListener
};
})(); 

domShim.utils.addPropsToProto(domShim.props.EventTarget, domShim.EventTarget.prototype); 

;(function () { 
domShim.common.Node = {};
})(); 

;(function () { 
var nodeConsts = {
    "ELEMENT_NODE": 1,
    "ATTRIBUTE_NODE": 2,
    "TEXT_NODE": 3,
    "CDATA_SECTION_NODE": 4,
    "ENTITY_REFERENCE_NODE": 5,
    "ENTITY_NODE": 6,
    "PROCESSING_INSTRUCTION_NODE": 7,
    "COMMENT_NODE": 8,
    "DOCUMENT_NODE": 9,
    "DOCUMENT_TYPE_NODE": 10,
    "DOCUMENT_FRAGMENT_NODE": 11,
    "NOTATION_NODE": 12,
    "DOCUMENT_POSITION_DISCONNECTED": 0x01,
    "DOCUMENT_POSITION_PRECEDING": 0x02,
    "DOCUMENT_POSITION_FOLLOWING": 0x04,
    "DOCUMENT_POSITION_CONTAINS": 0x08,
    "DOCUMENT_POSITION_CONTAINED_BY": 0x10,
    "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC": 0x20
};

domShim.utils.addConstsToObject(nodeConsts, domShim.Node);
})(); 

domShim.getters.Node = {}; 

;(function () { 
domShim.common.Node._replaceData = function _replaceData(node, offset, count, data) {
    var length = node.length;
    var oldData = node.data;
    if (offset > length) {
        throwDOMException(DOMException.INDEX_SIZE_ERR);
    }
    if (offset + count > length) {
        count = length - offset;
    }
    var before = oldData.substring(offset);
    before += data;
    var after = oldData.substring(offset + count);
    before += after;
    node.data = before;
    // TODO: Fix ranges offset pointers
};
})(); 

;(function () { 
var _replaceData = domShim.common.Node._replaceData,
    recursivelyWalk = domShim.utils.recursivelyWalk;

function _getTextContent() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        var data = "";
        recursivelyWalk(this.childNodes, function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                data += node.data;
            }
        });
        return data;
    }
    return null;
}

function _setTextContent(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    } else if (this.nodeType === Node.ELEMENT_NODE || 
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        for (var i = 0, len = this.childNodes.length; i < len; i++) {
            this.removeChild(this.childNodes[i]);
        }
        if (value.length > 0) {
            var txt = document.createTextNode(value);
            this.appendChild(txt);
        }
    }
}

domShim.getters.Node.textContent = {
    get: _getTextContent,
    set: _setTextContent
};
})(); 

;(function () { 
function _getPreviousSibling() {
    var parent = this.parentNode,
        siblings = parent.childNodes;

    for (var i = 0, len = siblings.length; i < len; i++) {
        var node = siblings[i];
        if (node === this) {
            return siblings[i-1] || null;
        }
    }
}

domShim.getters.Node.previousSibling = {
    get: _getPreviousSibling
};
})(); 

;(function () { 
function _getParentElement() {
    var parent = this.parentNode;
    if (parent == null) {
        return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent;
    }
    return null;
}

domShim.getters.Node.parentElement = {
    get: _getParentElement
};
})(); 

;(function () { 
var _replaceData = domShim.common.Node._replaceData;

function _getNodeValue() {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        return this.data;
    }
    return null;
}

function _setNodeValue(value) {
    var condition = this.nodeType === Node.TEXT_NODE || 
        this.nodeType === Node.COMMENT_NODE || 
        this.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
    if (condition) {
        _replaceData(this, 0, value.length, value);
    }
}

domShim.getters.Node.nodeValue = {
    get: _getNodeValue,
    set: _setNodeValue
};
})(); 

;(function () { 
function _getNodeType() {
    if (this instanceof Element) {
        return Node.ELEMENT_NODE;
    } else if (this instanceof Text) {
        return Node.TEXT_NODE;
    } else if (this instanceof ProcessingInstruction) {
        return Node.PROCESSING_INSTRUCTION_NODE;
    } else if (this instanceof Comment) {
        return Node.COMMENT_NODE;
    } else if (this instanceof Document) {
        return Node.DOCUMENT_NODE;
    } else if (this instanceof DocumentType) {
        return Node.DOCUMENT_TYPE_NODE;
    } else if (this instanceof DocumentFragment) {
        return Node.DOCUMENT_FRAGMENT_NODE;
    } 
}

domShim.getters.Node.nodeType = {
    "nodeType": {
        get: _getNodeType
    }
};
})(); 

;(function () { 
function _getNodeName() {
    if (this.nodeType === Node.ELEMENT_NODE) {
        return this.tagName;
    } else if (this.nodeType === Node.TEXT_NODE) {
        return "#text";
    } else if (this.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        return this.target
    } else if (this.nodeType === Node.COMMENT_NODE) {
        return "#comment";
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return "#document";
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE) {
        return this.name;
    } else if (this.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        return "#document-fragment";
    }
}

domShim.getters.Node.nodeName = {
    get: _getNodeName  
};
})(); 

;(function () { 
function _getNextSibling() {
    var parent = this.parentNode,
        siblings = parent.childNodes;

    for (var i = 0, len = siblings.length; i < len; i++) {
        var node = siblings[i];
        if (node === this) {
            return siblings[i+1] || null;
        }
    }
}

domShim.getters.Node.nextSibling = {
    get: _getNextSibling
};
})(); 

;(function () { 
function _getLastChild() {
    var children = this.childNodes,
        lastChild = children && children[children.length -1];

    return lastChild || null;
}

domShim.getters.Node.lastChild = {
    get: _getLastChild
};
})(); 

;(function () { 
function _getFirstChild() {
    var children = this.childNodes,
        firstChild = children && children[0];

    return firstChild || null;
}

domShim.getters.Node.firstChild = {
    get: _getFirstChild
};
})(); 

domShim.utils.addGetterToProto(domShim.getters.Node, domShim.Node.prototype); 

domShim.props.Node = {}; 

;(function () { 
function _isEqualNode(node) {
    if (node === null) {
        return false;
    }
    if (node.nodeType !== this.nodeType) {
        return false;
    }
    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        if (this.name !== node.name ||
            this.publicId !== node.publicId ||
            this.systemId !== node.systemId 
        ) {
            return false;
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (this.namespaceURI != node.namespaceURI ||
            this.prefix != node.prefix ||
            this.localName != node.localName
        ) {
            return false;
        }
        for (var i = 0, len = this.attributes.length; i < len; i++) {
            var attr = this.attributes[length];
            var nodeAttr = node.getAttributeNS(attr.namespaceURI, attr.localName);
            if (nodeAttr === null || nodeAttr.value !== attr.value) {
                return false;
            }
        }
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        if (this.target !== node.target || this.data !== node.data) {
            return false;       
        }   
    }
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
        if (this.data !== node.data) {
            return false;
        }
    }
    if (node.childNodes.length !== this.childNodes.length) {
        return false;
    }
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
        var isEqual = node.childNodes[i].isEqualNode(this.childNodes[i]);
        if (isEqual === false) {
            return false;
        }
    }
    return true;
}

domShim.props.Node.isEqualNode = {
    value: _isEqualNode
};
})(); 

;(function () { 

function _replaceDocument(child, node, parent) {
    if (node.nodeType === Node.TEXT_NODE ||
        node.nodeType === Node.DOCUMENT_NODE
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        if (node.childNodes.length > 1 ||
            (node.firstChild && 
            node.firstChild.nodeType === Node.TEXT_NODE) 
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = 0, len = children.length; i < len; i++) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === ELEMENT_NODE && !el.isSameNode(child)) &&
                (el.nodeType === DOCUMENT_TYPE_NODE && i > pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        var children = parent.childNodes;
        var pos = 0;
        for (var i = children.length - 1; i >= 0; i--) {
            var el = children[i];
            if (el.isSameNode(child)) {
                pos = i;
            }
            if ((el.nodeType === DOCUMENT_TYPE_NODE && 
                !el.isSameNode(child)) &&
                (el.nodeType === ELEMENT_NODE && i < pos)
            ) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _replace(child, node, parent) {
    if (!child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (node.isSameNode(parentOfParent)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parentOfParent.parentNode;
    } while (parentOfParent !== null)

    if (!(parent.nodeType === Node.DOCUMENT_NODE ||
        parent.nodeType === Node.ELEMENT_NODE ||
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        _replaceDocument(child, node, parent);
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) && 
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    parent.ownerDocument.adoptNode(node);
    var ref = child.nextSibling;
    _remove(child, parent);
    _insertBefore(node, parent, ref);
    return child;
}

function _replaceChild(node, child) {
    return _replace(child, node, this);
}

domShim.props.Node.replaceChild = {
    value: _replaceChild
};
})(); 

;(function () { 
function _isSameNode(node) {
    return this === node;
}

domShim.props.Node.isSameNode = {
    value: _isSameNode
};
})(); 

;(function () { 
function _appendChild(node) {
    return this.insertBefore(node, null);
}

domShim.props.Node.appendChild = {
    value: _appendChild
};
})(); 

;(function () { 
function _testNodeForComparePosition(node, other) {
    if (node.isSameNode(other)) {
        return true;
    }
}

function _compareDocumentPosition(other) {
    function _identifyWhichIsFirst(node) {
        if (node.isSameNode(other)) {
            return "other";
        } else if (node.isSameNode(reference)) {
            return "reference";
        }
    }

    var reference = this,
        referenceTop = this,
        otherTop = other;

    if (this.isSameNode(other)) {
        return 0;
    }
    while (referenceTop.parentNode) {
        referenceTop = referenceTop.parentNode;
    }
    while (otherTop.parentNode) {
        otherTop = otherTop.parentNode;
    }

    if (!referenceTop.isSameNode(otherTop)) {
        return Node.DOCUMENT_POSITION_DISCONNECTED;
    }

    var children = reference.childNodes;
    var ret = domShim.utils.recursivelyWalk(
        children,
        _testNodeForComparePosition.bind(null, other)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINED_BY +
            Node.DOCUMENT_POSITION_FOLLOWING;
    }

    var children = other.childNodes;
    var ret = domShim.utils.recursivelyWalk(
        children, 
        _testNodeForComparePosition.bind(null, reference)
    );
    if (ret) {
        return Node.DOCUMENT_POSITION_CONTAINS +
            Node.DOCUMENT_POSITION_PRECEDING;
    }

    var ret = domShim.utils.recursivelyWalk(
        [referenceTop],
        _identifyWhichIsFirst
    );
    if (ret === "other") {
        return Node.DOCUMENT_POSITION_PRECEDING;
    } else {
        return Node.DOCUMENT_POSITION_FOLLOWING;
    }
}


domShim.props.Node.compareDocumentPosition = {
    value: _compareDocumentPosition
};
})(); 

;(function () { 
function _preremove(node, parent) {
    if (!node.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    _remove(node, parent);
    return node;
}

function _remove(node, parent) {
    var found = false,
        children = parent.childNodes;

    // TODO: handle ranges

    for (var i = 0, len = children.length; i < len; i++) {
        if (children[i].isSameNode(nodes)) {
            found = true;
        }
        if (found) {
            children[i] = children[i+1];
        }
    }
    children.length = len - 1;
}

function _removeChild(child) {
    return _remove(child, node);
}

domShim.props.Node.removeChild = {
    value: _removeChild
};
})(); 

;(function () { 
domShim.props.Node.ownerDocument = {
    value: document,
    writable: false
};
})(); 

;(function () { 
function _locateNamespacePrefix(el, namespace) {
    if (el.namespaceURI === namespace) {
        if (el.prefix == null) {
            return null;
        }
        return el.prefix;
    }
    var attrs = el.attributes;
    for (var i = 0, len = attrs.length; i < len; i++) {
        var attr = attrs[i];
        if (attr.prefix === "xmlns" && attr.value === namespace) {
            return attr.localname;
        }
    }
    var parent = node.parentElement
    if (parent !== null) {
        return _locateNamespacePrefix(parent, namespace);
    }
    return null;
}

function _lookupPrefix(namespace) {
    if (namespace === null || namespace === "") {
        return null;
    }
    if (this.nodeType === Node.ELEMENT_NODE) {
        return _locateNamespacePrefix(this, namespace);
    } else if (this.nodeType === Node.DOCUMENT_NODE) {
        return _locateNamespacePrefix(this.documentElement, namespace);
    } else if (this.nodeType === Node.DOCUMENT_TYPE_NODE ||
        this.nodeType === Node.DOCUMENT_FRAGMENT_NODE
    ) {
        return null
    } else {
        var parent = this.parentElement;
        if (parent !== null) {
            return _locateNamespacePrefix(parent, namespace);
        }
        return null;
    }
}

domShim.props.Node.lookupPrefix = {
    value: _lookupPrefix
};
})(); 

;(function () { 
function _locateNamespace(node, prefix) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.namespaceURI !== null && node.prefix === prefix) {
            return node.namespaceURI;
        }
        var attrs = node.attributes;
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            if ((attr.prefix === "xmlns" && attr.localname === prefix) ||
                (attr.prefix === null && attr.localname === "xmlns")
            ) {
                return attr.value || null;
            }
        }
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix)
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
        var docElem = node.documentElement;
        if (docElem) {
            return _locateNamespace(docElem, prefix);
        }
        return null;
    } else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE
    ) {
        return null;
    } else {
        var parent = node.parentElement;
        if (parent !== null) {
            return _locateNamespace(parent, prefix);
        }
        return null;
    }
}

function _lookupNamespaceURI(prefix) {
    return _locateNamespace(this, prefix);
}

domShim.props.Node.lookupNamespaceURI = {
    value: _lookupNamespaceURI
};
})(); 

;(function () { 
function _contains(other) {
    var comparison = this.compareDocumentPosition(other);
    if (comparison === 0 || 
        comparison & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
        return true;
    }
    return false;
}

domShim.props.Node.contains = {
    value: _contains
};
})(); 

;(function () { 
var _clone = domShim.common._clone;

function _cloneNode(flag) {
    if (flag === undefined) {
        flag = true;
    }
    return _clone(this, undefined, flag);
}

domShim.props.Node.cloneNode = {
    value: _cloneNode
};
})(); 

;(function () { 
function _isDefaultNamespace(namespace) {
    if (namespace === "") {
        namespace = null;
    }
    var defaultNamespace = this.lookupNamespaceURI(null);
    return defaultNamespace === namespace;
}

domShim.props.Node.isDefaultNamespace = {
    value: _isDefaultNamespace
};
})(); 

;(function () { 
function _preInsertDocumentFragment (node, parent, child) {
    var hasEle = false;
    for (var i = 0, len = node.childNodes.length; i < len; i++) {
        var el = node.childNodes[i];
        if (el.nodeType === Node.TEXT_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        } else if (el.nodeType === Node.ELEMENT_NODE) {
            if (hasEle) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            } else {
                hasEle = true;
            }
        }
    }
}

function _preInsertElement(node, parent, child) {
    var children = parent.childNodes,
        pos = 0;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.ELEMENT_NODE && child === null) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            if (i > pos) {
                throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
            }
        }
    }
}

function _preInsertDocumentType(node, parent, child) {
    var children = parent.childNodes,
        pos = 0,
        firstEl = -1;

    for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el.nodeType === Node.DOCUMENT_TYPE_NODE) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (el.isSameNode(child)) {
            pos = i;
        }
        if (el.nodeType === Node.ELEMENT_NODE) {
            firstEl === -1 && (firstEl = i);
        }
    }
    if (firstEl < pos || child === null && firstEl > -1) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
}

function _preInsert(node, parent, child) {
    if (child && !child.parentNode.isSameNode(parent)) {
        throwDOMException(DOMException.NOT_FOUND_ERR);
    }
    var parentOfParent = parent;
    do {
        if (parentOfParent.isSameNode(node)) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        parentOfParent = parent.parentNode;
    } while (parentOfParent != null)

    var condition = parent.nodeType === Node.DOCUMENT_NODE || 
        parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE;
    if (!condition) {
        throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }

    if (parent.nodeType === Node.DOCUMENT_NODE) {
        if (node.nodeType === Node.TEXT_NODE || 
            node.nodeType === Node.DOCUMENT_NODE
        ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            _preInsertDocumentFragment(node, parent, child);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            _preInsertElement(node, parent, child);
            
        }
        if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
            _preInsertDocumentType(node, parent, child);
        }
    }
    if ((parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || 
        parent.nodeType === Node.ELEMENT_NODE) &&
        (node.nodeType === Node.DOCUMENT_NODE ||
        node.nodeType === Node.DOCUMENT_TYPE_NODE)
    ) {
            throwDOMException(DOMException.HIERARCHY_REQUEST_ERR);
    }
    parent.ownerDocument.adoptNode(node);
    _insert(node, parent, child);
    return child;
}

function _insert(node, parent, child) {
    var nodes = [node];
    if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        nodes = node.childNodes;
    }
    var count = nodes.length;
    var children = parent.childNodes;
    var len = children.length;
    // TODO: handle ranges
    
    if (child === null) {
        for (var j = 0; i < count; j++) {
            children[len + j] = nodes[j];
        }
    } else {
        for (var i = len - 1; i >= 0; i--) {
            var el = children[i];
            children[i + count] = el;
            if (el === child) {
                for (var j = 0; i < count; j++) {
                    children[i + j] = nodes[j];
                }
                break;
            }
        }   
    }
    
    children.length = len + count;
}

function _insertBefore(node, child) {
    return _preInsert(node, this, child);
}

domShim.props.Node.insertBefore = {
    value: _insertBefore
}
})(); 

;(function () { 
function _hasChildNodes() {
    if (this.firstChild || this.lastChild) {
        return true;
    }
    var children = this.childNodes;
    if (children && children.length > 0) {
        return true;
    }
    return false;
}

domShim.props.Node.hasChildNodes = {
    value: _hasChildNodes
};
})(); 

domShim.utils.addPropsToProto(domShim.props.Node, domShim.Node.prototype); 

;(function () { 
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

// Opera says DOMException.prototype.name is "DOMException".
// So punch it to read from code or from the proper getter
(function () {
    var e = Object.create(DOMException.prototype);
    e.code = 18;
    if (e.name === "DOMException") {
        var pd = {
            get: domShim.getters.DOMException.name.get,
            configurable: true
        };
        Object.defineProperty(DOMException.prototype, "name", pd);
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
                        return old.call(this, type, listener, optional);
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
// Opera throws a DOM exception instead ¬_¬
(function () {
    try {
        new Event("click");
    } catch (e) {
        if (e.message === "Illegal constructor" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support this property or method" ||
            e.message === "Event is not a constructor" ||
            e.message === "'[object EventConstructor]' is not a constructor (evaluating 'new Event(\"click\")')" ||
            e.message === "NOT_SUPPORTED_ERR"            
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
// Opera says have another DOM exception!
(function () {
    try {
        var c = new CustomEvent("magic");
    } catch (e) {
        if (e.type === "illegal_invocation" ||
            e.message === "Object doesn't support this action" ||
            e.message === "Object doesn't support property or method 'initEvent'" ||
            e.message === "CustomEvent is not a constructor" ||
            e.message === "Type error" ||
            e.message === "NOT_SUPPORTED_ERR"
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
// Opera agress that its not optional
(function () {
    var e = document.createElement("div");
    try {
        document.importNode(e);
    } catch (e) {
        if (e.number === -2147418113 ||//e.message === "Argument not optional" // IE returns the message in a local language that's why it doesn't work
            e.result === 2153185281 ||//e.message === "Not enough arguments" // FF
            e.code === 6//e.message === "WRONG_ARGUMENTS_ERR" // Opera
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
        //if (e.message === "Member not found.\r\n") { // IE returns the message in a local language that's why it doesn't work
		if (e.number === -2147352573) {
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

// Opera is funny about the "optional" parameter on addEventListener
(function () {
    var count = 0;
    var handler = function () {
        count++;
    }
    document.addEventListener("click", handler);
    var ev = new Event("click");
    document.dispatchEvent(ev);
    if (count === 0) {
        // fix opera
        var oldListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (ev, cb, optional) {
            optional = optional || false;
            return oldListener.call(this, ev, cb, optional);
        };
        // fix removeEventListener aswell
        var oldRemover = EventTarget.prototype.removeEventListener;
        EventTarget.prototype.removeEventListener = function (ev, cb, optional) {
            optional = optional || false;
            return oldRemover.call(this, ev, cb, optional);
        };
        // punch window.
        window.addEventListener = EventTarget.prototype.addEventListener;
        window.removeEventListener = EventTarget.prototype.removeEventListener;
    }
    document.removeEventListener("click", handler);
})();
})(); 
})(window, document, {}); 
