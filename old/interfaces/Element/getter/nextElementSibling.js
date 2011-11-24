function _getNextElementSibling() {
    var el = this;
    do {
        var el = el.nextSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}

domShim.getters.Element.nextElementSibling = {
    get: _getNextElementSibling
};