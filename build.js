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

fs.writeFileSync(path.join("lib", "DOM-shim.js"), makeOrderedFile(
	[	
		"Variables.js",
		"Helpers.js",
		"document.js",
		"Node.js",
		"bugs.js"
	],
	"src"
));
fs.writeFileSync(path.join("test", "tests.js"), makeFile(path.join("test", "test-suites")));
fs.writeFileSync(path.join("test", "compliance.js"), makeFile(path.join("test", "compliance-suites")));



console.log("done");
