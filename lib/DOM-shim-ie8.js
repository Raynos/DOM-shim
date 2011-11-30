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
	HTMLNames: HTMLNames
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
			}
			pd.configurable = true;
			pd.enumerable = false;
			Object.defineProperty(proto, name, pd);	
		}
	});
}
});
M8.define('pd','utils',function(require, module, exports){
!(function (exports) {
    "use strict";

    /*
        pd will return all the own propertydescriptors of the object

        @param Object obj - object to get pds from.

        @return Object - A hash of key/propertyDescriptors
    */    
    function pd(obj) {
        var keys = Object.getOwnPropertyNames(obj);
        var o = {};
        keys.forEach(function _each(key) {
            var pd = Object.getOwnPropertyDescriptor(obj, key);
            o[key] = pd;
        });
        return o;
    }

    function operateOnThis(method) {
        return function _onThis() {
            var args = [].slice.call(arguments);
            return method.apply(null, [this].concat(args));
        }
    }

    /*
        Will extend native objects with utility methods

        @param Boolean prototypes - flag to indicate whether you want to extend
            prototypes as well
    */
    function extendNatives(prototypes) {
        prototypes === true && (prototypes = ["make", "beget", "extend"]);

        if (!Object.getOwnPropertyDescriptors) {
            Object.defineProperty(Object, "getOwnPropertyDescriptors", {
                value: pd,
                configurable: true
            });
        }
        if (!Object.extend) {
            Object.defineProperty(Object, "extend", {
                value: pd.extend,
                configurable: true
            });
        }
        if (!Object.make) {
            Object.defineProperty(Object, "make", {
                value: pd.make,
                configurable: true
            });
        }
        if (!Object.beget) {
            Object.defineProperty(Object, "beget", {
                value: beget,
                configurable: true
            })
        }
        if (!Object.prototype.beget && prototypes.indexOf("beget") !== -1) {
            Object.defineProperty(Object.prototype, "beget", {
                value: operateOnThis(beget), 
                configurable: true
            });
        }
        if (!Object.prototype.make && prototypes.indexOf("make") !== -1) {
            Object.defineProperty(Object.prototype, "make", {
                value: operateOnThis(make),
                configurable: true
            });
        }
        if (!Object.prototype.extend && prototypes.indexOf("extend") !== -1) {
            Object.defineProperty(Object.prototype, "extend", {
                value: operateOnThis(extend),
                configurable: true
            });
        }
        if (!Object.Name) {
            Object.defineProperty(Object, "Name", {
                value: Name,
                configurable: true
            });
        }
        return pd;    
    }

    /*
        Extend will extend the firat parameter with any other parameters 
        passed in. Only the own property names will be extended into
        the object

        @param Object target - target to be extended
        @arguments Array [target, ...] - the rest of the objects passed
            in will extended into the target

        @return Object - the target
    */
    function extend(target) {
        var objs = Array.prototype.slice.call(arguments, 1);
        objs.forEach(function (obj) {
            var props = Object.getOwnPropertyNames(obj);
            props.forEach(function (key) {
                target[key] = obj[key];
            });
        });
        return target;
    }

    /*
        beget will generate a new object from the proto, any other arguments
        will be passed to proto.constructor

        @param Object proto - the prototype to use for the new object
        @arguments Array [proto, ...] - the rest of the arguments will
            be passed into proto.constructor

        @return Object - the newly created object
    */
    function beget(proto) {
        var o = Object.create(proto);
        var args = Array.prototype.slice.call(arguments, 1);
        proto.constructor && proto.constructor.apply(o, args);
        return o;
    }

    /*
        make will call Object.create with the proto and pd(props)

        @param Object proto - the prototype to inherit from
        @arguments Array [proto, ...] - the rest of the arguments will
            be mixed into the object, i.e. the object will be extend
            with the objects

        @return Object - the new object
    */
    function make (proto) {
        var o = Object.create(proto);
        var args = [].slice.call(arguments, 1);
        args.unshift(o);
        extend.apply(null, args);
        return o;
    }

    /*
        defines a namespace object. This hides a "privates" object on object 
        under the "key" namespace

        @param Object object - object to hide a privates object on
        @param Object namespace - key to hide it under

        @author Gozala : https://gist.github.com/1269991

        @return Object privates
    */
    function defineNamespace(object, namespace) {
        var privates = Object.create(object), 
            base = object.valueOf;

        Object.defineProperty(object, 'valueOf', { 
            value: function valueOf(value) {
                if (value !== namespace || this !== object) {
                    return base.apply(this, arguments);
                } else {
                    return privates;
                }
            }
        });

        return privates;
    }

    /*
        Constructs a Name function, when given an object it will return a
        privates object. 

        @author Gozala : https://gist.github.com/1269991

        @return Function name
    */
    function Name() {
        var namespace = {};

        return function name(object) {
            var privates = object.valueOf(namespace);
            if (privates !== object) {
                return privates;
            } else {
                return defineNamespace(object, namespace);
            }
        };
    }

    var Base = {
        extend: operateOnThis(extend),
        make: operateOnThis(make),
        beget: operateOnThis(beget)
    }

    extend(pd, {
        make: make,
        extend: extend,
        beget: beget,
        extendNatives: extendNatives,
        Name: Name,
        Base: Base
    });

    exports(pd);

})(function (data) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = data;
    } else {
        window.pd = data;
    }
});
});
M8.define('interfaces/Event','all',function(require, module, exports){
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
M8.define('interfaces/Event','shims',function(require, module, exports){
var pd = require("utils::pd"),
	Event = require("all::interfaces/Event");

module.exports = pd.make(Event, {
	initEvent: {
		value: initEvent
	}
});

function initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
}
});
M8.define('interfaces/Document','shims',function(require, module, exports){
module.exports = {
	createEvent: {
		value: createEvent
	},
	interface: window.HTMLDocument
};

function createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
}
});
M8.define('interfaces/CustomEvent','all',function(require, module, exports){
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
M8.define('bugs','all',function(require, module, exports){
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
M8.define('interfaces/EventTarget','shims',function(require, module, exports){
module.exports = {
	addEventListener: {
		value: addEventListener
	},
	dispatchEvent: {
		value: dispatchEvent
	},
	removeEventListener: {
		value: removeEventListener
	},
    interface: window.Element
};

function addEventListener(type, listener, capture) {
    var that = this;

    if (that.attachEvent) {
        var cb = function (ev) {
            listener.call(that, ev || window.event);
        };
        if (!that.__domShimEvents__) {
            that.__domShimEvents__ = {};
        }
        var evs = that.__domShimEvents__;
        if (!evs[type]) {
            evs[type] = [];
        } else {
            var alreadyBound = evs[type].some(function (tuple) {
                if (tuple[0] === listener && tuple[1] === cb) {
                    return true;
                }
            });
            if (alreadyBound) {
                return;
            }
        }
        evs[type].push([listener, cb]);
        that.attachEvent("on" + type, cb);
    }
}

function dispatchEvent(ev) {
    var that = this;

    function handler(event) {
        if (event.propertyName === "___domShim___") {
            if (that.__domShimEvents__) {
                that.__domShimEvents__[ev.type].forEach(function (tuple) {
                    tuple[0].call(that, ev);
                });
            }
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
                that.attachEvent("onpropertychange", handler);
                that.___domShim___ = 42;
            // IE8 says no if its not in the DOM.
            } else if (e.message === "Unspecified error.") {
                var display = this.style.display;
                this.style.display = "none";
                document.body.appendChild(this);
                this.dispatchEvent(ev);
                document.body.removeChild(this);
                this.style.display = display;
            }
        }
        return ret;
    }
}

function removeEventListener(type, listener, capture) {
    var that = this;

    var list = that.__domShimEvents__;
    if (that.detachEvent && list) {
        var arr = list[type];
        for (var i = 0, len = arr.length; i < len; i++) {
            var tuple = arr[i];
            if (tuple[0] === listener) {
                that.detachEvent("on" + type, tuple[1]);
                arr.splice(i, 1);
                break;
            }
        }
    }
}
});
M8.define('bugs','shims',function(require, module, exports){
var utils = require("utils"),
	eventTargetShim = require("shims::interfaces/EventTarget");

module.exports = run;

function run() {

// IE8 Document does not inherit EventTarget
(function () {
    if (!document.addEventListener) {
        utils.addShimToInterface(eventTargetShim, document);
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

require("all::bugs")();

}
});
M8.define('interfaces/index','shims',function(require, module, exports){
module.exports = {
	CustomEvent: require("all::interfaces/CustomEvent"),
	Event: require("shims::interfaces/Event"),
	Document: require("shims::interfaces/Document"),
	EventTarget: require("shims::interfaces/EventTarget")
};
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
	HTMLNames: HTMLNames
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
			}
			pd.configurable = true;
			pd.enumerable = false;
			Object.defineProperty(proto, name, pd);	
		}
	});
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