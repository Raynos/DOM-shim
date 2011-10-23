///
///
/// Event constants
///
///

var eventConsts = {
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3
};

addConstsToObject(eventConsts, Event);

///
///
/// Events.prototype properties
///
///

// BUG: Cannot shim type
// BUG: Cannot shim target
// BUG: Cannot shim currentTarget

// BUG: Cannot shim eventPhase
// BUG: Cannot shim stopPropagation
// BUG: Cannot shim stopImmediatePropagation
// BUG: Cannot shim bubbles / cancelable attributes
// BUG: Cannot shim preventDefault
// BUG: Cannot shim defaultPrevented
// BUG: Cannot shim isTrusted
// BUG: Cannot shim timeStamp

function _initEvent(type, bubbles, cancelable) {
    this.type = type;
    this.isTrusted = false;
    this.target = null;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
}

var eventProps = {
    "initEvent": {
        value: _initEvent
    }
}

addPropsToProto(eventProps, EventProto);

///
///
/// Events.prototype getter/setters
///
///

// TODO: Shim CustomEvent

// TODO: Shim EventTarget

var eventListeners = [];

function _addEventListener(type, listener, capture) {
    if (this.attachEvent) {
        var cb = function () {
            listener.call(this, window.event);
        };
        eventListeners.push([type, listener, cb]);
        this.attachEvent("on" + type, cb);
    }
}

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

function _dispatchEvent(event) {
    if (this.fireEvent) {
        return this.fireEvent("on" + event.type);
    }
}

var eventTargetProps = {
    addEventListener: {
        value: _addEventListener
    },
    removeEventListener: {
        value: _removeEventListener
    },
    dispatchEvent: {
        value: _dispatchEvent
    }
};

addPropsToProto(eventTargetProps, EventTargetProto);