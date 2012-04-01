var mutationMacro = require("./mutationMacro")

module.exports = before

function before() {
    if (this.parentNode === null) {
        return
    }

    var node = mutationMacro(arguments)
    this.parentNode.insertBefore(node, this)
}