'use strict';

var join      = require('path').join
  , separator = require('../../lib/path/separator');

module.exports = function (t, a) {
	a(t('raz/dwa/'), join('raz/dwa') + separator, "With ending slash");
	a(t('/raz/dwa'), join('/raz/dwa') + separator, "Without ending slash");
	a(t(''), '', "Empty");
	a(t('/'), separator, "Root");
};
