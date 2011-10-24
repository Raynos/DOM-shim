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

function readFolder(loc, code) {
	var files = fs.readdirSync(loc);
	files.sort(function (a, b) {
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
	}).forEach(function (file) {
		if (/\.js$/.test(file)) {
			var source = fs.readFileSync(path.join(loc, file));
			code.push(";(function () { \n");
			code.push(source.toString());	
			code.push("})(); \n");
		} else {
			var folderPath = path.join(loc, file);
			readFolder(folderPath, code);
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

// OLD DOM-SHIM BUILD
/*fs.writeFileSync(path.join("lib", "DOM-shim.js"), makeOrderedFile(
	[	
		"Variables.js",
		"Helpers.js",
		"document.js",
		"Node.js",
		"DOMException.js",
		"Event.js",
		"bugs.js"
	],
	"src"
));*/

// BUILD UNIT TESTS
fs.writeFileSync(path.join("test", "compiled", "tests.js"), makeOrderedFile(
	[
		"Helpers.js",
		"Node.js",
		"DOMException.js",
		"Event.js"
	],
	path.join("test", "test-suites")
));
// BUILD COMPLIANCE TESTS
fs.writeFileSync(
	path.join("test", "compiled", "compliance.js"), 
	makeFile(path.join("test", "compliance-suites"))
);



console.log("done");
