var throwDOMException = domShim.utils.throwDOMException;

function DOMTokenList(getter, setter) {
    this._getString = getter;
    this._setString = setter;
    _fixIndex(this, getter().split(" "));
}

function _fixIndex(clist, list) {
    for (var i = 0, len = list.length; i < len; i++) {
        clist[i] = list[i];
    }
    delete clist[len];
}

function _handleErrors(token) {
    if (token === "") {
        throwDOMException(DOMException.SYNTAX_ERR);
    }
    // TODO: test real space chacters
    if (token.indexOf(" ") > -1) {
        throwDOMException(DOMException.INVALID_CHARACTER_ERR);
    }
}

function _getList(clist) {
    var str = clist._getString();
    if (str === "") {
        return [];
    } else {
        return str.split(" ");
    }
}

Object.defineProperties(DOMTokenList.prototype, {
    item: {
        value: function (index) {
            if (index >= this.length) {
                return null;
            }
            return this._getString().split(" ")[index];
        }
    },
    contains: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            return list.indexOf(token) > -1;
        }
    },
    add: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            if (list.indexOf(token) > -1) {
                return;
            }
            list.push(token);
            this._setString(list.join(" ").trim());
            _fixIndex(this, list);
        }
    },
    remove: {
        value: function (token) {
            _handleErrors(token);
            var list = _getList(this);
            var index = list.indexOf(token);
            if (index > -1) {
                list.splice(index, 1);
                this._setString(list.join(" ").trim());
            }
            _fixIndex(this, list);
        }
    },
    toggle: {
        value: function (token) {
            if (this.contains(token)) {
                this.remove(token);
                return false;
            } else {
                this.add(token);
                return true;
            }
        }
    },
    toString: {
        value: function () {
            return this._getString();
        }
    }
});

try {
    Object.defineProperty(DOMTokenList.prototype, "length", {
        get: function () {
            return this._getString().split(" ").length;   
        }
    })
} catch (e) {
    if (e.message === "getters & setters can not be defined on this javascript engine") {
        // IE8 says no getters!
    } else {
        console.log(e);
    }
}

function _getClassList(el) {
   if (this._classList) {
       return this._classList;
   } else {
       return (this._classList = new DOMTokenList(
            function _getClassName() {
                return el.className;
            },
            function _setClassName(v) {
                el.className = v;
            }
       ));
   }
}

domShim.getters.Element.classList = {
    get: function () {
        return _getClassList(this);
    }
}