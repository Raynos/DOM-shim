'use strict';

var lstat = require('fs').lstat
  , some  = Array.prototype.some

  , isExecutable;

isExecutable = function (mode) {
	return some.call(mode.toString(8).slice(-3), function (bit) {
		return bit & 1;
	});
};

module.exports = function (path, cb) {
	lstat(path, function (err, stat) {
		if (err) {
			cb(err);
			return;
		}
		cb(null, isExecutable(stat.mode));
	});
};
