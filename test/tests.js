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
M8.define('Document','app',function(require, module, exports){
var counter = 0;

function injectIs(cb) {
    var i = document.createElement("i");
    i.className = "clas";
    i.id = "i1";
    var i2 = document.createElement("i");
    document.body.appendChild(i);
    document.body.appendChild(i2);
    cb(i, i2);
    document.body.removeChild(i);
    document.body.removeChild(i2);
}

suites["test Document"] = {
    "test doctype": function (t) {
        var doc = document.doctype;
        t.equal(doc.nodeType, Node.DOCUMENT_TYPE_NODE, "doctype is not a document node");
        t.done();
    },
    "test documentElement": function (t) {
        var docEl = document.documentElement;
        t.ok(docEl, "document Element does not exist");
        t.done();
    },
    "test getElementsByTagName": function (t) {
        injectIs(function (i, i2) {
            var is = toArray(document.getElementsByTagName("i"));    
            t.notEqual(is.indexOf(i), -1, "i is not in is");
            t.notEqual(is.indexOf(i2), -1, "i2 is not in is");
            t.equal(is.length, 2, "length is not correct");
        });
        t.done();
    },
    "test getElementsByClassName": function (t) {
        injectIs(function (i) {
            var byClass = toArray(document.getElementsByClassName("clas"));
            t.equal(i, byClass[0], "not found by class");
            t.equal(byClass.length, 1, "too many elements found");
        });
        t.done();
    },
    "test getDocumentById": function (t) {
        injectIs(function (i) {
            var el = document.getElementById("i1");
            t.equal(el, i, "not found by id");
        });
        t.done();
    },
    "test createElement": function (t) {
        var e = document.createElement("pre");
        t.equal(e.tagName, "PRE", "tag name is not as expected");
        t.done();
    },
    "test createElementNS": function (t) {
        var e = document.createElementNS("*", "PRE");
        t.equal(e.tagName, "PRE", "tag name is not as expected");
        t.done();
    },
    "test createDocumentFragment": function (t) {
        var e = document.createDocumentFragment();
        t.equal(e.nodeType, Node.DOCUMENT_FRAGMENT_NODE, "is not a doc fragment");
        t.done();
    },
    "test createTextNode": function (t) {
        var e = document.createTextNode("some text");
        t.equal(e.nodeType, Node.TEXT_NODE, "is not a text node");
        t.equal(e.data, "some text", "data not set correctly");
        t.done();
    },
    "test createComment": function (t) {
        var e = document.createComment("some text");
        t.equal(e.nodeType, Node.COMMENT_NODE, "is not a comment");
        t.equal(e.data, "some text", "data not set correctly");
        t.done();
    },
    "test importNode": function (t) {
        var e = document.createElement("div");
        var clone = document.importNode(e);
        t.equal(true, e.isEqualNode(clone), "clone is not equal");
        t.done();
    },
    "test adoptNode": function (t) {
        var e = document.createElement("div");
        document.adoptNode(e);    
        t.equal(document, e.ownerDocument, "owner Document is not set");
        t.done();
    },
    "test createEvent": function (t) {
        t.expect(2)
        function handler() {
            t.ok(true, "it did not fire");
            document.removeEventListener("click", handler);
        }

        var ev = document.createEvent("Event");
        ev.initEvent("click", false, false);
        t.equal(Object.getPrototypeOf(ev), Event.prototype, 
            "event is not an event");
        document.addEventListener("click", handler);
        document.dispatchEvent(ev);
        t.done();
    }
}
});
M8.define('Element','app',function(require, module, exports){
function createElement() {
    var e = document.createElement("div");
    var div1 = document.createElement("div");
    div1.className = "divo";
    var div2 = document.createElement("div");
    div2.className = "divo";
    var p1 = document.createElement("p");
    p1.className = "po";
    e.appendChild(document.createTextNode("foo"));
    e.appendChild(div1);
    e.appendChild(p1);
    p1.appendChild(div2);
    return e;
}
function makeEl(eltype,props,contents) {
	var elem = document.createElement(eltype);
	for( var i in props ) {
		//just in case the framework extends object...
		if( props.hasOwnProperty(i) ) {
			elem.setAttribute(i,props[i]);
		}
	}
	if( contents ) {
		elem.innerHTML = contents;
	}
	return elem;
}

suites["test Element"] = {
    "test classList": function (t) {
        var el = document.createElement("div");
        el.className = "baz";
        var clist = el.classList;
        t.equal(clist.contains("baz"), true, 
            "class list does not contain baz");
        clist.remove("baz");
        clist.add("foo");
        t.equal(el.className, "foo", 
            "class name is not adjusted properly");
        clist.remove("foo");
        t.equal(el.className, "", "class name is not adjusted properly");
        clist.add("bar");
        t.ok(clist.contains("bar"), "class list contains is broken");
        t.equal(clist[0], "bar", "index does not work");
        clist.add("foo");
        t.equal(clist.item(1), "foo", "item does not work");
        t.equal(clist.toggle("foo"), false, 
            "toggle does not return boolean");
        t.equal(clist.contains("foo"), false, 
            "contains does not show properly");
        t.equal(clist.toggle("foo"), true, "toggle does not return true");
        t.equal(clist.contains("foo"), true, "toggle did not add token");
		

		t.equal( makeEl('div',{"class":'test test'}).classList.length, 2, 'duplicates in initial string should be preserved' );
		
		t.equal( makeEl('div',{"class":' '}).classList.length, 0, 'classList.length must be 0 for an element that has no tokens');

		t.equal( makeEl('div',{"class":' '}).classList.contains('foo'), false, 'classList must not contain an undefined class');

		t.equal( makeEl('div',{"class":' '}).classList.item(0), null, 'classList.item() must return null for out-of-range index');

		t.equal( makeEl('div',{"class":' '}).classList.item(-1), null, 'classList.item() must return null for negative index');

		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		t.equal( makeEl('div',{"class":' '}).classList[0], window.undefined, 'className[index] must be undefined for out-of-range index');

		t.equal( makeEl('div',{"class":' '}).classList[-1], window.undefined, 'className[index] must be undefined for negative index');

		t.equal( makeEl('div',{"class":' '}).classList.toString(), ' ', 'empty className should stringify to contain the attribute\'s whitespace');

		createDOMException = function(errStr) {
			var ex = Object.create(DOMException.prototype);
			ex.code = ex[errStr];
			ex.message = errStr +': DOM Exception ' + this.code;
			return ex;
		}
		
		t.throws(function () { makeEl('div',{"class":' '}).classList.contains(''); }, DOMException, '.contains(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.add(''); }, DOMException, '.add(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.remove(''); }, DOMException, '.remove(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.toggle(''); }, DOMException, '.toggle(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.contains('a b'); }, DOMException, '.contains(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.add('a b'); }, DOMException, '.add(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.remove('a b'); }, DOMException, '.remove(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { makeEl('div',{"class":' '}).classList.toggle('a b'); }, DOMException, '.toggle(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		var testEl = makeEl('div',{"class":'foo'}),
			r = testEl.classList.contains('foo') == true &&
				(testEl.setAttribute('class','bar'),
				testEl.classList.contains('bar') == true) &&
				testEl.classList.contains('foo') == false;
		t.equal(r, true, 'classList.contains must update when the underlying attribute is changed');

		t.equal( makeEl('div',{"class":'foo'}).classList.contains('FOO'), false, 'classList.contains must be case sensitive');

		var r = (makeEl('div',{"class":'foo'}).classList.contains('foo.') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo)') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo\'') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo$') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo~') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo?') == false) &&
			(makeEl('div',{"class":'foo'}).classList.contains('foo\\') == false);
		t.equal(r, true, 'classList.contains must not match when punctuation characters are added');

		var elem = makeEl('div',{"class":'foo'});
		elem.classList.add('FOO');
		t.equal( elem.classList.contains('foo'), true, 'classList.add must not remove existing tokens');

		t.equal( makeEl('div',{"class":'foo FOO'}).classList.contains('FOO'), true, 'classList.contains case sensitivity must match a case-specific string');

		t.equal( makeEl('div',{"class":'foo FOO'}).classList.length, 2 , 'classList.length must correctly reflect the number of tokens');

		t.equal( makeEl('div',{"class":'foo FOO'}).classList.item(0), 'foo' , 'classList.item(0) must return the first token');

		var elem = makeEl('div',{"class":'foo'});
		elem.classList.add('FOO');
		t.equal( elem.classList.item(1), 'FOO' , 'classList.item must return case-sensitive strings and preserve token order');

		t.equal( makeEl('div',{"class":'foo FOO'}).classList[0], 'foo' , 'classList[0] must return the first token');

		t.equal( makeEl('div',{"class":'foo FOO'}).classList[1], 'FOO' , 'classList[index] must return case-sensitive strings and preserve token order');

		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		t.equal( makeEl('div',{"class":'foo FOO'}).classList[2], window.undefined , 'classList[index] must still be undefined for out-of-range index when earlier indexes exist');

		var elem = makeEl('div',{});
		elem.classList.add('foo');
		elem.classList.add('FOO');
		t.equal( elem.getAttribute('class'), 'foo FOO' , 'class attribute must update correctly when items have been added through classList');

		var elem = makeEl('div',{});
		elem.classList.add('foo');
		elem.classList.add('FOO');
		t.equal( elem.className + '', 'foo FOO' , 'className must stringify correctly when items have been added');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.add('foo');
		t.equal( elem.classList.length == 2 && elem.className + '' == 'foo FOO', true , 'classList.add must not make any changes if an existing token is added');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.remove('bar');
		t.equal( elem.classList.length == 2 && elem.className + '' == 'foo FOO', true , 'classList.remove must not make any changes if a non-existing token is removed');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.remove('foo');
		r = (elem.classList.length == 1) &&
			(elem.classList.toString() == 'FOO') &&
			(elem.classList.contains('foo') == false) &&
			(elem.classList.contains('FOO') == true);
		t.equal(r, true, 'classList.remove must remove existing tokens');

		var elem = makeEl('div',{"class":'test test'});
		elem.classList.remove('test');
		r = (elem.classList.length == 0) &&
			(elem.classList.contains('test') == false);
		t.equal(r, true, 'classList.remove must remove duplicated tokens');

		var elem = makeEl('div',{"class":'token1 token2 token3'});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), 'token1 token3', 'classList.remove must collapse whitespace around removed tokens');

		var elem = makeEl('div',{"class":' token1 token2  '});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), ' token1', 'classList.remove must only remove whitespace around removed tokens');

		var elem = makeEl('div',{"class":'  token1  token2  token1  '});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), '  token1 token1  ', 'classList.remove must collapse multiple whitespace around removed tokens');

		var elem = makeEl('div',{"class":'  token1  token2  token1  '});
		elem.classList.remove('token1');
		t.equal( elem.classList.toString(), 'token2', 'classList.remove must collapse whitespace when removing multiple tokens');

		var elem = makeEl('div',{"class":'  token1  token1  '});
		elem.classList.add('token1');
		t.equal( elem.classList.toString(), '  token1  token1  ', 'classList.add must not affect whitespace when the token already exists');

		var elem = makeEl('div',{"class":'FOO'});
		r = (elem.classList.toggle('foo') == true) &&
			(elem.classList.length == 2) &&
			(elem.classList.contains('foo') == true) &&
			(elem.classList.contains('FOO') == true);
		t.equal(r, true, 'classList.toggle must toggle tokens case-sensitively when adding');

		var elem = makeEl('div',{"class":'foo FOO'});
		r = (elem.classList.toggle('foo') == false) &&
			(elem.classList.toggle('FOO') == false) &&
			(elem.classList.contains('foo') == false) &&
			(elem.classList.contains('FOO') == false);
		t.equal(r, true, 'classList.toggle must be able to remove tokens case-sensitively');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.getAttribute('class'), '', 'className attribute must be empty when all classes have been removed');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.classList.toString(), '', 'className must stringify to an empty string when all classes have been removed');

		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.classList.item(0), null, 'classList.item(0) must return null when all classes have been removed');

		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		var elem = makeEl('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.className[0], window.undefined, 'className[0] must be undefined when all classes have been removed');
	//if the last character of DOMTokenSting underlying character is not a space character, append U+0020", where "space character" is from " \t\r\n\f"

		var elem = makeEl('div',{"class":'a '});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a b', 'classList.add should treat " " as a space');

		var elem = makeEl('div',{"class":'a\t'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\tb', 'classList.add should treat \\t as a space');

		var elem = makeEl('div',{"class":'a\r'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\rb', 'classList.add should treat \\r as a space');

		var elem = makeEl('div',{"class":'a\n'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\nb', 'classList.add should treat \\n as a space');

		var elem = makeEl('div',{"class":'a\f'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\fb', 'classList.add should treat \\f as a space');

		var elem = makeEl('div',{"class":'foo'});
		elem.classList.remove('foo');
		elem.removeAttribute('className');
		t.equal( elem.classList.toggle('foo'), true, 'classList.toggle must work after removing the className attribute');

		//WebIDL and ECMAScript 5 - a readonly property has a getter but not a setter
		//ES5 makes [[Put]] fail but not throw
		var failed = false;
		var elem = makeEl('div',{"class":'token1'});
		try {
			elem.classList.length = 0;
		} catch(e) {
			failed = e;
		}
		r = elem.classList.length == 1 &&
			failed == false;
		t.equal(r, true, 'classList.length must be read-only');

		var failed = false, elem = makeEl('div',{"class":'test'}), realList = elem.classList;
		try {
			elem.className = 'dummy';
		} catch(e) {
			failed = e;
		}
		r = elem.classList == realList &&
			elem.classList.toString() == 'dummy' &&
			failed == false;
		t.equal(r, true, 'classList must be read-only');

		
		
        t.done();
    },
    "test children": function (t) {
        var el = document.createElement("div");
        el.textContent = "foobar";
        var sub = document.createElement("div");
        el.appendChild(sub);
        t.equal(el.children.length, 1, 
            "children does not have length one");
        t.equal(el.children[0], sub, "child is not sub");
        t.done();       
    }, 
    "test getElementsByTagName": function (t) {
        var e = createElement();
        var els = toArray(e.getElementsByTagName("div"));
        t.equal(els.length, 2, "size is incorrect");
        t.notEqual(els.indexOf(e.childNodes[1]), -1, 
            "does not contain div1");
        t.notEqual(els.indexOf(e.childNodes[2].childNodes[0]), -1, 
            "does not contain div2");
        t.done();
    },
    "test getElementsByClassName": function (t) {
        var e = createElement();
        var els = toArray(e.getElementsByClassName("divo"));
        t.equal(els.length, 2, "size is incorrect");
        t.notEqual(els.indexOf(e.childNodes[1]), -1, 
            "does not contain div1");
        t.notEqual(els.indexOf(e.childNodes[2].childNodes[0]), -1, 
            "does not contain div2");
        t.done();
    },
    "test firstElementChild": function (t) {
        var e = createElement();
        t.equal(e.firstElementChild, e.childNodes[1],
            "first element child is incorrect");
        t.done();
    },
    "test lastElementChild": function (t) {
        var e = createElement();
        t.equal(e.lastElementChild, e.childNodes[2],
            "last element child is incorrect");
        t.done();
    },
    "test previousElementSibling": function (t) {
        var e = createElement();
        t.equal(e.childNodes[1].previousElementSibling, null,
            "previous element sibling is incorrect 1");
        t.equal(e.childNodes[2].previousElementSibling, e.childNodes[1],
            "previous element sibling is incorrect 2");
        t.done();
    },
    "test nextElementSibling": function (t) {
        var e = createElement();
        t.equal(e.childNodes[1].nextElementSibling, e.childNodes[2],
            "next element siblign is incorrect");
        t.done();
    },
    "test childElementCount": function (t) {
        var e = createElement();
        t.equal(e.childElementCount, 2, "child element count is wrong");
        t.done();
    }
}
});
M8.define('Event','app',function(require, module, exports){
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
        document.removeEventListener("click", _handler3);
        document.removeEventListener("keyup", _handler3);
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
        t.expect(2);
        var called = 0;
        var e = new CustomEvent("magic", {
            bubbles: true
        });
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
});
M8.define('EventTarget','app',function(require, module, exports){
suites["test EventTarget"] = {
    "test EventTarget": function (t) {
        t.expect(1);
        var et = document.createElement("fake");

        var ev = new CustomEvent("type", {
            detail: {
                "foo": "bar"
            }
        });

        function handler(ev) {
            t.equal(ev.detail.foo, "bar", 
                "event did not work as expected");
            et.removeEventListener("type", handler)
        }

        et.addEventListener("type", handler);
        et.dispatchEvent(ev);
        t.done();
    },
    "test adding events twice doesn't work": function (t) {
        t.expect(1);
        var count = 0;
        var et = document.body;

        var ev = new Event("click");

        function handler(ev) {
            count++;
        }
        et.addEventListener("click", handler);
        et.addEventListener("click", handler);
        et.dispatchEvent(ev);
        t.ok(count === 1, "event handler fired twice");
        t.done();
        et.removeEventListener("click", handler);
    },
    "test works with real events": function (t) {
        t.expect(1);
        var count = 0;
        var et = document.body;
        if (!et.fireEvent ||
            et.addEventListener.toString().indexOf("[native code]") !== -1
        ) {
            t.ok(true, "test irrelevant");
            return t.done();
        }

        function handler (ev) {
            console.log("handler inside fired");
            count++;
        }
        et.addEventListener("click", handler);
        et.fireEvent("onclick");
        t.ok(count === 1, "event handler didn't fire");
        t.done();
        et.removeEventListener("click", handler);
    }
}
});
M8.define('Node','app',function(require, module, exports){
suites["Test Node"] = {
	"test nodeType": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.nodeType, Node.ELEMENT_NODE, "nodeType for element is correct");
		t.equal(nodes.txt.nodeType, Node.TEXT_NODE, "nodeType for text nodes is correct");
		t.equal(nodes.com.nodeType, Node.COMMENT_NODE, "nodeType for comment nodes is correct");
		t.equal(nodes.doc.nodeType, Node.DOCUMENT_NODE, "nodeType for document nodes is correct");
		t.equal(nodes.doctype.nodeType, Node.DOCUMENT_TYPE_NODE, "nodeType for documentType nodes is correct");
		t.equal(nodes.docfrag.nodeType, Node.DOCUMENT_FRAGMENT_NODE, "nodeType for documentFragment nodes is correct");
		t.done();
	},
	"test nodeName": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.nodeName, "P", "nodeName for element is correct");
		t.equal(nodes.txt.nodeName, "#text", "nodeName for text is correct");
		t.equal(nodes.com.nodeName, "#comment", "nodeName for comment is correct");
		t.equal(nodes.doc.nodeName, "#document", "nodeName for document is correct");
		t.equal(nodes.doctype.nodeName, "html5", "nodeName for documenttype is correct");
		t.equal(nodes.docfrag.nodeName, "#document-fragment", "nodeName for documentFragment is correct");
		t.done();
	},
	// TODO: Test baseUri
	"test ownerDocument": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.el.ownerDocument, document, "ownerDocument is the document");
		t.done();
	},
	// TODO: Test parentNode
	"test parentElement": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.el.parentElement, null, "parentElement is null for non-element");
		nodes.el.appendChild(nodes.el2);
		t.equal(nodes.el2.parentElement, nodes.el, "parentElement is an element");
		t.done();
	},
	"test hasChildNodes": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.hasChildNodes(), false, "hasChildNodes returns false for no children");
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.hasChildNodes(), true, "hasChildNodes returns true for children");
		t.done();
	},
	// TODO: Test childNodes
	"test firstChild": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.firstChild, null, "firstChild is null for no children");
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.firstChild, nodes.el, "firstChild is set correctly");
		t.done();
	},
	"test lastChild": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.lastChild, null, "lastChild is null for no children");
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.lastChild, nodes.txt, "lastChild is set correctly");
		t.done();
	},
	"test previousSibling": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.el.previousSibling, null, "previousSibling is null for no left sibling");
		t.equal(nodes.txt.previousSibling, nodes.el, "previousSibling is set correctly");
		t.done();
	},
	"test nextSibling": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.txt.nextSibling, null, "nextSibling is null for no right sibling");
		t.equal(nodes.el.nextSibling, nodes.txt, "nextSibling is set correctly");
		t.done();
	},
	"test compareDocumentPosition": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		var comparison = nodes.el.compareDocumentPosition(nodes.docfrag);
		t.equal(comparison & Node.DOCUMENT_POSITION_CONTAINS, Node.DOCUMENT_POSITION_CONTAINS,
			"docfrag contains el");
		t.equal(comparison & Node.DOCUMENT_POSITION_PRECEDING, Node.DOCUMENT_POSITION_PRECEDING,
			"docfrag precedes el");
		var comparison = nodes.docfrag.compareDocumentPosition(nodes.el);
		t.equal(comparison & Node.DOCUMENT_POSITION_CONTAINED_BY, Node.DOCUMENT_POSITION_CONTAINED_BY,
			"el is contained by docfrag");
		t.equal(comparison & Node.DOCUMENT_POSITION_FOLLOWING, Node.DOCUMENT_POSITION_FOLLOWING,
			"el is following docfrag");
		var comparison = nodes.el.compareDocumentPosition(nodes.el);
		t.equal(comparison, 0, "equal nodes return 0");
		var comparison = nodes.el.compareDocumentPosition(nodes.txt);
		t.equal(comparison & Node.DOCUMENT_POSITION_FOLLOWING, Node.DOCUMENT_POSITION_FOLLOWING,
			"text is following el");
		t.done();
	},
	"test contains": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.appendChild(nodes.txt);
		t.equal(nodes.docfrag.contains(nodes.el), true, "docfrag contains el");
		t.equal(nodes.el.contains(nodes.txt), false, "el does not contains txt");
		t.done();
	},
	"test nodeValue": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.docfrag.nodeValue, null, "nodeValue is null for docfrag");
		nodes.docfrag.nodeValue = 42;
		t.equal(nodes.docfrag.nodeValue, null, "nodeValue is still null for docfrag");
		t.equal(nodes.txt.nodeValue, "", "nodeValue default for txt is empty string");
		nodes.txt.nodeValue = 42;
		t.equal(nodes.txt.nodeValue, 42, "nodeValue is set properly for txt nodes");
		t.done();
	},
	"test textContent": function (t) {
		var nodes = makeNodes();
		t.equal(nodes.txt.textContent, "", "textContent for txt node defaults to empty string");
		nodes.txt.textContent = "foo";
		t.equal(nodes.txt.textContent, "foo", "textContent for txt node is properly set");
		t.equal(nodes.el.textContent, "", "textContent for el node is empty string");
		nodes.el.textContent = "foo";
		t.ok(nodes.el.firstChild, "el has a child");
		t.equal(nodes.el.firstChild.nodeType, Node.TEXT_NODE, "child is a text node");
		t.equal(nodes.el.firstChild.textContent, "foo", "text content of the child node is set");
		t.equal(nodes.el.textContent, "foo", "text content of the el is set");
		t.done();
	},
	"test insertBefore": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.txt);
		nodes.docfrag.insertBefore(nodes.el, nodes.txt);
		t.equal(nodes.el, nodes.docfrag.childNodes[0], "el is first child of domfrag");
		nodes.docfrag.insertBefore(nodes.el2, nodes.txt);
		t.equal(nodes.el2, nodes.docfrag.childNodes[1], "el2 is second child of domfrag");
		t.done();
	},
	"test appendChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.el, nodes.docfrag.childNodes[0], "el was appended correctly");
		nodes.docfrag.appendChild(nodes.el2);
		t.equal(nodes.el2, nodes.docfrag.childNodes[1], "el2 was appended correctly");
		t.done();
	},
	"test replaceChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		nodes.docfrag.replaceChild(nodes.txt, nodes.el);
		t.equal(nodes.txt, nodes.docfrag.childNodes[0], "txt node was correctly replaced");
		nodes.docfrag.appendChild(nodes.el2);
		nodes.docfrag.replaceChild(nodes.el, nodes.el2);
		t.equal(nodes.el, nodes.docfrag.childNodes[1], "el node was correctly replaced into docfrag");
		t.done();
	},
	"test removeChild": function (t) {
		var nodes = makeNodes();
		nodes.docfrag.appendChild(nodes.el);
		t.equal(nodes.docfrag.hasChildNodes(), true, "docfrag has children");
		nodes.docfrag.removeChild(nodes.el);
		t.equal(nodes.docfrag.hasChildNodes(), false, "node was correctly removed");
		t.done();
	},
	"test cloneNode": function (t) {
		var nodes = makeNodes();
		var clone = nodes.el.cloneNode();	
		
		t.equal(clone.isEqualNode(nodes.el), true, "the clone is the same");
		t.done(); 
	},
	"test isEqualNode": function (t) {
		var nodes = makeNodes();
		var clone = nodes.el.cloneNode();
		t.equal(clone.isEqualNode(nodes.el), true, "the clone is the same");
		t.done(); 
	}
};
});
M8.define('main','app',function(require, module, exports){
window.makeNodes = function () {
	// TODO: Test ProcessingInstruction
	return {
		"el": document.createElement("p"),
		"el2": document.createElement("p"),
		"txt": document.createTextNode(""),
		"com": document.createComment(""),
		"doc": document,
		"doctype": document.implementation.createDocumentType("html5", "", ""), 
		"docfrag": document.createDocumentFragment()
	};
};

window.toArray = function (obj) {
	var arr = [];
	for (var i = 0, len = obj.length; i < len; i++) {
		arr[i] = obj[i];
	}
	return arr;
};

require("./Document");
require("./Element");
require("./Event");
require("./EventTarget");
require("./Node");
});
})();
})();