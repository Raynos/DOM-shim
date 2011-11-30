var pd = require("utils::pd"),
	Event = require("all::interfaces/Event");

module.exports = pd.make(Event, {
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