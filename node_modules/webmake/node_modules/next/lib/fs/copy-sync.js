// Copy file, synchronous

'use strict';

var fs = require('fs');

module.exports = function (source, dest) {
	fs.writeFileSync(dest, fs.readFileSync(source), 'binary');
	fs.chmodSync(dest, fs.statSync(source).mode);
};
