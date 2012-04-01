// Read all filenames from directory and it's subdirectories

'use strict';

var fs        = require('fs')
  , resolve   = require('path').resolve
  , k         = require('es5-ext/lib/Function/k')
  , promisify = require('deferred').promisify

  , readdir = promisify(fs.readdir), stat = promisify(fs.lstat);

module.exports = function self(path, callback) {
	readdir(path = resolve(String(path))).map(function (file) {
		var npath = resolve(path, file);
		return stat(npath)(function (stats) {
			return stats.isFile() ? file : null;
		}, k(null));
	}).invoke('filter', Boolean).end(callback);
};
