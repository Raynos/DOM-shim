'use strict';

var separator = require('../../lib/path/separator');

module.exports = function (t, a) {
	a(t('a/b/c/'), ['a', 'b', 'c'].join(separator), "Trailing slash");
	a(t('a/b/c'), ['a', 'b', 'c'].join(separator), "No trailing slash");
	a(t('a/b/../c'), ['a', 'c'].join(separator), "Resolve");
	a(t('a/b/./././c'), ['a', 'b', 'c'].join(separator), "Resolve #2");
	a(t('/'), separator, "Root");
	a(t(''), '', "Empty");
};
