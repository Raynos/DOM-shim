'use strict';

var fs   = require('fs');

module.exports = function (src, dst, a, d) {
	fs.readFile(src, 'utf8', function (err, srcContent) {
		if (err) {
			d(err);
			return;
		}
		fs.readFile(dst, 'utf8', function (err, dstContent) {
			if (err) {
				d(err);
				return;
			}
			a(dstContent, srcContent, "Content");

			fs.stat(src, function (err, srcStats) {
				if (err) {
					d(err);
					return;
				}
				fs.stat(dst, function (err, dstStats) {
					if (err) {
						d(err);
						return;
					}
					a(srcStats.mode, dstStats.mode);
					fs.unlink(dst, d);
				});
			});
		});
	});
};
