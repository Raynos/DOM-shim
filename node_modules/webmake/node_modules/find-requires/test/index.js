'use strict';

var readFile = require('fs').readFile
  , pg       = __dirname + '/__playground';

module.exports = function (t, a, d) {
	var result = ['one', '12', 'thr/ee', 'fo\\ur', 'five', 'six', 'seven',
		'undefined', 'eight', 'nine', 'ten', 'elevensplitpath', 'twelve',
		'fourteen', 'fifteen', 'sixteen', 'seventeen', '\'eighteen\'', 'nineteen',
		'twenty', 'twenty/one', 'twenty/two', 'twenty/three', '/twenty/two/2/',
		'twenty/three/2/', 'twenty/four/2/\'', 'twenty/five/2/"', '\'twenty/six',
		'\'twenty/seven\'', '"twenty/eight', '"twenty/nine"', '"thirty"',
		'thirty\tbreak-line \tone', 'thirty\two'];

	readFile(pg + '/edge.js', 'utf-8', function (err, str) {
		var astR;
		if (err) {
			d(err);
			return;
		}
		a.deep(t(str), result, "Plain result");

		d({
			"Raw option": function (a) {
				astR = t(str, { raw: true });
				a(astR[0].value, 'one', "Value");
				a(astR[0].point, 9, "Point");
				a(astR[0].line, 1, "Line");
				a(astR[0].column, 9, "Column");
				a(astR[0].raw, "'on\\u0065'", "Raw");
			}
		});
	});
};
