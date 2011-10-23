///
///
/// Helper functions
///
///

function recursivelyWalk(nodes, cb) {
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        var ret = cb(node);
        if (ret) {
            return ret;
        }
        if (node.childNodes && node.childNodes.length > 0) {
            var ret = recursivelyWalk(node.childNodes, cb);
            if (ret) {
                return ret;
            }
        }
    }
}

function throwDOMException(code) {
    var ex = Object.create(DOMException.prototype);
    ex.code = code;
    throw ex;
}

var propsBlackListForIE = {
    nodeType: true,
    nodeName: true
};

function addGetterSetterToProtoForEach(props, proto, name) {
    var hasProperty = false,
        value = props[name];
    try {
        hasProperty = proto[name];
    } catch (e) {
        // IE9 throws errors
        hasProperty = proto.hasOwnProperty(name);
    }
    if (!hasProperty || value.force) {
        var obj = {
            enumerable: true,
            configurable: true
        };
        if (value.get) {
            obj.get = value.get;
        }
        if (value.set) {
            obj.set = value.set;
        }
        try {
            Object.defineProperty(proto, name, obj);    
        } catch (e) {
            // IE8 FFFFFFFFFFFFFFFFFFFFF
            delete obj.enumerable;
        }
        try {
            Object.defineProperty(proto, name, obj);
        } catch (e) {
            // IE8 this must be non-host object.
        }
        
    }
}

function addGetterSetterToProto(props, proto) {
    Object.keys(props).forEach(function _each(name) {
        // fix for IE8
        if (proto === NodeProto && !propsBlackListForIE[name]) {
            // Fix docfrags
            if (HTMLEls.HTMLDocument && !HTMLEls.HTMLDocument.prototype.constructor) {
                addGetterSetterToProtoForEach(
                    props, HTMLEls.HTMLDocument.prototype, name);
            }
            // fix text
            addGetterSetterToProtoForEach(props, Text.prototype, name);
        }
        addGetterSetterToProtoForEach(props, proto, name);
    });
}

function addPropsToProtoForEach(props, proto, name) {
    var value = props[name];
    var has = false;
    try {
        has = proto[name];
    } catch (e) {
        // IE9 throws errors
        has = proto.hasOwnProperty(name);
    }
    if (!has || value.force) {
        var obj = {
            configurable: true,
            enumerable: true,
            writable: true
        };

        if (value.hasOwnProperty("value")) {
            obj.value = value.value;
        }
        if (value.hasOwnProperty("writable")) {
            obj.writable = value.writable;
        }
        try {
            Object.defineProperty(proto, name, obj);    
        } catch (e) {
            // IE8 FFFFFFFFFFFFFFFFFFFFFFFFFFFF
            delete obj.enumerable;
        }
        try {
            Object.defineProperty(proto, name, obj);
        } catch (e) {
            // IE8 this must be non-host object.
        }
    }
}

function addPropsToProto(props, proto) {
    Object.keys(props).forEach(function _each(name) {
        // fix for IE8
        if (proto === NodeProto && !propsBlackListForIE[name]) {
            // Fix docfrags
            if (HTMLEls.HTMLDocument && !HTMLEls.HTMLDocument.prototype.constructor) {
                addPropsToProtoForEach(
                    props, HTMLEls.HTMLDocument.prototype, name);
            }
            // fix text
            addPropsToProtoForEach(props, Text.prototype, name);
        }
        addPropsToProtoForEach(props, proto, name);
    });
}

function addConstsToObject(consts, object) {
    Object.keys(consts).forEach(function _each(name) {
        var value = consts[name];
        if (!object[name]) {
            try {
                Object.defineProperty(object, name, {
                    value: value,
                    configurable: true,
                    enumerable: true
                }); 
            } catch (e) {
                // IE8 fails because Node is Object
                object[name] = value;
            }
        }
    });
}