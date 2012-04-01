// End path with slash

'use strict';

var join = require('path').join;

module.exports = function (path) {
	return join(path, 'x').slice(0, -1);
};
