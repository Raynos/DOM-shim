var Element = require("all::interfaces/Element"),
	recursivelyWalk = require("utils::index").recursivelyWalk,
	pd = require("utils::pd");

module.exports = pd.extend(Element, {
	getElementsByClassName: {
		value: getElementsByClassName
	},
	childElementCount: {
		get: getChildElementCount
	},
	firstElementChild: {
		get: getFirstElementChild
	},
	lastElementChild: {
		get: getLastElementChild
	},
	nextElementSibling: {
		get: getNextElementSibling
	},
	previousElementSibling: {
		get: getPreviousElementSibling
	}
});

function getChildElementCount() {
    return this.children.length;
}

function getFirstElementChild() {
    var nodes = this.childNodes;
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

function getLastElementChild() {
    var nodes = this.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
        var node = nodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
            return node;
        }
    }
    return null;
}

function getNextElementSibling() {
    var el = this;
    do {
        var el = el.nextSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}

function getPreviousElementSibling() {
    var el = this;
    do {
        el = el.previousSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}


// TODO: use real algorithm
function getElementsByClassName(clas) {
    var ar = [];
    recursivelyWalk(this.childNodes, function (el) {
        if (el.classList && el.classList.contains(clas)) {
            ar.push(el);
        }
    });
    return ar;
};