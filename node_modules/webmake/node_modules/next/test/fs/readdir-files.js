'use strict';

var path = require('path')

  , pgPath;

pgPath = path.dirname(__dirname) + '/__playground/dirscan';

module.exports = function (t, a, d) {
	t(pgPath, function (err, dirs) {
		if (err) {
			d(err);
			return;
		}
		a.deepEqual(dirs.sort(), ['.gitignore', '.ignore', 'eleven', 'five', 'four',
			'nine', 'nine.foo', 'nine.keep', 'seven', 'six', 'ten'].sort());
		d();
	});
};
