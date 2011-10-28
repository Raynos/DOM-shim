function _getElementsByClassName(clas) {
    var arr = [];
    domShim.utils.recursivelyWalk(document.childNodes, function (el) {
        var cname = el.className;
        cname = " " + cname + " ";
        if (cname.indexOf(clas) > -1) {
            arr.push(el);
        }
    });
    return arr;
};

domShim.props.Document.getElementsByClassName = {
    value: _getElementsByClassName
};