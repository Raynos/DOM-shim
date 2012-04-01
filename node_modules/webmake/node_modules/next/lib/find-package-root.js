// For given path returns root package path.
// If given path doesn't point to package content then null is returned.

'use strict';

var stat       = require('fs').stat
  , path       = require('path')
  , basename   = path.basename
  , dirname    = path.dirname
  , resolve    = path.resolve
  , contains   = require('es5-ext/lib/Array/prototype/contains')
  , dirExists  = require('./fs/dir-exists')
  , fileExists = require('./fs/file-exists')

  , isPackageRoot, cache = [];

cache.contains = contains;

isPackageRoot = function (path, callback) {
	if (cache.contains(path)) {
		callback(null, path);
		return;
	}
	fileExists(path + '/package.json', function (exists) {
		if (exists) {
			cache.push(path);
			callback(null, path);
			return;
		}
		dirExists(path + '/node_modules', function (exists) {
			var parentpath;
			if (exists) {
				cache.push(path);
				callback(null, path);
			} else {
				parentpath = dirname(path);
				if (parentpath === path) {
					callback(null, null);
				} else if (basename(parentpath) === 'node_modules') {
					cache.push(path);
					callback(null, path);
				} else {
					isPackageRoot(parentpath, callback);
				}
			}
		});
	});
};

module.exports = function find(path, callback) {
	path = resolve(String(path));
	stat(path, function (err, stats) {
		if (err) {
			if (dirname(path) !== path) {
				find(dirname(path), callback);
			} else {
				callback(null, null);
			}
			return;
		}
		if (stats.isDirectory()) {
			isPackageRoot(path, callback);
		} else {
			isPackageRoot(dirname(path), callback);
		}
	});
};
