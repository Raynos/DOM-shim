var fs = require("fs"),
	path = require("path");

process.chdir(__dirname);

var code = ";(function (window, document, undefined) {";

var start = ";(function () {";
var end = "})();";

var files = fs.readdirSync(path.join("src"));
files.forEach(function (filename) {
	var file = fs.readFileSync(path.join("src", filename));
	code += start + file.toString() + end;
});

code += "})(window, document);";

fs.writeFileSync(path.join("lib", "DOM-shim.js"), code);
console.log("done");

