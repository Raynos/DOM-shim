function _getPreviousElementSibling() {
    var el = this;
    do {
        el = el.previousSibling;
        if (el && el.nodeType === Node.ELEMENT_NODE) {
            return el;
        }
    } while (el !== null);

    return null;
}

domShim.getters.Element.previousElementSibling = {
    get: _getPreviousElementSibling
};