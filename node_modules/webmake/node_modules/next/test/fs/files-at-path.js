'use strict';

var path      = require('path')
  , dirname   = path.dirname
  , normalize = path.normalize
  , readdir = require('../../lib/fs/readdir-files-deep')

  , pg = dirname(__dirname) + '/__playground';

module.exports = {
	"File": function (t, a, d) {
		var path = pg + '/context.js';
		t(path, function (err, result) {
			if (err) {
				d(err);
				return;
			}
			a.deep(result, [normalize(path)]);
			d();
		});
	},
	"Directory": function (t, a, d) {
		var path = pg + '/dirscan';
		t(path, function (err, result) {
			if (err) {
				d(err);
				return;
			}
			readdir(path, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deep(result.sort(), files.map(function (file) {
					return normalize(path + '/' + file);
				}).sort());
				d();
			});
		});
	}
};
