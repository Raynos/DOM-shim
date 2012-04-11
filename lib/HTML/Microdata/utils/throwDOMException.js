module.export = throwDOMException;

function throwDOMException(msg) {
	var ex = Object.create(DOMException.prototype);
	ex.code = DOMException[msg];
	ex.message = msg + ": DOM Exception " + ex.code;
	throw ex
}