// Get all files at path

'use strict';

var stat    = require('fs').lstat
  , resolve = require('path').resolve
  , readdir = require('./readdir-files-deep');

module.exports = function (path, cb) {
	path = resolve(String(path));
	stat(path, function (err, stats) {
		if (err) {
			cb(err);
			return;
		}
		if (stats.isFile()) {
			cb(null, [path]);
		} else if (stats.isDirectory()) {
			readdir(path, function (err, files) {
				if (err) {
					cb(err);
					return;
				}
				cb(null, files.map(function (file) {
					return resolve(path, file);
				}));
			});
		} else {
			cb(null, []);
		}
	});
};
