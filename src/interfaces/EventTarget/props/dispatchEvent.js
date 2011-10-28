var eventListeners = domShim.common.EventTarget.eventListeners;

function _dispatchEvent(ev) {
    function handler(event) {
        if (event.propertyName === "domShim") {
            eventListeners.forEach(function (tuple) {
                if (tuple[0] === ev.type) {
                    tuple[1].call(this, ev);
                }
            });
            that.detachEvent("onpropertychange", handler);
        }
    }

    if (this.fireEvent) {
        var ret;
        try {
            ret = this.fireEvent("on" + ev.type);
        } catch (e) {
            // IE8 fireEvent on custom property fails
            if (e.message === "Invalid argument.") {
                var that = this;
                // IE8 does not work with document & propertychange
                if (that === document) {
                    that = document.documentElement;
                }
                that.attachEvent("onpropertychange", handler);
                that.domShim = 42;
            }
        }
        return ret;
    }
}

domShim.props.EventTarget.dispatchEvent = {
    value: _dispatchEvent
};