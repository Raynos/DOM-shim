module.exports = remove

function remove() {
    if (this.parentNode === null) {
        return
    }
    this.parentNode.removeChild(this)
}