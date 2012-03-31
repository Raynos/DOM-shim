window.CharacterData.prototype.after = after

console.log("Y U NO")

function after() {
    [].slice.call(arguments).forEach(function (item) {
        if (typeof item === "string") {
            item = document.createTextNode(item)
        }
        this.parentNode.insertBefore(item, this.nextSibling)
    }, this)
}