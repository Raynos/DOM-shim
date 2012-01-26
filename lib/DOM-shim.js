(function(){
window.M8 = {data:{}};
(function(){
/**
 * modul8 v0.13.0
 */

var config    = {"namespace":"M8","domains":["app","shims","all","utils"],"arbiters":{},"logging":1}
  , ns        = window[config.namespace]
  , domains   = config.domains
  , arbiters  = []
  , exports   = {}
  , DomReg    = /^([\w]*)::/;

/**
 * Initialize the exports container with domain names + move data to it
 */
exports.M8 = {};
exports.external = {};
exports.data = ns.data;
delete ns.data;

domains.forEach(function(e){
  exports[e] = {};
});

/**
 * Attach arbiters to the require system then delete them from the global scope
 */
Object.keys(config.arbiters).forEach(function(name){
  var arbAry = config.arbiters[name];
  arbiters.push(name);
  exports.M8[name] = window[arbAry[0]];
  arbAry.forEach(function(e){
    delete window[e];
  });
});

/**
 * Converts a relative path to an absolute one
 */
function toAbsPath(pathName, relReqStr) {
  var folders = pathName.split('/').slice(0, -1);
  while (relReqStr.slice(0, 3) === '../') {
    folders = folders.slice(0, -1);
    relReqStr = relReqStr.slice(3);
  }
  return folders.concat(relReqStr.split('/')).join('/');
}

/**
 * Require Factory for ns.define
 * Each (domain,path) gets a specialized require function from this
 */
function makeRequire(dom, pathName) {
  return function(reqStr) {
    var o, scannable, k, skipFolder;

    if (config.logging >= 4) {
      console.debug('modul8: '+dom+':'+pathName+" <- "+reqStr);
    }

    if (reqStr.slice(0, 2) === './') {
      scannable = [dom];
      reqStr = toAbsPath(pathName, reqStr.slice(2));
    }
    else if (reqStr.slice(0,3) === '../') {
      scannable = [dom];
      reqStr = toAbsPath(pathName, reqStr);
    }
    else if (DomReg.test(reqStr)) {
      scannable = [reqStr.match(DomReg)[1]];
      reqStr = reqStr.split('::')[1];
    }
    else if (arbiters.indexOf(reqStr) >= 0) {
      scannable = ['M8'];
    }
    else {
      scannable = [dom].concat(domains.filter(function(e) {return e !== dom;}));
    }

    reqStr = reqStr.split('.')[0];
    if (reqStr.slice(-1) === '/' || reqStr === '') {
      reqStr += 'index';
      skipFolder = true;
    }

    if (config.logging >= 3) {
      console.log('modul8: '+dom+':'+pathName+' <- '+reqStr);
    }
    if (config.logging >= 4) {
      console.debug('modul8: scanned '+JSON.stringify(scannable));
    }

    for (k = 0; k < scannable.length; k += 1) {
      o = scannable[k];
      if (exports[o][reqStr]) {
        return exports[o][reqStr];
      }
      if (!skipFolder && exports[o][reqStr + '/index']) {
        return exports[o][reqStr + '/index'];
      }
    }

    if (config.logging >= 1) {
      console.error("modul8: Unable to resolve require for: " + reqStr);
    }
  };
}

ns.define = function(name, domain, fn) {
  var module = {};
  fn(makeRequire(domain, name), module, exports[domain][name] = {});
  if (module.exports) {
    delete exports[domain][name];
    exports[domain][name] = module.exports;
  }
};

/**
 * Public Debug API
 */

ns.inspect = function(domain) {
  console.log(exports[domain]);
};

ns.domains = function() {
  return domains.concat(['external','data']);
};

ns.require = makeRequire('app', 'CONSOLE');

/**
 * Live Extension API
 */

ns.data = function(name, exported) {
  if (exports.data[name]) {
    delete exports.data[name];
  }
  if (exported) {
    exports.data[name] = exported;
  }
};

ns.external = function(name, exported) {
  if (exports.external[name]) {
    delete exports.external[name];
  }
  if (exported) {
    exports.external[name] = exported;
  }
};

})();

// shared code

M8.define('index','utils',function(require, module, exports){
var hasOwnProperty = Object.prototype.hasOwnProperty;


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

module.exports = {
	addShimToInterface: addShimToInterface,
	throwDOMException: throwDOMException,
	clone: clone,
    recursivelyWalk: recursivelyWalk,
	HTMLNames: HTMLNames
};

function recursivelyWalk(nodes, cb) {
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var ret = cb(node);
        if (ret) {
            return ret;
        }
        if (node.childNodes && node.childNodes.length) {
            var ret = recursivelyWalk(node.childNodes, cb);
            if (ret) {
                return ret;
            }
        }
    }
}

function throwDOMException(code) {
    var ex = Object.create(DOMException.prototype);
    ex.code = code;
    throw ex;
}

function addShimToInterface(shim, proto, constructor) {
	Object.keys(shim).forEach(function _eachShimProperty(name) {
		if (name === "constants") {
			var constants = shim[name];
			Object.keys(constants).forEach(function _eachConstant(name) {
				if (!hasOwnProperty.call(constructor, name)) {
					constructor[name] = constants[name];	
				}
			});
			return;
		}

		if (!hasOwnProperty.call(proto, name)) {
			var pd = shim[name];
			if (pd.value) {
				pd.writable = false;
			} else {
                
            }
			pd.configurable = true;
            pd.enumerable = false; 
			Object.defineProperty(proto, name, pd);	
		}
	});
}

function clone(node, document, deep) {
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
}
});
M8.define('interfaces/DOMTokenList','all',function(require, module, exports){
var utils = require("utils::index");

var throwDOMException = utils.throwDOMException;

module.exports = {
    constructor: DOMTokenList,
    item: item,
    contains: contains,
    add: add,
    remove: remove,
    toggle: toggle,
    toString: _toString
};

module.exports.constructor.prototype = module.exports;

function DOMTokenList(getter, setter) {
    this._getString = getter;
    this._setString = setter;
    fixIndex(this, getter().split(" "));
}

function fixIndex(clist, list) {
    for (var i = 0, len = list.length; i < len; i++) {
        clist[i] = list[i];
    }
    delete clist[len];
}

function handleErrors(token) {
    if (token === "" || token === undefined) {
        throwDOMException(DOMException.SYNTAX_ERR);
    }
    // TODO: test real space chacters
    if (token.indexOf(" ") > -1) {
        throwDOMException(DOMException.INVALID_CHARACTER_ERR);
    }
}

function getList(clist) {
    var str = clist._getString();
    if (str === "") {
        return [];
    } else {
        return str.split(" ");
    }
}

function item(index) {
    if (index >= this.length) {
        return null;
    }
    return this._getString().split(" ")[index];
}

function contains(token) {
    handleErrors(token);
    var list = getList(this);
    return list.indexOf(token) > -1;
}

function add(token) {
    handleErrors(token);
    var list = getList(this);
    if (list.indexOf(token) > -1) {
        return;
    }
    list.push(token);
    this._setString(list.join(" ").trim());
    fixIndex(this, list);
}

function remove(token) {
    handleErrors(token);
    var list = getList(this);
    var index = list.indexOf(token);
    if (index > -1) {
        list.splice(index, 1);
        this._setString(list.join(" ").trim());
    }
    fixIndex(this, list);
}

function toggle(token) {
    if (this.contains(token)) {
        this.remove(token);
        return false;
    } else {
        this.add(token);
        return true;
    }
}

function _toString() {
    return this._getString();
}
});

M8.define('interfaces/DOMSettableTokenList','all',function(require, module, exports){
var utils = require("utils::index"),
	DOMTokenList = require("interfaces/DOMTokenList").constructor;

module.exports = {
    constructor: DOMSettableTokenList
};

module.exports.constructor.prototype = module.exports;

function DOMSettableTokenList(getter, setter) {
	DOMTokenList.call(this, getter, setter);
}
;(function inherit(Child, Parent) {
	(Child.prototype = Object.create(Parent.prototype)).constructor = Child;
})(DOMSettableTokenList, DOMTokenList);

Object.defineProperty(DOMSettableTokenList.prototype, "value", {
	enumerable : true,
	get : function() {
		return this._getString()
	},
	set : function(newValue) {
		return this._setString(newValue)
	}
})

});

M8.define('interfaces/CustomEvent','shims',function(require, module, exports){
module.exports = {
	constructor: constructor,
    interface: window.Event
};

function constructor(type, dict) {
    var e = document.createEvent("CustomEvent");
    dict = dict || {};
    dict.detail = dict.detail || null;
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    if (e.initCustomEvent) {
        e.initCustomEvent(type, dict.bubbles, dict.catchable, dict.detail);
    } else {
        e.initEvent(type, dict.bubbles, dict.catchable);
        e.detail = dict.detail;
    }
    return e;
}
});
M8.define('interfaces/Element','shims',function(require, module, exports){
var DOMTokenList = require("all::interfaces/DOMTokenList").constructor;

module.exports = {
	parentElement: {
		get: getParentElement
	},
    classList: {
        get: getClassList
    }
}

function getParentElement() {
    var parent = this.parentNode;
    if (parent == null) {
        return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent;
    }
    return null;
}

function getClassList() {
    var el = this;

    if (this._classList) {
        return this._classList;
    } else {
        var dtlist = new DOMTokenList(
            function _getClassName() {
                return el.className || "";
            },
            function _setClassName(v) {
                el.className = v;
            }
        );
        this._classList = dtlist;
        return dtlist;
    }
}
});

M8.define('interfaces/HTMLLabelElement','shims',function(require, module, exports){
var recursivelyWalk = require(".../utils").recursivelyWalk;

module.exports = {
    interface: window.HTMLLabelElement || window.Element || window.Node,
	control: {
		get: getControl
	}
}
function getControl() {
	if(this.getAttribute("for") !== null)//hasAttribute
		return document.getElementById(this.htmlFor);
	
	return recursivelyWalk(this.childNodes,
			function(el) {
				if(~["INPUT", "BUTTON", "KEYGEN", "METER", "OUTPUT", "PROGRESS", "TEXTAREA", "SELECT"].indexOf(el.nodeName))
					return el
			}
		) || null;
}
});




M8.define('interfaces/Event','shims',function(require, module, exports){
module.exports = {
	constructor: constructor
};

function constructor(type, dict) {
	var e = document.createEvent("Events");
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    e.initEvent(type, dict.bubbles, dict.catchable);
    return e;
}
});
M8.define('interfaces/EventTarget','shims',function(require, module, exports){
module.exports = {
	interface: window.Node || window.Element
}
});
M8.define('interfaces/Node','shims',function(require, module, exports){
module.exports = {
	contains: {
		value: contains
	},
    interface: window.Element
}

function contains(other) {
    var comparison = this.compareDocumentPosition(other);
    if (comparison === 0 || 
        comparison & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
        return true;
    }
    return false;
}
});
M8.define('interfaces/index','shims',function(require, module, exports){
module.exports = {
	CustomEvent: require("./CustomEvent"),
	Element: require("./Element"),
	HTMLLabelElement: require("./HTMLLabelElement"),
	Event: require("./Event"),
	EventTarget: require("./EventTarget"),
	Node: require("./Node")
};
});
M8.define('bugs','shims',function(require, module, exports){
var utils = require("utils::index");

module.exports = run;

function run() {

// IE9 thinks the argument is not optional
// FF thinks the argument is not optional
// Opera agress that its not optional
(function () {
    var e = document.createElement("div");
    try {
        document.importNode(e);
    } catch (e) {
        var importNode = document.importNode;
        delete document.importNode;
        document.importNode = function _importNode(node, bool) {
            if (bool === undefined) {
                bool = true;
            }
            return importNode.call(this, node, bool);
        }
    }
})();

// Firefox fails on .cloneNode thinking argument is not optional
// Opera agress that its not optional.
(function () {
    var el = document.createElement("p");

    try {
        el.cloneNode();
    } catch (e) {
        [
            Node.prototype,
            Comment.prototype,
            Element.prototype,
            ProcessingInstruction.prototype,
            Document.prototype,
            DocumentType.prototype,
            DocumentFragment.prototype
        ].forEach(fixNodeOnProto);

        utils.HTMLNames.forEach(forAllHTMLInterfaces)
    }

    function forAllHTMLInterfaces(name) {
        window[name] && fixNodeOnProto(window[name].prototype);
    }

    function fixNodeOnProto(proto) {
        var cloneNode = proto.cloneNode;
        delete proto.cloneNode;
        proto.cloneNode = function _cloneNode(bool) {
            if (bool === undefined) {
                bool = true;
            }  
            return cloneNode.call(this, bool);
        };    
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

}
});

// app code - safety wrap


(function(){
M8.define('utils/index','app',function(require, module, exports){
var hasOwnProperty = Object.prototype.hasOwnProperty;


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

module.exports = {
	addShimToInterface: addShimToInterface,
	throwDOMException: throwDOMException,
	clone: clone,
    recursivelyWalk: recursivelyWalk,
	HTMLNames: HTMLNames
};

function recursivelyWalk(nodes, cb) {
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var ret = cb(node);
        if (ret) {
            return ret;
        }
        if (node.childNodes && node.childNodes.length) {
            var ret = recursivelyWalk(node.childNodes, cb);
            if (ret) {
                return ret;
            }
        }
    }
}

function throwDOMException(code) {
    var ex = Object.create(DOMException.prototype);
    ex.code = code;
    throw ex;
}

function addShimToInterface(shim, proto, constructor) {
	Object.keys(shim).forEach(function _eachShimProperty(name) {
		if (name === "constants") {
			var constants = shim[name];
			Object.keys(constants).forEach(function _eachConstant(name) {
				if (!hasOwnProperty.call(constructor, name)) {
					constructor[name] = constants[name];	
				}
			});
			return;
		}

		if (!hasOwnProperty.call(proto, name)) {
			var pd = shim[name];
			if (pd.value) {
				pd.writable = false;
			} else {
                
            }
			pd.configurable = true;
            pd.enumerable = false; 
			Object.defineProperty(proto, name, pd);	
		}
	});
}

function clone(node, document, deep) {
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
}
});
M8.define('main','app',function(require, module, exports){
var shims = require("shims::interfaces"),
	utils = require("utils");

Object.keys(shims).forEach(function _eachShim(name) {
	var shim = shims[name];
	var constructor = window[name];
	if (!constructor) {
		 constructor = window[name] = shim.interface;
	}
	delete shim.interface;
	var proto = constructor.prototype;
	if (shim.prototype) {
		proto = constructor.prototype = shim.prototype;
		delete shim.prototype;
	}

	console.log("adding interface ", name);

	if (shim.hasOwnProperty("constructor")) {
		window[name] = constructor = shim.constructor;
		shim.constructor.prototype = proto;
		delete shim.constructor;
	}

	utils.addShimToInterface(shim, proto, constructor);
});

require("shims::bugs")();
});
})();
})();