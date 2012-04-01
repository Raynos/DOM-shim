'use strict';

var stringify = JSON.stringify
  , ast       = require('./ast')
  , direct    = require('./direct');

module.exports = function (code, options) {
	var deps;
	if (code == null) {
		throw new TypeError('Expected code string');
	}
	options = Object(options);
	try {
		deps = direct(code);
	} catch (e) {
		if (options.log) {
			console.log(e.message);
			console.log(".. trying full AST scan");
		}
		deps = ast(code);
	}
	return options.raw ? deps : deps.map(function (dep) {
		return dep.value;
	}).filter(Boolean);
};
