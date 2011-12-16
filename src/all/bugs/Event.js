module.exports = run;

function run() {

// Opera is funny about the "optional" parameter on addEventListener
(function () {
    var count = 0;
    var handler = function () {
        count++;
    }
    document.addEventListener("click", handler);
    var ev = new Event("click");
    document.dispatchEvent(ev);
    if (count === 0) {
        // fix opera
        var oldListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (ev, cb, optional) {
            optional = optional || false;
            return oldListener.call(this, ev, cb, optional);
        };
        // fix removeEventListener aswell
        var oldRemover = EventTarget.prototype.removeEventListener;
        EventTarget.prototype.removeEventListener = function (ev, cb, optional) {
            optional = optional || false;
            return oldRemover.call(this, ev, cb, optional);
        };
        // punch window.
        window.addEventListener = EventTarget.prototype.addEventListener;
        window.removeEventListener = EventTarget.prototype.removeEventListener;
    }
    document.removeEventListener("click", handler);
})();

]