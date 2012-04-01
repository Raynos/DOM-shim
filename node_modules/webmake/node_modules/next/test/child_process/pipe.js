'use strict';

var path  = require('path')
  , spawn = require('child_process').spawn
  , tPath = path.dirname(__dirname) + '/__playground/pipe-wrapper.js';

module.exports = function (t, a, d) {
	var child = spawn(tPath), out = '', err = '';
	child.stdout.on('data', function (content) {
		out += content;
	});
	child.stderr.on('data', function (content) {
		err += content;
	});
	child.on('exit', function () {
		a(out, 'STDOUT\n', "STDOUT");
		a(err, 'STDERR\n', "STDERR");
		d();
	});
};
