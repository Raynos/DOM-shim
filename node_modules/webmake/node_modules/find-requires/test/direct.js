'use strict';

var readFile = require('fs').readFile
  , ast      = require('../lib/ast')
  , pg       = __dirname + '/__playground';

module.exports = function (t, a, d) {
	var result = ['one', 'thr/ee', 'fo\\ur', 'five', 'six', 'seven', 'ten',
		'in-label', 'seventeen', '\'eighteen\'', 'nineteen', 'twenty', 'twenty/one',
		'twenty/two', 'twenty/three', '/twenty/two/2/', 'twenty/three/2/',
		'twenty/four/2/\'', 'twenty/five/2/"', '\'twenty/six', '"twenty/eight',
		'"twenty/nine"', '"thirty"', 'thirty\tbreak-line \tone', 'thirty\two'];

	readFile(pg + '/plain.js', 'utf-8', function (err, str) {
		var plainR, astR;
		if (err) {
			d(err);
			return;
		}
		plainR = t(str);
		a.deep(plainR.map(function (r) {
			return r.value;
		}).filter(Boolean), result, "Plain");
		a(plainR[0].point, 9, "Point");
		a(plainR[0].line, 1, "Line");
		a(plainR[0].column, 9, "Column");
		a(plainR[0].raw, "'on\\u0065'", "Raw");

		d({
			"Compare with AST": function (a) {
				astR = ast(str);
				a(astR.length, plainR.length, "Length");
				plainR.forEach(function (val, i) {
					a.deep(val, astR[i], i);
				});
			},
			"Fail on ambigous slash": function (a, d) {
				readFile(pg + '/slash.js', 'utf-8', function (err, str) {
					if (err) {
						d(err);
						return;
					}
					try {
						t(str);
						a.never();
					} catch (e) {
						a(e.type, 'slash-ambiguity');
					}
					d();
				});
			},
			"Fail on return": function (a, d) {
				readFile(pg + '/return.js', 'utf-8', function (err, str) {
					if (err) {
						d(err);
						return;
					}
					try {
						t(str);
						a.never();
					} catch (e) {
						a(e.type, 'require-preced');
					}
					d();
				});
			},
			"Fail on bad arguments": function (a, d) {
				readFile(pg + '/arguments.js', 'utf-8', function (err, str) {
					if (err) {
						d(err);
						return;
					}
					try {
						t(str);
						a.never();
					} catch (e) {
						a(e.type, 'require-args');
					}
					d();
				});
			}
		});
	});
};
