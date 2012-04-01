'use strict';

var pg = __dirname + '/__playground';

module.exports = function (t, a) {
	var path;
	try {
		require(path = './wrong/path');
		a.never("Wrong path");
	} catch (e) {
		a(t(e, path), true, "Wrong path");
	}
	try {
		require(path = pg + '/sample-error');
		a.never("Syntax error");
	} catch (e2) {
		a(t(e2, path), false, "Syntax error");
	}
	a.ok(t.token, "Exposes token");
	a.not(t.pattern.indexOf(t.token), -1, "Exposes pattern");
};
