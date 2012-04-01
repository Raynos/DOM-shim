'use strict';

var isArray         = Array.isArray
  , parse           = JSON.parse
  , keys            = Object.keys
  , runInNewContext = require('vm').runInNewContext
  , peek            = require('es5-ext/lib/Array/prototype/peek')
  , esprima         = require('esprima')

  , walker, eolRe;

eolRe = /(?:\r\n|[\n\r\u2028\u2029])/;

walker = function (ast) {
	var err, dep, lines;
	if (!ast || (typeof ast !== 'object')) {
		return;
	}
	if (isArray(ast)) {
		ast.forEach(walker, this);
		return;
	}
	keys(ast).forEach(function (key) {
		if (key !== 'range') {
			walker.call(this, ast[key]);
		}
	}, this);
	if ((ast.type === 'CallExpression') && (ast.callee.type === 'Identifier') &&
			(ast.callee.name === 'require')) {
		dep = { point: this.code.indexOf('(', ast.range[0]) + 2 };
		dep.raw = this.code.slice(dep.point - 1, ast.range[1]);
		lines = this.code.slice(ast.range[0], dep.point).split(eolRe);
		dep.line = ast.loc.start.line + lines.length - 1;
		dep.column = (lines.length > 1) ? peek.call(lines).length :
				ast.loc.start.column + lines[0].length;
		if ((ast.arguments.length === 1) && (ast.arguments[0].type === 'Literal')) {
			dep.value = String(ast.arguments[0].value);
		} else {
			if (ast.arguments.length === 1) {
				try {
					dep.value = String(parse(dep.raw));
				} catch (e) {
					try {
						dep.value = String(runInNewContext(dep.raw));
					} catch (e2) {}
				}
			} else if (!ast.arguments.length) {
				dep.value = 'undefined';
			}
		}
		this.deps.push(dep);
	}
};

module.exports = function (code) {
	if (code == null) {
		throw new TypeError('Expected code string');
	}
	code = String(code);
	var ctx = { code: code, deps: [] };
	walker.call(ctx, esprima.parse(code, { range: true, loc: true }));
	return ctx.deps;
};
