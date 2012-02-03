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

function createElement2(eltype, props, contents) {
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
		

		t.equal( createElement2('div',{"class":'test test'}).classList.length, 2, 'duplicates in initial string should be preserved' );
		
		t.equal( createElement2('div',{"class":' '}).classList.length, 0, 'classList.length must be 0 for an element that has no tokens');

		t.equal( createElement2('div',{"class":' '}).classList.contains('foo'), false, 'classList must not contain an undefined class');

		t.equal( createElement2('div',{"class":' '}).classList.item(0), null, 'classList.item() must return null for out-of-range index');

		t.equal( createElement2('div',{"class":' '}).classList.item(-1), null, 'classList.item() must return null for negative index');
		
		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		t.equal( createElement2('div',{"class":' '}).classList[0], window.undefined, 'className[index] must be undefined for out-of-range index');

		t.equal( createElement2('div',{"class":' '}).classList[-1], window.undefined, 'className[index] must be undefined for negative index');

		t.equal( createElement2('div',{"class":' '}).classList.toString(), ' ', 'empty className should stringify to contain the attribute\'s whitespace');

		createDOMException = function(errStr) {
			var ex = Object.create(DOMException.prototype);
			ex.code = ex[errStr];
			ex.message = errStr +': DOM Exception ' + this.code;
			return ex;
		}
		
		t.throws(function () { createElement2('div',{"class":' '}).classList.contains(''); }, DOMException, '.contains(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.add(''); }, DOMException, '.add(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.remove(''); }, DOMException, '.remove(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.toggle(''); }, DOMException, '.toggle(empty_string) must throw a SYNTAX_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.contains('a b'); }, DOMException, '.contains(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.add('a b'); }, DOMException, '.add(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.remove('a b'); }, DOMException, '.remove(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		t.throws(function () { createElement2('div',{"class":' '}).classList.toggle('a b'); }, DOMException, '.toggle(string_with_spaces) must throw an INVALID_CHARACTER_ERR');

		var testEl = createElement2('div',{"class":'foo'}),
			r = testEl.classList.contains('foo') == true &&
				(testEl.setAttribute('class','bar'),
				testEl.classList.contains('bar') == true) &&
				testEl.classList.contains('foo') == false;
		t.equal(r, true, 'classList.contains must update when the underlying attribute is changed');

		t.equal( createElement2('div',{"class":'foo'}).classList.contains('FOO'), false, 'classList.contains must be case sensitive');

		var r = (createElement2('div',{"class":'foo'}).classList.contains('foo.') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo)') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo\'') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo$') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo~') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo?') == false) &&
			(createElement2('div',{"class":'foo'}).classList.contains('foo\\') == false);
		t.equal(r, true, 'classList.contains must not match when punctuation characters are added');

		var elem = createElement2('div',{"class":'foo'});
		elem.classList.add('FOO');
		t.equal( elem.classList.contains('foo'), true, 'classList.add must not remove existing tokens');

		t.equal( createElement2('div',{"class":'foo FOO'}).classList.contains('FOO'), true, 'classList.contains case sensitivity must match a case-specific string');

		t.equal( createElement2('div',{"class":'foo FOO'}).classList.length, 2 , 'classList.length must correctly reflect the number of tokens');

		t.equal( createElement2('div',{"class":'foo FOO'}).classList.item(0), 'foo' , 'classList.item(0) must return the first token');

		var elem = createElement2('div',{"class":'foo'});
		elem.classList.add('FOO');
		t.equal( elem.classList.item(1), 'FOO' , 'classList.item must return case-sensitive strings and preserve token order');

		t.equal( createElement2('div',{"class":'foo FOO'}).classList[0], 'foo' , 'classList[0] must return the first token');

		t.equal( createElement2('div',{"class":'foo FOO'}).classList[1], 'FOO' , 'classList[index] must return case-sensitive strings and preserve token order');

		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		t.equal( createElement2('div',{"class":'foo FOO'}).classList[2], window.undefined , 'classList[index] must still be undefined for out-of-range index when earlier indexes exist');

		var elem = createElement2('div',{});
		elem.classList.add('foo');
		elem.classList.add('FOO');
		t.equal( elem.getAttribute('class'), 'foo FOO' , 'class attribute must update correctly when items have been added through classList');

		var elem = createElement2('div',{});
		elem.classList.add('foo');
		elem.classList.add('FOO');
		t.equal( elem.className + '', 'foo FOO' , 'className must stringify correctly when items have been added');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.add('foo');
		t.equal( elem.classList.length == 2 && elem.className + '' == 'foo FOO', true , 'classList.add must not make any changes if an existing token is added');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.remove('bar');
		t.equal( elem.classList.length == 2 && elem.className + '' == 'foo FOO', true , 'classList.remove must not make any changes if a non-existing token is removed');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.remove('foo');
		r = (elem.classList.length == 1) &&
			(elem.classList.toString() == 'FOO') &&
			(elem.classList.contains('foo') == false) &&
			(elem.classList.contains('FOO') == true);
		t.equal(r, true, 'classList.remove must remove existing tokens');

		var elem = createElement2('div',{"class":'test test'});
		elem.classList.remove('test');
		r = (elem.classList.length == 0) &&
			(elem.classList.contains('test') == false);
		t.equal(r, true, 'classList.remove must remove duplicated tokens');

		var elem = createElement2('div',{"class":'token1 token2 token3'});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), 'token1 token3', 'classList.remove must collapse whitespace around removed tokens');

		var elem = createElement2('div',{"class":' token1 token2  '});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), ' token1', 'classList.remove must only remove whitespace around removed tokens');

		var elem = createElement2('div',{"class":'  token1  token2  token1  '});
		elem.classList.remove('token2');
		t.equal( elem.classList.toString(), '  token1 token1  ', 'classList.remove must collapse multiple whitespace around removed tokens');

		var elem = createElement2('div',{"class":'  token1  token2  token1  '});
		elem.classList.remove('token1');
		t.equal( elem.classList.toString(), 'token2', 'classList.remove must collapse whitespace when removing multiple tokens');

		var elem = createElement2('div',{"class":'  token1  token1  '});
		elem.classList.add('token1');
		t.equal( elem.classList.toString(), '  token1  token1  ', 'classList.add must not affect whitespace when the token already exists');

		var elem = createElement2('div',{"class":'FOO'});
		r = (elem.classList.toggle('foo') == true) &&
			(elem.classList.length == 2) &&
			(elem.classList.contains('foo') == true) &&
			(elem.classList.contains('FOO') == true);
		t.equal(r, true, 'classList.toggle must toggle tokens case-sensitively when adding');

		var elem = createElement2('div',{"class":'foo FOO'});
		r = (elem.classList.toggle('foo') == false) &&
			(elem.classList.toggle('FOO') == false) &&
			(elem.classList.contains('foo') == false) &&
			(elem.classList.contains('FOO') == false);
		t.equal(r, true, 'classList.toggle must be able to remove tokens case-sensitively');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.getAttribute('class'), '', 'className attribute must be empty when all classes have been removed');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.classList.toString(), '', 'className must stringify to an empty string when all classes have been removed');

		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.classList.item(0), null, 'classList.item(0) must return null when all classes have been removed');

		/* the normative part of the spec states that:
		"unless the length is zero, in which case there are no supported property indices"
		...
		"The term[...] supported property indices [is] used as defined in the WebIDL specification."
		WebIDL creates actual OwnProperties and then [] just acts as a normal property lookup */
		var elem = createElement2('div',{"class":'foo FOO'});
		elem.classList.toggle('foo');
		elem.classList.toggle('FOO');
		t.equal( elem.className[0], window.undefined, 'className[0] must be undefined when all classes have been removed');
	//if the last character of DOMTokenSting underlying character is not a space character, append U+0020", where "space character" is from " \t\r\n\f"

		var elem = createElement2('div',{"class":'a '});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a b', 'classList.add should treat " " as a space');

		var elem = createElement2('div',{"class":'a\t'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\tb', 'classList.add should treat \\t as a space');

		var elem = createElement2('div',{"class":'a\r'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\rb', 'classList.add should treat \\r as a space');

		var elem = createElement2('div',{"class":'a\n'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\nb', 'classList.add should treat \\n as a space');

		var elem = createElement2('div',{"class":'a\f'});
		elem.classList.add('b');
		t.equal(elem.classList.toString(),'a\fb', 'classList.add should treat \\f as a space');

		var elem = createElement2('div',{"class":'foo'});
		elem.classList.remove('foo');
		elem.removeAttribute('className');
		t.equal( elem.classList.toggle('foo'), true, 'classList.toggle must work after removing the className attribute');

		//WebIDL and ECMAScript 5 - a readonly property has a getter but not a setter
		//ES5 makes [[Put]] fail but not throw
		var failed = false;
		var elem = createElement2('div',{"class":'token1'});
		try {
			elem.classList.length = 0;
		} catch(e) {
			failed = e;
		}
		r = elem.classList.length == 1 &&
			failed == false;
		t.equal(r, true, 'classList.length must be read-only');

		var failed = false, elem = createElement2('div',{"class":'test'}), realList = elem.classList;
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
	
	"test dataset": function (t) {
		var count = 0,
			el,
			errorMessage = "";
		

		el = createElement2("div", {'data-foo':'foo', 'data-bar':'bar', 'data-baz':'baz'});
		try {
			for(var item in el.dataset)count++;
		}
		catch(e) {
			errorMessage = e.message;
		}
		t.equal(count, 3, "A dataset should be enumeratable." + errorMessage)

		
		el = createElement2("div", {'data-foo':'foo', 'data-bar':'baz', 'dataFoo':'Foo'});
		try {
			for(var item in el.dataset)count++;
		}
		catch(e) {
			errorMessage = e.message;
		}
		t.equal(count, 2, "Only attributes who qualify as dataset properties should be enumeratable in the dataset." + errorMessage)
		
		function testDelete(attr, prop) {
			var d = createElement2("div", attr ? {attr:'value'} : void 0);
			delete d.dataset[prop];
			return attr ? 	
				(d.hasAttribute(attr) === false && d.getAttribute(attr) != "value") : 
				true;
		}
		
		t.equal(testDelete('data-foo', 'foo'), true, "Deleting element.dataset['foo'] should also remove an attribute with name 'data-foo' should it exist.");
		t.equal(testDelete('data-foo-bar', 'fooBar'), true, "Deleting element.dataset['foo'] should also remove an attribute with name 'data-foo' should it exist.");
		t.equal(testDelete('data--', '-'), true, "Deleting element.dataset['-'] should also remove an attribute with name 'data--' should it exist.");
		t.equal(testDelete('data--foo', 'Foo'), true, "Deleting element.dataset['Foo'] should also remove an attribute with name 'data--foo' should it exist.");
		t.equal(testDelete('data---foo', '-Foo'), true, "Deleting element.dataset['-Foo'] should also remove an attribute with name 'data---foo' should it exist.");
		t.equal(testDelete('data-', ''), true, "Deleting element.dataset[''] should also remove an attribute with name 'data-' should it exist.");
		t.equal(testDelete('data-\xE0', '\xE0'), true, "Deleting element.dataset['\xE0'] should also remove an attribute with name 'data-\xE0' should it exist.");
		t.equal(testDelete(null, 'foo'), true, "Deleting element.dataset['foo'] should not throw if even if the element does now have an attribute with the name data-foo.");

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