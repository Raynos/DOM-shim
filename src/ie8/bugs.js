var utils = require("utils"),
	eventTargetShim = require("shims::interfaces/EventTarget");

module.exports = run;

function run() {

// IE8 Document does not inherit EventTarget
(function () {
    if (!document.addEventListener) {
        utils.addShimToInterface(eventTargetShim, document);
    }
})();

// IE8 window.addEventListener does not exist
(function () {
    if (!window.addEventListener) {
        window.addEventListener = document.addEventListener.bind(document);
    }
    if (!window.removeEventListener) {
        window.removeEventListener = document.removeEventListener.bind(document);
    }
    if (!window.dispatchEvent) {
        window.dispatchEvent = document.dispatchEvent.bind(document);
    }
})();

require("all::bugs")();

}