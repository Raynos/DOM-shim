(function () {

var toArray = function (obj) {
    var arr = [];
    for (var i = 0, len = obj.length; i < len; i++) {
        arr[i] = obj[i];
    }
    return arr;
}

if (!Element.prototype.children) {
    Object.defineProperty(Element.prototype, "children", {
        configurable: true,
        get: function _get() {
            var arr = toArray(this.childNodes);
            arr = arr.filter(function (el) {
               return this.nodeType === 1;
            });
            return arr;
        }
    });
}

var frag = document.createDocumentFragment();
var div = document.createElement("div");
div.setAttribute("name", "foo");
frag.appendChild(div);
var documentGetElementByIdIsBroken = frag.getElementById("foo");

if (documentGetElementByIdIsBroken) {
    var oldGetById = document.getElementById;
    Object.defineProperty(document, "getElementById", {
        value: function _getById(id) {
            var el = oldGetById.call(document, id);
            if (e.getAttribute("id") === id) {
                return el;
            }
            return null;
        },
        configurable: true
    });
}

var addEventListenerIsBroken = false;
try {
    div.addEventListener("click", function () { });
} catch (e) {
    addEventListenerIsBroken = true;
}
if (addEventListenerIsBroken) {
    var oldEventListener = window.addEventListener;
    var eventListener = function (ev, cb, watch) {
        if (watch === undefined) {
            watch = false;
        }
        oldEventListener.call(this, ev, cb, watch);
    };
    window.addEventListener = 
        document.addEventListener = 
        Element.prototype.addEventListener = eventListener;
}

})();

