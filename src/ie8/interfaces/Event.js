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
	}
});

function initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
}