// Whether given path points existing file

'use strict';

var fs = require('fs');

module.exports = function (path, callback) {
	fs.lstat(path, function (err, stats) {
		callback(err ? false : stats.isFile());
	});
};
