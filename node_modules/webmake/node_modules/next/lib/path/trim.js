// Trims trailing slash from given path

'use strict';

var re = /[\u0000-\.0-\[\]-\uffff][\/\\]$/;

module.exports = function (path) {
	return path.match(re) ? path.slice(0, -1) : path;
};
