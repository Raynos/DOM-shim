'use strict';

var path = require('path')

  , dirname = path.dirname, join = path.join

  , pgPath;

pgPath = join(dirname(__dirname), '__playground/dirscan');

module.exports = function (t) {
	return {
		"": function (a, d) {
			t(pgPath, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'.gitignore', '.ignore', 'eleven', 'five', 'four', 'nine', 'nine.foo',
					'nine.keep', 'seven', 'six', 'ten',

					'one/.gitignore', 'one/.ignore', 'one/eleven', 'one/five', 'one/nine',
					'one/nine.bar', 'one/nine.keep', 'one/seven', 'one/six', 'one/ten',

					'one/one/.ignore', 'one/one/eleven', 'one/one/nine',
					'one/one/nine.else', 'one/one/nine.keep', 'one/one/one',
					'one/one/seven', 'one/one/six', 'one/one/ten',

					'two/one'].map(join).sort());
				d();
			});
		},
		"pattern": function (a, d) {
			t(pgPath, { pattern: /^five|nine[\u0000-\uffff]*$/ },
				function (err, files) {
					if (err) {
						d(err);
						return;
					}
					a.deepEqual(files.sort(), [
						'five', 'nine', 'nine.foo', 'nine.keep',

						'one/five', 'one/nine', 'one/nine.bar',
						'one/nine.keep',

						'one/one/nine',
						'one/one/nine.else', 'one/one/nine.keep'].map(join).sort());
					d();
				});
		},
		"git": function (a, d) {
			t(pgPath, { git: true }, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'.ignore', 'eleven', 'five', 'four', 'nine', 'nine.foo',
					'seven', 'six', 'ten',

					'one/.ignore', 'one/five', 'one/nine',
					'one/nine.bar', 'one/seven', 'one/six', 'one/ten',

					'one/one/.ignore', 'one/one/eleven', 'one/one/nine',
					'one/one/nine.else', 'one/one/one',
					'one/one/seven', 'one/one/six', 'one/one/ten',

					'two/one'].map(join).sort());
				d();
			});
		},
		"ignorefile": function (a, d) {
			t(pgPath, { ignorefile: '.ignore' }, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'.gitignore', 'eleven', 'four', 'nine', 'nine.keep',
					'seven', 'ten',

					'one/.gitignore', 'one/eleven', 'one/nine',
					'one/nine.keep', 'one/ten',

					'one/one/nine', 'one/one/nine.keep', 'one/one/one', 'one/one/six',

					'two/one'].map(join).sort());
				d();
			});
		},
		"git & ignorefile": function (a, d) {
			t(pgPath, { ignorefile: '.ignore', git: true }, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'eleven', 'four', 'nine', 'nine.keep',
					'seven', 'ten',

					'one/nine',
					'one/nine.keep', 'one/ten',

					'one/one/nine', 'one/one/nine.keep', 'one/one/one', 'one/one/six',

					'two/one'].map(join).sort());
				d();
			});
		},
		"pattern & ignorefile": function (a, d) {
			t(pgPath, { pattern: /^five|nine[\u0000-\uffff]*$/,
				ignorefile: '.ignore' }, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'nine', 'nine.keep',

					'one/nine',
					'one/nine.keep',

					'one/one/nine', 'one/one/nine.keep'].map(join).sort());
				d();
			});
		},
		"git & pattern & ignorefile": function (a, d) {
			t(pgPath, { pattern: /^five|nine[\u0000-\uffff]*$/,
				ignorefile: '.ignore', git: true }, function (err, files) {
				if (err) {
					d(err);
					return;
				}
				a.deepEqual(files.sort(), [
					'nine', 'nine.keep',

					'one/nine',
					'one/nine.keep',

					'one/one/nine', 'one/one/nine.keep'].map(join).sort());
				d();
			});
		}
	};
};
