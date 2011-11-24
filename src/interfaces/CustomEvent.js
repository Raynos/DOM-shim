function _constructor(type, dict) {
	var e = document.createEvent("CustomEvent");
    dict = dict || {};
    dict.detail = dict.detail || null;
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    if (e.initCustomEvent) {
        e.initCustomEvent(type, dict.bubbles, dict.catchable, dict.detail);
    } else {
        e.initEvent(type, dict.bubbles, dict.catchable);
        e.detail = dict.detail;
    }
    return e;
}

module.exports = {
	constructor: _constructor
};