// Finds relative path between two absolute paths

'use strict';

var path       = require('path')
  , commonLeft = require('es5-ext/lib/Array/prototype/common-left')
  , peek       = require('es5-ext/lib/Array/prototype/peek')
  , separator  = require('./separator')

  , join = path.join, resolve = path.resolve;

module.exports = function (from, to) {
	var index, str, added;
	if (arguments.length < 2) {
		to = from;
		from = process.cwd();
	}
	from = String(from);
	if (join(peek.call(from)) === separator) {
		from = join(from, 'x');
	}
	to = String(to);
	if (join(peek.call(to)) === separator) {
		to = join(to, 'x');
		added = true;
	}

	from = resolve(from);
	to = resolve(to);

	index = commonLeft.call(from, to);
	from = from.slice(index);
	to = to.slice(index);

	return (new Array(from.split(separator).length).join('..' + separator) +
		(added ? to.slice(0, -1) : to));
};
