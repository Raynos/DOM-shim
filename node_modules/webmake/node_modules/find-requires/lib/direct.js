'use strict';

var parse     = JSON.parse
  , stringify = JSON.stringify
  , min       = Math.min
  , peek      = require('es5-ext/lib/Array/prototype/peek')

  , wsRe, eolRe, requireRe, breakers, preReturn, Walker;

wsRe = /\s/;
eolRe = /(?:\r\n|[\n\r\u2028\u2029])/;
requireRe = new RegExp('^\\s*(\'(?:[\\0-\\t\\v\\f\\u000e-&\\(-\\u2027\\u2030-' +
	'\\uffff]|\\\\[\\0-\\uffff])*\'|"(?:[\\0-\\t\\v\\f\\u000e-!#-\\u2027' +
	'\\u2030-\\uffff]|\\\\[\\0-\\uffff])*")\\s*\\)');

breakers = ['=', ';', '(', '[', '{', ',', '<', '>', '+', '-', '*', '/', '%',
	'&', '|', '^', '!', '~', '?', ':'];
preReturn = /[\s;]/;

Walker = function (code) {
	this.code = code;
	this.length = code.length;
	this.deps = [];
	this.next();
};

Walker.prototype = {
	current: 0,
	str1: -1,
	str2: -1,
	slash: -1,
	require: -1,
	update: function (index, token) {
		var val = index;
		if (index < this.current) {
			if ((val = this.code.indexOf(token, this.current)) === -1) {
				val = Infinity;
			}
		}
		return val;
	},
	updateAll: function () {
		this.str1 = this.update(this.str1, "'");
		this.str2 = this.update(this.str2, '"');
		this.slash = this.update(this.slash, '/');
		this.require = this.update(this.require, 'require');
	},
	next: function () {
		var next, chr;
		if (this.current >= this.length) {
			return;
		}
		this.updateAll();
		if (this.require < Infinity) {
			next = min(this.str1, this.str2, this.slash, this.require);
			switch (next) {
			case this.str1:
				this.pass(this.str1, "'");
				break;
			case this.str2:
				this.pass(this.str2, '"');
				break;
			case this.slash:
				chr = this.code[this.slash + 1];
				if (chr === '/') {
					this.passComment();
				} else if (chr === '*') {
					this.passMultiComment();
				} else {
					this.passRegExp();
				}
				break;
			default:
				this.passRequire();
			}
		}
	},
	pass: function (current, token) {
		var str, escape;
		--current;
		do {
			current += 2;
			escape = this.code.indexOf('\\', current);
			str = this.code.indexOf(token, current);
		} while ((escape !== -1) && (str !== -1) && (escape < str));
		if (str !== -1) {
			this.current = str + 1;
			this.next();
		}
	},
	passComment: function () {
		this.current = (this.code.indexOf('\n', this.slash + 2) + 1);
		if (this.current) {
			this.next();
		}
	},
	passMultiComment: function () {
		this.current = (this.code.indexOf('*/', this.slash + 2) + 2);
		if (this.current > 1) {
			this.next();
		}
	},
	passRegExp: function () {
		var current = this.slash - 1, chr, e;
		while ((current >= 0) && wsRe.test(chr = this.code[current])) {
			--current;
		}
		if ((current >= 0) && (breakers.indexOf(chr) === -1)) {
			if (chr === '}') {
				// unlikely corner case
				e = new Error("Cannot parse code. Found ambiguous '/' usage" +
					" @" + (current + 1) + ": " +
					stringify(this.code.slice(current, current + 10)) + ". " +
					"Try AST parser instead.");
				e.type = 'slash-ambiguity';
				e.at = current + 1;
				throw e;
			} else {
				// not RegExp
				this.current = this.slash + 1;
				this.next();
			}
		} else {
			this.pass(this.slash, '/');
		}
	},
	passRequire: function () {
		var current = this.require - 1, chr, eol, ws, e;
		this.current = this.require + 'require'.length;
		while (wsRe.test(this.code[this.current])) {
			++this.current;
		}
		if (this.code[this.current] !== '(') {
			this.next();
			return;
		}
		++this.current;
		while ((current >= 0) && wsRe.test(chr = this.code[current]) &&
				!(eol = eolRe.test(chr))) {
			--current;
			ws = true;
			eol = false;
		}
		if (eol) {
			--current;
			while ((current >= 0) && wsRe.test(chr = this.code[current])) {
				--current;
			}
			if ((current >= 0) && (chr === '.')) {
				this.next();
				return;
			}
		} else if ((current >= 0) && (breakers.indexOf(chr) === -1)) {
			if (chr !== '}') {
				if (!ws) {
					// Not really require call
					this.next();
					return;
				}
				e = new Error("Cannot parse code" +
					" @" + (this.require) + ": " +
					stringify(this.code.slice(this.require - 8, this.require + 17)) +
					"." +
					" `require` preceded by unexpected code. Try AST parser instead.");
				e.at = this.require;
				e.type = 'require-preced';
				throw e;
			}
			// require after end of declaration block or syntax error
			// we assume end of declaration block
		}
		this.parseRequire();
	},
	parseRequire: function () {
		var match = this.code.slice(this.current).match(requireRe), e, dep, lines;
		if (match) {
			this.deps.push(dep = {
				value: new Function("'use strict'; return " + match[1])(),
				raw: match[1],
				point: this.code.indexOf('(', this.current - 1) + 2
			});
			lines = this.code.slice(0, dep.point).split(eolRe);
			dep.line = lines.length;
			dep.column = peek.call(lines).length;
			this.current += match[0].length;
			this.next();
		} else {
			e = new Error("Cannot parse code" +
				" @" + (this.current) + ": " +
				stringify(this.code.slice(this.current - 8, this.current + 10)) + "." +
				" Found unexpected code in `require` call. Try AST parser instead.");
			e.type = 'require-args';
			e.at = this.current;
			throw e;
		}
	}
};

module.exports = function (code) {
	if (code == null) {
		throw new TypeError('Expected code string');
	}
	return (new Walker(String(code))).deps;
};
