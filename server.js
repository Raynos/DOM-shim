var webmake = require("webmake"),
	path = require("path"),
	url = require("url"),
	http = require("http"),
	after = require("after"),
	uuid = require("node-uuid"),
	fs = require("fs")

http.createServer(function (req, res) {
	var features = JSON.parse(url.parse(req.url, true).query.features)

	var files = Object.keys(features).map(function (name) {
		var p = path.join.apply(path, name.split("."))
		p = path.join(".", "lib", p + ".js")
		return p
	})

	after.map(files, function (fileName, done) {
		path.exists(fileName, function (exists) {
			if (exists) {
				return done(null, fileName)
			} else {
				console.log("it does not exist", fileName)
			}
			done()
		})
	}, function (err, files) {
		var src = files
			.filter(function (it) { 
				return it !== undefined 
			})
			.map(function (it) {
				return "require('./" + it + "')"
			})
			.join("\n"),
			id = String(uuid()),
			p = path.join(__dirname, id) + ".js"

		fs.writeFile(p, src, "utf8", function (err) {
			webmake(p, function (err, source) {
				fs.unlink(p, function (err) {
					res.setHeader("Content-type", "text/javascript")	
					res.end(source)
				})
			})	
		})
	})
}).listen(8084)