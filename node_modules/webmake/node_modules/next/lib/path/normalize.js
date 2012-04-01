'use strict';

var normalize = require('path').normalize
  , peek      = require('es5-ext/lib/Array/prototype/peek')

  , from, to;

if (process.env.OS === 'Windows_NT') {
	from = /\//g;
	to = '\\';
} else {
	to = '/';
	from = /\\/g;
}

module.exports = function (path) {
	path = (path && normalize(path).replace(from, to));
	return ((path.length > 1) && (peek.call(path) === to)) ?
			path.slice(0, -1) : path;
};
