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
        events[type] = [];
    }

    var listenerArray = events[type];
    if (listenerArray.indexOf(listener) === -1) {
        listenerArray.push(listener);
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

    var listenerArray = events[type];

    if (!listenerArray) return;

    var index = listenerArray.indexOf(listener);
    listenerArray.splice(index, 1);
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
            var listenerArray = events[event.type];

            if (listenerArray) {
                push.apply(listeners, listenerArray);
            }
        }
    } 
    if (event.eventPhase !== Event.BUBBLING_PHASE) {
        var events = store["captureEvents"];
        if (events) {
            var listenerArray = events[event.type];

            if (listenerArray) {
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