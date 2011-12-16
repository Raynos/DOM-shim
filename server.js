var express = require("express");

var app = express.createServer();

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(app.router);
app.use(express.static(__dirname + '/test'));

app.all("/echo", function (req, res) {
	res.send(req.body);
});

app.listen(4000);