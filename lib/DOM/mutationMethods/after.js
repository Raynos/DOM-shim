var mutationMacro = require("./mutationMacro")

module.exports = after

function after() {
    if (this.parentNode === null) {
        return
    }

    var node = mutationMacro(arguments)
    this.parentNode.insertBefore(node, this.nextSibling)
}