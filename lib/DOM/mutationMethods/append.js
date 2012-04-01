var mutationMacro = require("./mutationMacro")

module.exports = append

function append() {
    var node = mutationMacro(arguments)
    this.appendChild(node)
}