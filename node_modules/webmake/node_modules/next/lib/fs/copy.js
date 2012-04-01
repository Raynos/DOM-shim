// Copy file
// Credit: Isaac Schlueter
// http://groups.google.com/group/nodejs/msg/ef4de0b516f7d5b8

'use strict';

var util = require('util')
  , fs   = require('fs');

module.exports = function (source, dest, cb) {
	fs.lstat(source, function (err, stats) {
		var read;
		if (err) {
			cb(err);
			return;
		}
		try {
			util.pump(fs.createReadStream(source),
				fs.createWriteStream(dest, { mode: stats.mode }), cb);
		} catch (e) {
			cb(e);
		}
	});
};
