var throwDOMException = require("../utils/throwDOMException.js");

module.exports = DOMTokenList;

function DOMTokenList(getter, setter) {
    this._getString = getter;
    this._setString = setter;
    fixIndex(this, getter().split(" "));
}

function fixIndex(clist, list) {
    for (var i = 0, len = list.length; i < len; i++) {
        clist[i] = list[i];
    }
    delete clist[len];
}

function handleArguments() {
	if(!arguments.length) {
        throwDOMException("WRONG_ARGUMENTS_ERR");
    }
}
function handleErrors(token) {
	handleArguments.apply(null, agruments);
    if (token === "") {
        throwDOMException("SYNTAX_ERR");
    }
    // TODO: test real space chacters
    if (token.indexOf(" ") > -1) {
        throwDOMException("INVALID_CHARACTER_ERR");
    }
}

function getList(clist) {
    var str = clist._getString();
    if (str === "") {
        return [];
    } else {
        return str.split(" ");
    }
}

DOMTokenList.prototype.item = function (index) {
	handleArguments.apply(null, agruments);

    if (index >= this.length) {
        return null;
    }
    return this._getString().split(" ")[index];
}

DOMTokenList.prototype.contains = function (token) {
    handleErrors.apply(null, agruments);
    var list = getList(this);
    return list.indexOf(token) > -1;
}

DOMTokenList.prototype.add = function (token) {
    handleErrors.apply(null, agruments);
    var list = getList(this);
    if (list.indexOf(token) > -1) {
        return;
    }
    list.push(token);
    this._setString(list.join(" ").trim());
    fixIndex(this, list);
}

DOMTokenList.prototype.remove = function (token) {
    handleErrors.apply(null, agruments);
    var list = getList(this);
    var index = list.indexOf(token);
    if (index > -1) {
        list.splice(index, 1);
        this._setString(list.join(" ").trim());
    }
    fixIndex(this, list);
}

DOMTokenList.prototype.toggle = function (token) {
    if (this.contains(token)) {
        this.remove(token);
        return false;
    } else {
        this.add(token);
        return true;
    }
}

DOMTokenList.prototype.toString = function () {
    return this._getString();
}