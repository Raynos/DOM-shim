var event = function (type, dict) {
    dict = dict || {}
    var ev = document.createEvent("Event")
    ev.initEvent(type, dict.bubbles || false, dict.cancelable || false)
    return ev
}

event.prototype = Event.prototype

try {
    var e = new Event("click")
} catch (err) {
    window.Event = event
}