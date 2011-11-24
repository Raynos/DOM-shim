var recursivelyWalk = domShim.utils.recursivelyWalk;

// TODO: use real algorithm
function _getElementsByClassName(clas) {
    var ar = [];
    recursivelyWalk(this.childNodes, function (el) {
        if (el.classList.contains(clas)) {
            ar.push(el);
        }
    });
    return ar;
}

domShim.props.Element.getElementsByClassName = {
    value: _getElementsByClassName
};