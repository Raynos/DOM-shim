function _getElementsByClassName(clas) {
    // TODO: Use real algorithm defined in DOM4
    var arr = [];
    domShim.utils.recursivelyWalk(document.childNodes, function (el) {
        var cname = el.className;
        cname = " " + cname + " ";
        if (cname.indexOf(" " + clas + " ") > -1) {
            arr.push(el);
        }
    });
    return arr;
};

domShim.props.Document.getElementsByClassName = {
    value: _getElementsByClassName
};