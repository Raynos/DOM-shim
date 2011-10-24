var eventListeners = domShim.common.EventTarget.eventListeners;

function _removeEventListener(type, listener, capture) {
    if (this.detachEvent) {
        for (var i = 0, len = eventListeners.length; i < len; i++) {
            var triplet = eventListeners[i];
            if (triplet[1] === listener && triplet[0] === type) {
                this.detachEvent("on" + type, triplet[2]);
                eventListeners.splice(i, 1);
                break;
            }
        }
    }
}

domShim.props.EventTarget.removeEventListener = {
    value: _removeEventListener
};