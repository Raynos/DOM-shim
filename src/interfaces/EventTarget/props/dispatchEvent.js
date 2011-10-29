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
            // IE8 says no if its not in the DOM.
            } else if (e.message === "Unspecified error.") {
                document.body.appendChild(this);
                this.dispatchEvent(ev);
                document.body.removeChild(this);
            }
        }
        return ret;
    }
}

domShim.props.EventTarget.dispatchEvent = {
    value: _dispatchEvent
};