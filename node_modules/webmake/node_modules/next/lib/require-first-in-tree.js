// Require first named module in tree (traversing up)

'use strict';

var path          = require('path')
  , requireSilent = require('./require-silent')(require)
  , errorMsg      = require('./is-module-not-found-error')
  , separator     = require('./path/separator')

  , dirname = path.dirname, join = path.join;

module.exports = function (name, path, root) {
	var m;
	path = join(path);
	root = root ? join(root) : separator;
	while (true) {
		m = requireSilent(path + separator + name);
		if (m) {
			if (m instanceof Error) {
				throw m;
			} else {
				return m;
			}
		}
		if (path === root) {
			throw new Error(errorMsg.pattern.replace(errorMsg.token, name));
		}
		path = dirname(path);
	}
};
