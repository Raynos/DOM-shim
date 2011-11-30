var modul8 = require("modul8"),
	path = require("path"),
	fs = require("fs");

build();

var srcPath = './src';

var srcPath = path.join(__dirname, "src");

fs.readdir(srcPath, handleDirectoryRead.bind(null, srcPath));

var srcPath = path.join(__dirname, "test");

fs.readdir(srcPath, handleDirectoryRead.bind(null, srcPath));

function handleDirectoryRead(srcPath, err, files) {
	files.forEach(handleFile.bind(null, srcPath));	
}

function handleFile(srcPath, file) {
	var uri = path.join(srcPath, file);
	fs.stat(uri, handleStat.bind(null, uri));
}

function handleStat(uri, err, stat) {
	if (stat.isDirectory()) {
		fs.readdir(uri, handleDirectoryRead.bind(null, uri));
	} else {
		fs.watch(uri, build);
	}
}

function build() {
	console.log("building");

	try {
		modul8("./test/test-suites/main.js")
			.compile("./test/tests.js");

		modul8("./src/main.js")
			.domains({ 
				shims: './src/all/',
				all: './src/all/',
				utils: './src/utils/'
			})
			.compile("./lib/DOM-shim.js");

		modul8("./src/main.js")
			.domains({ 
				shims: './src/ie8/',
				all: './src/all/',
				utils: './src/utils/'
			})
			.compile('./lib/DOM-shim-ie8.js');

	} catch (e) {
		console.log("compiler error", e);
	}
}