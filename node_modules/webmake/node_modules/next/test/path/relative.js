'use strict';

var join = require('path').join;

module.exports = {
	"Same paths": function (t, a) {
		a.equal(t('/a/b/c', '/a/b/c'), '');
	},
	"From deeper than to": function (t, a) {
		a.equal(t('/a/b/c/d/', '/a/b/'), join('../../'));
	},
	"From deeper than to (file)": function (t, a) {
		a.equal(t('/a/b/c/d/', '/a/b/x'), join('../../x'));
	},
	"To deeper than from": function (t, a) {
		a.equal(t('/a/b/', '/a/b/c/d/'), join('c/d/'));
	},
	"To deeper than from (file)": function (t, a) {
		a.equal(t('/a/b/', '/a/b/c/d/x'), join('c/d/x'));
	},
	"Different paths": function (t, a) {
		a.equal(t('/a/b/c/', '/e/f/g/'), join('../../../e/f/g/'));
	},
	"CWD": function (t, a) {
		a.equal(t(__dirname + '/a/b/'), t(process.cwd(),
			__dirname + join('/a/b/')));
	}
};
