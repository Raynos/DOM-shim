'use strict';

var createContext = require('vm').createContext

  , pg = __dirname + '/__playground';

module.exports = function (t, a) {
	var context = createContext({ test: {} });
	a(t(pg + '/context.js', context)(), context.test);
};
