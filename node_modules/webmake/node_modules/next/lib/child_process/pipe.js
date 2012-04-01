// Pipes child process output to node's process output

'use strict';

var noop       = require('es5-ext/lib/Function/noop')

  , stdout     = process.stdout.write.bind(process.stdout)
  , stderr     = process.stderr.write.bind(process.stderr);

// Without that we have no output on Ctrl+C quit (bug ?!)
if (process.env.OS !== 'Windows_NT') {
	process.on('SIGINT', noop);
}

module.exports = function (spawn) {
	spawn.stdout.on('data', stdout);
	spawn.stderr.on('data', stderr);
	return spawn;
};
