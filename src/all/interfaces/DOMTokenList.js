var utils = require("utils::index");

var throwDOMException = utils.throwDOMException;

module.exports = {
    constructor: DOMTokenList,
    item: item,
    contains: contains,
    add: add,
    remove: remove,
    toggle: toggle,
    toString: _toString
};

module.exports.constructor.prototype = module.exports;

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

function handleErrors(token) {
    if (token === "") {
        throwDOMException(DOMException.SYNTAX_ERR);
    }
    // TODO: test real space chacters
    if (token.indexOf(" ") > -1) {
        throwDOMException(DOMException.INVALID_CHARACTER_ERR);
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

function item(index) {
    if (index >= this.length) {
        return null;
    }
    return this._getString().split(" ")[index];
}

function contains(token) {
    handleErrors(token);
    var list = getList(this);
    return list.indexOf(token) > -1;
}

function add(token) {
    handleErrors(token);
    var list = getList(this);
    if (list.indexOf(token) > -1) {
        return;
    }
    list.push(token);
    this._setString(list.join(" ").trim());
    fixIndex(this, list);
}

function remove(token) {
    handleErrors(token);
    var list = getList(this);
    var index = list.indexOf(token);
    if (index > -1) {
        list.splice(index, 1);
        this._setString(list.join(" ").trim());
    }
    fixIndex(this, list);
}

function toggle(token) {
    if (this.contains(token)) {
        this.remove(token);
        return false;
    } else {
        this.add(token);
        return true;
    }
}

function _toString() {
    return this._getString();
}