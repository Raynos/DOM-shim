function _createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
}

module.exports = {
	createEvent: {
		value: _createEvent
	}	
}