var mutationMacro = require("./mutationMacro")

module.exports = replace

function replace() {
    if (this.parentNode === null) {
        return
    }

    var node = mutationMacro(arguments)
    this.parentNode.replaceChild(node, this)
}