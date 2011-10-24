function _createEvent(interface) {
    if (this.createEventObject) {
        return this.createEventObject();
    }
    return Object.create(Event.prototype);
}

domShim.props.Document.createEvent = {
    value: _createEvent
};