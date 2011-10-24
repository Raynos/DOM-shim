function _dispatchEvent(event) {
    if (this.fireEvent) {
        return this.fireEvent("on" + event.type);
    }
}

domShim.props.EventTarget.dispatchEvent = {
    value: _dispatchEvent
};