var documentShim = require("interfaces::Document"),
	eventTargetShim = require("interfaces::EventTarget");

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


// IE8 hurr durr doctype is null
(function () {
    if (document.doctype === null) {
        Object.defineProperty(document, "doctype", documentShim.doctype);
    }
})();
	
}