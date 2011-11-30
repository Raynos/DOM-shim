module.exports = {
	contains: {
		value: contains
	}
}

function contains(other) {
    var comparison = this.compareDocumentPosition(other);
    if (comparison === 0 || 
        comparison & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
        return true;
    }
    return false;
}