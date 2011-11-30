module.exports = {
	createEvent: {
		value: createEvent
	},
	interface: window.HTMLDocument
};

function createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
}