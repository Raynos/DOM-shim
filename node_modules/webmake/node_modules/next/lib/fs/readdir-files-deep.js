// Read all filenames from directory and it's subdirectories

'use strict';

var push         = Array.prototype.push
  , call         = Function.prototype.call
  , keys         = Object.keys
  , trim         = call.bind(String.prototype.trim)
  , fs           = require('fs')
  , path         = require('path')
  , compact      = require('es5-ext/lib/Array/prototype/compact')
  , contains     = require('es5-ext/lib/Array/prototype/contains')
  , copy         = require('es5-ext/lib/Array/prototype/copy')
  , group        = require('es5-ext/lib/Array/prototype/group')
  , intersection = require('es5-ext/lib/Array/prototype/intersection')
  , memoize      = require('es5-ext/lib/Function/memoize')
  , isCallable   = require('es5-ext/lib/Object/is-callable')
  , minimatch    = require('minimatch')

  , readdir = fs.readdir, lstat = fs.lstat, readFile = fs.readFile
  , join = path.join, resolve = path.resolve
  , read, read2, match, match2, prepIgnore;

read = function (path, options, ignore, files, cb) {
	var ignorefiles, waiting;
	if (!files.length) {
		cb(null, []);
		return;
	}
	if (options.ignorefile.some(contains, files)) {
		waiting = options.ignorefile.length;
		options.ignorefile.forEach(function (file, index) {
			if (contains.call(files, file)) {
				readFile(path + '/' + file, 'utf-8', function (err, result) {
					if (err) {
						cb(err);
						waiting = -1;
						return;
					}
					if (!ignore['/']) {
						ignore['/'] = [];
					}
					if (!ignore['/'][index]) {
						ignore['/'][index] = [];
					}
					push.apply(ignore['/'][index],
						compact.call(result.split('\n').map(trim)));
					if (!--waiting) {
						ignore['/'] = compact.call(ignore['/']);
						read2(path, options, ignore, files, cb);
					}
				});
			} else if (!--waiting) {
				read2(path, options, ignore, files, cb);
			}
		});
	} else {
		read2(path, options, ignore, files, cb);
	}
};

prepIgnore = memoize(function (ignore) {
	var result = [];
	ignore.forEach(function (ignore, index) {
		var res = result[index] = group.call(ignore, function (item) {
			return (item[0] === '!') ? 'exclude' : 'include';
		});
		!res.exclude && (res.exclude = []);
		!res.include && (res.include = []);
	});
	result.forEach(function (ignore, index) {
		while (result[++index]) {
			push.apply(ignore.exclude, result[index].exclude);
		}
	});
	return result;
});

match = function (ignore, file) {
	if (!ignore.length) {
		return false;
	}
	return (ignore = prepIgnore(ignore)).some(function (ignore) {
		return ignore.include.some(function (pattern) {
			return minimatch(file, pattern, { matchBase: true });
		}) && ignore.exclude.every(function (pattern) {
			return minimatch(file, pattern, { matchBase: true });
		});
	});
};

match2 = function (ignore, file) {
	return keys(ignore).some(function (key) {
		return match(ignore[key], key + file);
	});
};

read2 = function (path, options, ignore, files, cb) {
	var waiting = files.length, result = [], nignore;
	files.forEach(function (file) {
		if (match2(ignore, file)) {
			if (!--waiting) {
				cb(null, result);
			}
			return;
		}
		lstat(path + '/' + file, function (err, stat) {
			if (err) {
				if (!--waiting) {
					cb(null, result);
				}
			} else if (stat.isFile()) {
				if (!options.pattern || options.pattern.test(file)) {
					result.push(file);
				}
				if (!--waiting) {
					cb(null, result);
				}
			} else if (stat.isDirectory()) {
				readdir(path + '/' + file, function (err, files) {
					if (err) {
						if (!--waiting) {
							cb(null, result);
						}
					} else {
						nignore = {};
						keys(ignore).forEach(function (key) {
							nignore[key + file + '/'] = ignore[key];
						});
						read(path + '/' + file, options, nignore, files,
							function (err, res) {
								if (err) {
									cb(err);
									waiting = -1;
									return;
								}
								result = result.concat(res.map(function (name) {
									return join(file, name);
								}));
								if (!--waiting) {
									cb(null, result);
								}
							});
					}
				});
			} else if (!--waiting) {
				cb(null, result);
			}
		});
	});
};

module.exports = function (path, options, cb) {
	var ignore = [], ignorefiles = [];
	if (isCallable(options)) {
		cb = options;
		options = {};
	}
	if (options.globignore) {
		ignore.push(copy.call(options.globignore));
	}
	if (options.ignorefile) {
		if (options.ignorefile === '.gitignore') {
			options.git = true;
			options.ignorefile = [];
		} else {
			ignore.unshift([options.ignorefile]);
			options.ignorefile = [options.ignorefile];
		}
	} else {
		options.ignorefile = [];
	}
	if (options.git) {
		options.ignorefile.unshift('.gitignore');
		ignore.unshift(['.gitignore', '.git']);
	}

	ignore = { "/": ignore };
	readdir(path = resolve(String(path)), function (err, files) {
		if (err) {
			cb(err);
			return;
		}
		read(path, options, ignore, files, function (err, result) {
			if (err) {
				cb(err);
				return;
			}
			cb(null, result.sort());
		});
	});
};
