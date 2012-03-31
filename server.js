var browserify = require("browserify"),
	path = require("path"),
	url = require("url"),
	http = require("http"),
	after = require("after"),
	fs = require("fs")

http.createServer(function (req, res) {
	var features = JSON.parse(url.parse(req.url, true).query.features)

	var bundle = browserify()

	var files = Object.keys(features).map(function (name) {
		var p = path.join.apply(path, name.split("."))
		p = path.join(__dirname, "lib", p + ".js")
		return p
	})

	console.log(files)

	after.forEach(files, function (fileName, done) {
		path.exists(fileName, function (exists) {
			if (exists) {
				console.log("it exists", fileName)
				bundle.addEntry(fileName)
			}
			done()
		})
	}, function () {
		res.setHeader("Content-type", "text/javascript")
		res.end(bundle.bundle())
	})
}).listen(8084)