var pd = require("utils::pd"),
	Event = require("all::interfaces/Event");

module.exports = pd.extend(Event, {
	constants: {
		CAPTURING_PHASE: 1,
		AT_TARGET: 2,
		BUBBLING_PHASE: 3
	},
	initEvent: {
		value: initEvent
	},
	stopPropagation: {
		value: stopPropagation
	},
	stopImmediatePropagation: {
		value: stopImmediatePropagation
	},
	preventDefault: {
		value: preventDefault
	},
	defaultPrevented: {
		get: getDefaultPrevented
	}
});

function initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.timeStamp = Date.now();
}

function stopPropagation() {
	this._stopPropagation = true;
}

function stopImmediatePropagation() {
	this._stopImmediatePropagation = true;
}

function preventDefault() {
	this._canceled = true;
}

function getDefaultPrevented() {
	return this._canceled;
}