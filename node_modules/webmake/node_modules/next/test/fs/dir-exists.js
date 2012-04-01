'use strict';

var path = require('path')

  , pgPath;

pgPath = path.dirname(__dirname) + '/__playground';

module.exports = {
	"Directory": function (t, a, d) {
		t(pgPath + '/package/one', function (exists) {
			a.equal(exists, true);
			d();
		});
	},
	"File": function (t, a, d) {
		t(pgPath + '/package/package.json', function (exists) {
			a.equal(exists, false);
			d();
		});
	},
	"Bad path": function (t, a, d) {
		t(pgPath + '/package/bad.path', function (exists) {
			a.equal(exists, false);
			d();
		});
	}
};
