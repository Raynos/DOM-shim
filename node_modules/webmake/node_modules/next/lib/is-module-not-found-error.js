// Whether passed error is error thrown by require in case module
// (at given path) is not found

'use strict';

var k = require('es5-ext/lib/Function/k')

  , token, pattern;

try {
	require(token = ':path:');
} catch (e) {
	pattern = e.message;
}

module.exports = exports = function (e, path) {
	return e.message === pattern.replace(token, path);
};

Object.defineProperties(exports, {
	token: { get: k(token) },
	pattern: { get: k(pattern) }
});
