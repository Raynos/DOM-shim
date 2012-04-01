'use strict';

var resolve = require('path').resolve

  , pgpath = resolve(__dirname, '../__playground/dirscan');

module.exports = function (t) {
	return {
		"All": function (a, d) {
			t(pgpath + '/eleven', function (err, result) {
				if (err) {
					d(err);
					return;
				}
				a(result, true);
				d();
			});
		},
		"u": function (a, d) {
			t(pgpath + '/nine', function (err, result) {
				if (err) {
					d(err);
					return;
				}
				a(result, true);
				d();
			});
		},
		"None": function (a, d) {
			t(pgpath + '/nine.foo', function (err, result) {
				if (err) {
					d(err);
					return;
				}
				a(result, false);
				d();
			});
		}
	};
};
