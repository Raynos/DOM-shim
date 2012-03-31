var browserify = require("browserify"),
	path = require("path"),
	url = require("url"),
	http = require("http"),
	fs = require("fs")

http.createServer(function (req, res) {
	var features = JSON.parse(url.parse(req.url, true).query.features)

	console.log(features)
}).listen(8084)