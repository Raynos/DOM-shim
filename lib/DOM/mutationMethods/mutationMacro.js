module.exports = mutationMacro

function mutationMacro(nodes) {
    var node = null
    nodes = [].map.call(nodes, function (node) {
        if (typeof node === "string") {
            return document.createTextNode(node)
        }
        return node
    })
    if (nodes.length === 1) {
        node = nodes[0]
    } else {
        node = document.createDocumentFragment()
        nodes.forEach(function (item) {
            node.appendChild(item)
        })
    }
    return node
}