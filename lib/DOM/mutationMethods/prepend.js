var mutationMacro = require("./mutationMacro")

module.exports = prepend

function prepend() {
    var node = mutationMacro(arguments)
    this.insertBefore(node, this.firstChild)
}