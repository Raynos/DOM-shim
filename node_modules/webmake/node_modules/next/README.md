# node-ext - Node.js extensions

Functions that complement Node.js API.  
_It's work in progress, new methods are added when needed._

## Installation

	$ npm install next

## Usage

	var nfs   = require('next/lib/fs')
	  , npath = require('next/lib/path');

	nfs.fileExists(filepath, callback);
	dirpath = npath.trim(dirpath);

Alternatively you can import each function individually

	var fileExists = require('next/lib/fs/file-exists')
	  , pathTrim   = require('next/lib/path/trim');

	fileExists(filepath, callback);
	dirpath = pathTrim(dirpath);

### Extensions

_Each extension is documented at begin of its source file._

* `findPackageRoot(path)`
* `getRequire(path)`
* `isModuleNotFoundError(error, path)`
* `requireInContext(path, context)`
* `requireSilent(path)`

#### child_process

* `child_process.pipe`

#### fs

* `fs.copy`
* `fs.copySync`
* `fs.dirExists`
* `fs.fileExists`
* `fs.readdirFilesDeep`

#### path

* `path.relative`
* `path.trim`
