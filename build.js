var fs = require("fs"),
	path = require("path");

process.chdir(__dirname);

function makeFile(loc) {
	return makeOrderedFile(fs.readdirSync(loc), loc);
}

function makeOrderedFile(files, loc) {
	var code = ";(function (window, document, undefined) { \n";

	files.forEach(function (filename) {
		var file = fs.readFileSync(path.join(loc, filename));
		code += file.toString() + "\n";
	});

	code += "})(window, document);";
	return code;
}

function sortFolders(a, b) {
	if (/start\.js$/.test(a)) {
		return -1;
	}
	if (/start\.js$/.test(b)) {
		return 1;
	}
	if (/end\.js$/.test(a)) {
		return 1;
	}
	if (/end\.js$/.test(b)) {
		return -1;
	}
	if (/\.js$/.test(a)) {
		return 1;
	}
	return 0;
}

function readFile(loc, code) {
	var source = fs.readFileSync(loc);
	code.push("\n;(function () { \n");
	code.push(source.toString());	
	code.push("\n})(); \n");
}

function readSortedFiles(loc, code, cb) {
	var files = fs.readdirSync(loc);
	files.sort(sortFolders).forEach(function (file) {
		if (/\.js$/.test(file)) {
			readFile(path.join(loc, file), code);
		} else {
			cb && cb(file);
		}
	});
}

function readFolder(loc, code) {
	readSortedFiles(loc, code, function (file) {
		var folderPath = path.join(loc, file);
		if (file === "interfaces") {
			readInterfaceFolder(folderPath, code);
		} else {
			readFolder(folderPath, code);	
		}
	});
}

function readPropsFolder(loc, code, interface) {
	code.push("\ndomShim.props." + interface + " = {}; \n");
	readSortedFiles(loc, code);
	code.push("\ndomShim.utils.addPropsToProto(domShim.props." + 
		interface + ", domShim." + interface + ".prototype); \n");
}

function readGetterFolder(loc, code, interface) {
	code.push("\ndomShim.getters." + interface + " = {}; \n");
	readSortedFiles(loc, code);
	code.push("\ndomShim.utils.addGetterToProto(domShim.getters." + 
		interface + ", domShim." + interface + ".prototype); \n");
}

function readInterfaceFolder(loc, code) {
	var tokens = loc.split("\\");
	var interface = tokens[tokens.length - 1];
	readSortedFiles(loc, code, function (file) {
		var folderPath = path.join(loc, file);
		if (file === "props") {
			readPropsFolder(folderPath, code, interface);
		} else if (file === "constants") {
			readFolder(folderPath, code);
		} else if (file === "getter") {
			readGetterFolder(folderPath, code, interface);
		} else {
			readInterfaceFolder(folderPath, code);	
		}
	});
}

function buildDOMShim() {
	var code = [];
	code.push(";(function (window, document, domShim, undefined) { \n");
	var srcpath = path.join("src");
	readFolder(srcpath, code);
	code.push("})(window, document, {}); \n");
	return code.join("");
}

fs.writeFileSync(path.join("lib", "DOM-shim.js"), buildDOMShim());

var code = [];
readFolder(path.join("test", "test-suites"), code);

// BUILD UNIT TESTS
fs.writeFileSync(path.join("test", "compiled", "tests.js"), code.join(""));
// BUILD COMPLIANCE TESTS
fs.writeFileSync(
	path.join("test", "compiled", "compliance.js"), 
	makeFile(path.join("test", "compliance-suites"))
);



console.log("done");
