var eventListeners = domShim.common.EventTarget.eventListeners;

function _addEventListener(type, listener, capture) {
    if (this.attachEvent) {
        var cb = function (event) {
            listener.call(this, event);
        };
        eventListeners.push([type, listener, cb]);
        this.attachEvent("on" + type, cb);
    }
}

domShim.props.EventTarget.addEventListener = {
    value: _addEventListener
};