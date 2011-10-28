var _clone = domShim.common._clone;

function _cloneNode(flag) {
    if (flag === undefined) {
        flag = true;
    }
    return _clone(this, undefined, flag);
}

domShim.props.Node.cloneNode = {
    value: _cloneNode
};