module.exports = {
	addEventListener: {
		value: addEventListener
	},
	dispatchEvent: {
		value: dispatchEvent
	},
	removeEventListener: {
		value: removeEventListener
	},
    interface: window.Element
};

function addEventListener(type, listener, capture) {
    var that = this;

    if (that.attachEvent) {
        var cb = function (ev) {
            listener.call(that, ev || window.event);
        };
        if (!that.__domShimEvents__) {
            that.__domShimEvents__ = {};
        }
        var evs = that.__domShimEvents__;
        if (!evs[type]) {
            evs[type] = [];
        } else {
            var alreadyBound = evs[type].some(function (tuple) {
                if (tuple[0] === listener && tuple[1] === cb) {
                    return true;
                }
            });
            if (alreadyBound) {
                return;
            }
        }
        evs[type].push([listener, cb]);
        that.attachEvent("on" + type, cb);
    }
}

function dispatchEvent(ev) {
    var that = this;

    function handler(event) {
        if (event.propertyName === "___domShim___") {
            if (that.__domShimEvents__) {
                that.__domShimEvents__[ev.type].forEach(function (tuple) {
                    tuple[0].call(that, ev);
                });
            }
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
                that.attachEvent("onpropertychange", handler);
                that.___domShim___ = 42;
            // IE8 says no if its not in the DOM.
            } else if (e.message === "Unspecified error.") {
                var display = this.style.display;
                this.style.display = "none";
                document.body.appendChild(this);
                this.dispatchEvent(ev);
                document.body.removeChild(this);
                this.style.display = display;
            }
        }
        return ret;
    }
}

function removeEventListener(type, listener, capture) {
    var that = this;

    var list = that.__domShimEvents__;
    if (that.detachEvent && list) {
        var arr = list[type];
        for (var i = 0, len = arr.length; i < len; i++) {
            var tuple = arr[i];
            if (tuple[0] === listener) {
                that.detachEvent("on" + type, tuple[1]);
                arr.splice(i, 1);
                break;
            }
        }
    }
}