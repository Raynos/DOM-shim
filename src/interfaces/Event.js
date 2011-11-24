function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
};

function _constructor(type, dict) {
	var e = document.createEvent("Events");
    dict = dict || {};
    dict.bubbles = dict.bubbles || false;
    dict.catchable = dict.catchable || false;
    e.initEvent(type, dict.bubbles, dict.catchable);
    return e;
}

module.exports = {
	constructor: _constructor,
	initEvent: {
		value: _initEvent
	},
	constants: {
	    CAPTURING_PHASE: 1,
	    AT_TARGET: 2,
	    BUBBLING_PHASE: 3
	}
};