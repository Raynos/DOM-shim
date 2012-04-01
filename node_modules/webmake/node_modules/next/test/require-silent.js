'use strict';

var playground = __dirname + '/__playground';

module.exports = function (t, a) {
	var file = playground + '/sample';
	a(t(require)(file), require(file), "Existing");

	file = playground + '/sample-na';
	a(t(require)(file), null, "Non existing");

	file = playground + '/sample-error';
	a.ok(t(require)(file) instanceof Error, "Evaluation error");

	file = playground + '/require-error';
	a.ok(t(require)(file) instanceof Error, "Internal require error");
};
