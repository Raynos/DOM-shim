(function(){
window.M8 = {data:{}};
(function(){
/**
 * modul8 v0.13.0
 */

var config    = {"namespace":"M8","domains":["app"],"arbiters":{},"logging":1}
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



// app code - safety wrap


(function(){
M8.define('interfaces/CustomEvent','app',function(require, module, exports){
function _constructor(type, dict) {
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

module.exports = {
	constructor: _constructor
};
});
M8.define('interfaces/Document','app',function(require, module, exports){
function _createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
}

module.exports = {
	createEvent: {
		value: _createEvent
	}	
}
});
M8.define('interfaces/Event','app',function(require, module, exports){
function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

function _constructor(type, dict) {
	var e = document.createEvent("Events");
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    e.initEvent(type, dict.bubbles, dict.catchable);
    return e;
}

module.exports = {
	constructor: _constructor,
	initEvent: {
		value: _initEvent
	},
	constants: {
	    CAPTURING_PHASE: 1,
	    AT_TARGET: 2,
	    BUBBLING_PHASE: 3
	}
};
});
M8.define('interfaces/EventTarget','app',function(require, module, exports){
function _addEventListener(type, listener, capture) {
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

function _dispatchEvent(ev) {
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

function _removeEventListener(type, listener, capture) {
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

module.exports = {
	addEventListener: {
		value: _addEventListener
	},
	dispatchEvent: {
		value: _dispatchEvent
	},
	removeEventListener: {
		value: _removeEventListener
	}
}
});
M8.define('utils','app',function(require, module, exports){
var hasOwnProperty = Object.prototype.hasOwnProperty;

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
			pd.writable = false;
			pd.configurable = true;
			pd.enumerable = false;
			Object.defineProperty(proto, name, pd);	
		}
	});
}

module.exports = {
	addShimToInterface: addShimToInterface
}
});
M8.define('interfaces/index','app',function(require, module, exports){
module.exports = {
	CustomEvent: require("./CustomEvent"),
	Document: require("./Document"),
	Event: require("./Event"),
	EventTarget: require("./EventTarget")
};
});
M8.define('bugs','app',function(require, module, exports){
var utils = require("./utils.js"),
	eventTargetShim = require("interfaces/EventTarget");

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
});
M8.define('main','app',function(require, module, exports){
var shims = require("interfaces"),
	utils = require("./utils");

var getRealInterface = (function () {

	function getFallbackInterface(name) {
		var interface;
		if (name === "Node") {
			interface = window.Element;
		} else if (name === "CustomEvent") {
			interface = window.Event;
		} else if (name === "EventTarget") {
			interface = window.Element;
		} else if (name === "Document") {
			interface = window.HTMLDocument;
		}
		return interface;
	}

	return function getRealInterface(name) {
		var interface = window[name];
		if (interface === undefined) {
			interface = getFallbackInterface(name);
		}
		return interface;
	}
	
}());

Object.keys(shims).forEach(function _eachShim(name) {
	var constructor = getRealInterface(name);
	var proto = constructor.prototype;
	var shim = shims[name];

	if (shim.constructor) {
		window[name] = constructor = shim.constructor;
		shim.constructor.prototype = proto;
		delete shim.constructor;
	}

	utils.addShimToInterface(shim, proto, constructor);
});

require("./bugs");
});
})();
})();