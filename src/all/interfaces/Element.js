var DOMTokenList = require("all::interfaces/DOMTokenList").constructor;

module.exports = {
	parentElement: {
		get: getParentElement
	},
    classList: {
        get: getClassList
    }
}

function getParentElement() {
    var parent = this.parentNode;
    if (parent == null) {
        return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
        return parent;
    }
    return null;
}

function getClassList() {
    var el = this;

    if (this._classList) {
        return this._classList;
    } else {
        var dtlist = new DOMTokenList(
            function _getClassName() {
                return el.className || "";
            },
            function _setClassName(v) {
                el.className = v;
            }
        );
        this._classList = dtlist;
        return dtlist;
    }
}