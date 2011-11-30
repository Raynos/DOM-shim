!(function (exports) {
    "use strict";

    /*
        pd will return all the own propertydescriptors of the object

        @param Object obj - object to get pds from.

        @return Object - A hash of key/propertyDescriptors
    */    
    function pd(obj) {
        var keys = Object.getOwnPropertyNames(obj);
        var o = {};
        keys.forEach(function _each(key) {
            var pd = Object.getOwnPropertyDescriptor(obj, key);
            o[key] = pd;
        });
        return o;
    }

    function operateOnThis(method) {
        return function _onThis() {
            var args = [].slice.call(arguments);
            return method.apply(null, [this].concat(args));
        }
    }

    /*
        Will extend native objects with utility methods

        @param Boolean prototypes - flag to indicate whether you want to extend
            prototypes as well
    */
    function extendNatives(prototypes) {
        prototypes === true && (prototypes = ["make", "beget", "extend"]);

        if (!Object.getOwnPropertyDescriptors) {
            Object.defineProperty(Object, "getOwnPropertyDescriptors", {
                value: pd,
                configurable: true
            });
        }
        if (!Object.extend) {
            Object.defineProperty(Object, "extend", {
                value: pd.extend,
                configurable: true
            });
        }
        if (!Object.make) {
            Object.defineProperty(Object, "make", {
                value: pd.make,
                configurable: true
            });
        }
        if (!Object.beget) {
            Object.defineProperty(Object, "beget", {
                value: beget,
                configurable: true
            })
        }
        if (!Object.prototype.beget && prototypes.indexOf("beget") !== -1) {
            Object.defineProperty(Object.prototype, "beget", {
                value: operateOnThis(beget), 
                configurable: true
            });
        }
        if (!Object.prototype.make && prototypes.indexOf("make") !== -1) {
            Object.defineProperty(Object.prototype, "make", {
                value: operateOnThis(make),
                configurable: true
            });
        }
        if (!Object.prototype.extend && prototypes.indexOf("extend") !== -1) {
            Object.defineProperty(Object.prototype, "extend", {
                value: operateOnThis(extend),
                configurable: true
            });
        }
        if (!Object.Name) {
            Object.defineProperty(Object, "Name", {
                value: Name,
                configurable: true
            });
        }
        return pd;    
    }

    /*
        Extend will extend the firat parameter with any other parameters 
        passed in. Only the own property names will be extended into
        the object

        @param Object target - target to be extended
        @arguments Array [target, ...] - the rest of the objects passed
            in will extended into the target

        @return Object - the target
    */
    function extend(target) {
        var objs = Array.prototype.slice.call(arguments, 1);
        objs.forEach(function (obj) {
            var props = Object.getOwnPropertyNames(obj);
            props.forEach(function (key) {
                target[key] = obj[key];
            });
        });
        return target;
    }

    /*
        beget will generate a new object from the proto, any other arguments
        will be passed to proto.constructor

        @param Object proto - the prototype to use for the new object
        @arguments Array [proto, ...] - the rest of the arguments will
            be passed into proto.constructor

        @return Object - the newly created object
    */
    function beget(proto) {
        var o = Object.create(proto);
        var args = Array.prototype.slice.call(arguments, 1);
        proto.constructor && proto.constructor.apply(o, args);
        return o;
    }

    /*
        make will call Object.create with the proto and pd(props)

        @param Object proto - the prototype to inherit from
        @arguments Array [proto, ...] - the rest of the arguments will
            be mixed into the object, i.e. the object will be extend
            with the objects

        @return Object - the new object
    */
    function make (proto) {
        var o = Object.create(proto);
        var args = [].slice.call(arguments, 1);
        args.unshift(o);
        extend.apply(null, args);
        return o;
    }

    /*
        defines a namespace object. This hides a "privates" object on object 
        under the "key" namespace

        @param Object object - object to hide a privates object on
        @param Object namespace - key to hide it under

        @author Gozala : https://gist.github.com/1269991

        @return Object privates
    */
    function defineNamespace(object, namespace) {
        var privates = Object.create(object), 
            base = object.valueOf;

        Object.defineProperty(object, 'valueOf', { 
            value: function valueOf(value) {
                if (value !== namespace || this !== object) {
                    return base.apply(this, arguments);
                } else {
                    return privates;
                }
            }
        });

        return privates;
    }

    /*
        Constructs a Name function, when given an object it will return a
        privates object. 

        @author Gozala : https://gist.github.com/1269991

        @return Function name
    */
    function Name() {
        var namespace = {};

        return function name(object) {
            var privates = object.valueOf(namespace);
            if (privates !== object) {
                return privates;
            } else {
                return defineNamespace(object, namespace);
            }
        };
    }

    var Base = {
        extend: operateOnThis(extend),
        make: operateOnThis(make),
        beget: operateOnThis(beget)
    }

    extend(pd, {
        make: make,
        extend: extend,
        beget: beget,
        extendNatives: extendNatives,
        Name: Name,
        Base: Base
    });

    exports(pd);

})(function (data) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = data;
    } else {
        window.pd = data;
    }
});