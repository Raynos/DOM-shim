'use strict';

module.exports = function (t, a) {
	a(t('raz/dwa/'), 'raz/dwa', "With ending slash");
	a(t('/raz/dwa'), '/raz/dwa', "Without ending slash");
	a(t(''), '', "Empty");
	a(t('/'), '/', "Root");
};
