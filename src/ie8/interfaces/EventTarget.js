var dataManager = require("utils::dataManager"),
    throwDOMException = require("utils::index").throwDOMException,
    push = [].push;

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
    if (listener === null) return;

    var that = this;

    capture = capture || false;

    var store = dataManager.getStore(this);

    var eventsString;
    if (capture) {
        eventsString = "captureEvents";
    } else {
        eventsString = "bubbleEvents";
    }

    if (!store[eventsString]) {
        store[eventsString] = {};
    }

    var events = store[eventsString];

    if (!events[type]) {
        events[type] = {};
        events[type].listeners = [];
    }

    var typeObject = events[type];

    var listenerArray = typeObject.listeners;
    if (listenerArray.indexOf(listener) === -1) {
        listenerArray.push(listener);
    } else {
        return;
    }

    if (this.attachEvent) {
        try {
            this.attachEvent("on" + type, handler);
            
            if (!typeObject.ieHandlers) {
                typeObject.ieHandlers = [];
            }

            var index = listenerArray.length - 1;

            typeObject.ieHandlers[index] = handler;

        } catch (e) {
            /* don't care. can't attach so can't be fired */
        }
    }

    function handler() {
        var ev = document.createEvent("event");
        ev.initEvent(type, true, true);
        that.dispatchEvent(ev);
    }
}

function removeEventListener(type, listener, capture) {
    capture = capture || false;

    var store = dataManager.getStore(this);

    var eventsString;
    if (capture) {
        eventsString = "captureEvents";
    } else {
        eventsString = "bubbleEvents";
    }

    var events = store[eventsString];

    if (!events) return;

    var typeObject = events[type];

    if (!typeObject) return;

    var listenerArray = typeObject.listeners;

    var index = listenerArray.indexOf(listener);
    listenerArray.splice(index, 1);

    if (this.detachEvent) {
        try {
            var ieHandlers = typeObject.ieHandlers;

            var handler = ieHandlers[index];

            this.detachEvent("on" + type, handler);    

            ieHandlers.splice(index, 1);
        } catch (e) {
            /* don't care. Can't detach what hasn't been attached */
        }
        
    }
}

function dispatchEvent(event) {
    if (event._dispatch === true || event._initialized === true) {
        throwDOMException(DOMException.INVALID_STATE_ERR);
    }

    event.isTrusted = false;

    dispatch(this, event);
}

function dispatch(elem, event) {
    var invokeListenerForEvent = invokeListeners.bind(null, event);

    event._dispatch = true;

    event.target = elem;

    if (elem.parentNode) {
        var eventPath = [];
        var parent = elem.parentNode;
        while (parent) {
            eventPath.unshift(parent);
            parent = parent.parentNode;
        }

        event.eventPhase = Event.CAPTURING_PHASE;

        eventPath.forEach(invokeListenerForEvent);

        event.eventPhase = Event.AT_TARGET;

        invokeListenerForEvent(event.target);

        if (event.bubbles) {
            eventPath = eventPath.reverse();
            event.eventPhase = Event.BUBBLING_PHASE;
            eventPath.forEach(invokeListenerForEvent);
        }
    } else {
        invokeListenerForEvent(event.target);
    }

    event._dispatch = false;

    event.eventPhase = Event.AT_TARGET;

    event.currentTarget = null;

    return !event._canceled;
}

function invokeListeners(event, elem) {
    var store = dataManager.getStore(elem);

    event.currentTarget = elem;

    var listeners = [];
    if (event.eventPhase !== Event.CAPTURING_PHASE) {
        var events = store["bubbleEvents"];
        if (events) {
            var typeObject = events[event.type];

            if (typeObject) {
                var listenerArray = typeObject.listeners

                push.apply(listeners, listenerArray);
            }
        }
    } 
    if (event.eventPhase !== Event.BUBBLING_PHASE) {
        var events = store["captureEvents"];
        if (events) {
            var typeObject = events[event.type];

            if (typeObject) {
                var listenerArray = typeObject.listeners

                push.apply(listeners, listenerArray);
            }
        }
    }

    listeners.some(invokeListener);

    function invokeListener(listener) {
        if (event._stopImmediatePropagation) {
            return true;
        }
        // DOM4 ED says currentTarget, DOM4 WD says target
        listener.call(event.currentTarget, event);
    }
}