var fs = require("fs"),
	path = require("path");

process.chdir(__dirname);

function makeFile(loc) {
	var code = ";(function (window, document, undefined) {";

	var start = ";(function () {";
	var end = "})();";

	var files = fs.readdirSync(loc);
	files.forEach(function (filename) {
		var file = fs.readFileSync(path.join(loc, filename));
		code += start + file.toString() + end;
	});

	code += "})(window, document);";
	return code;
}

fs.writeFileSync(path.join("lib", "DOM-shim.js"), makeFile(path.join("src")));
fs.writeFileSync(path.join("test", "tests.js"), makeFile(path.join("test", "suites")));
console.log("done");
