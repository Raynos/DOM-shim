var modul8 = require("modul8"),
	fs = require("fs");

function build() {
	try {
		modul8("./test/test-suites/main.js")
			.compile("./test/tests.js");

		modul8("./src/main.js")
			.compile("./lib/DOM-shim.js");		
	} catch (e) {
		console.log("compiler error", e);
	}
}

build();

[
	"src", 
	"src/interfaces",
	"test", 
	"test/test-suites"
].forEach(function (dir) {
	fs.watch(dir, function (ev) {
		console.log("rebuilding " + dir);
		build();
	});
});