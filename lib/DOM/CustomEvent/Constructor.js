var customEvent = function (type, dict) {
    dict = dict || {}
    var ev = document.createEvent("CustomEvent")
    ev.initCustomEvent(type, 
        dict.bubbles || false, 
        dict.cancelable || false,
        dict.detail || null)
    return ev
}

customEvent.prototype = CustomEvent.prototype

try {
    var ev = new CustomEvent("type")
} catch (err) {
    window.CustomEvent = customEvent
}