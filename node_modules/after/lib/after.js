(function _anonymousWrapper() {
    "use strict";   

    var slice = [].slice;

    after.forEach = handleMultipleArguments(forEach);
    after.map = handleMultipleArguments(map);
    after.reduce = handleMultipleArguments(reduce);
    after.filter = handleMultipleArguments(filter);
    after.some = handleMultipleArguments(some);
    after.every = handleMultipleArguments(every);
    after.reduceRight = handleMultipleArguments(reduceRight);
    after.unpack = unpack;

    if (typeof module !== "undefined") {
        module.exports = after;
    } else {
        window.after = after;
    }

    /*
        after takes a callback and returns a proxy function. If you invoke the
            proxy function count number of times then the callback fires

        @param Number count - number of times you need to invoke proxy
            before the callback fires
        @param Function callback - callback to fire

        @return Function proxy { count: Number } - proxy function you 
            need to invoke count times before callback fires. 
            The count property of the proxy function is the internal 
            counter for when the callback should fire. 
            If the internal counter is 0 then the callback fires.
    */
    function after(count, callback) {
        var results = [];

        proxy.count = count;

        return (count === 0) ? callback() : proxy;

        function proxy() {
            results.push(arguments);

            --proxy.count === 0 && callback.apply(this, results);
        }
    }

    function unpack(data) {
        var obj = {};
        [].forEach.call(data, function (tuple) {
            obj[tuple[0]] = tuple[1];
        });
        return obj;
    }

    /*
        forEach takes a set and invokes the callback on it for each key 
            in the set. The callback should invoke the next function passed 
            to it when it's done.
    */
    function forEach(obj, callback, context, next, keys, length) {
        keys.forEach(loop);

        function loop(key) {
            var value = obj[key];

            invokeCallback(callback, context, value, key, obj, proxy);

            function proxy(err) {
                if (err) return next(err);
                if (--length === 0) {
                    return next();
                }
            }
        }
    }

    function map(obj, callback, context, next, keys, length) {
        var returnValue = createReturnValue(obj);
        keys.forEach(loop);

        function loop(key) {
            var value = obj[key];

            invokeCallback(callback, context, value, key, obj, proxy);

            function proxy(err, value) {
                if (err) return next(err);
                returnValue[key] = value;
                if (--length === 0) {
                    return next(null, returnValue);
                }
            }
        }
    }


    function reduce(obj, callback, memo, next, keys, length) {
        if (memo === null) {
            memo = obj[keys.shift()];
            length--;
        }

        (function loop() {
            var key = keys.shift(),
                value = obj[key];
            
            if (length-- === 0) {
                return next(null, memo);
            }

            invokeCallback(callback, null, memo, value, key, obj, proxy);

            function proxy(err, value) {
                if (err) return next(err);
                memo = value;
                loop(); 
            }
        }());
    }

    function filter(obj, callback, context, next, keys, length) {
        var returnValue = createReturnValue(obj);
        keys.forEach(loop);
        
        function loop (key) {
            var value = obj[key];

            invokeCallback(callback, context, value, key, obj, proxy);

            function proxy(err, bool) {
                if (err) return next(err);
                if (bool) returnValue[key] = value;
                if (--length === 0) {
                    return next(null, returnValue);
                }
            }
        }
    }

    function some(obj, callback, context, next, keys, length) {
        keys.forEach(loop);

        function loop (key) {
            var value = obj[key];

            invokeCallback(callback, context, value, key, obj, proxy);

            function proxy(err, bool) {
                if (err) {
                    next(err);
                    next = noop;
                } else if (bool === true) {
                    next(null, true);
                    next = noop;
                } else if (--length === 0) {
                    next(null, false);
                }
            }
        }
    }

    function every(obj, callback, context, next, keys, length) {
        keys.forEach(loop);

        function loop(key) {
            var value = obj[key];

            invokeCallback(callback, context, value, key, obj, proxy);

            function proxy(err, bool) {
                if (err) {
                    next(err);
                    next = noop;
                } else if (bool === false) {
                    next(null, false);
                    next = noop;
                } else if  (--length === 0) {
                    next(null, true);
                }
            }
        }
    }

    function createReturnValue(obj) {
        if (Array.isArray(obj)) {
            return [];
        } else {
            return Object.create(Object.getPrototypeOf(obj));
        }
    }

    function reduceRight(obj, callback, memo, next, keys, length) {
        reduce(obj, callback, memo, next, keys.reverse(), length);
    }

    function noop() { }

    function handleMultipleArguments(f) {
        return proxy;

        function proxy(obj, callback, context, next) {
            if (typeof context === "function") {
                next = context;
                context = null;
            }

            var keys = Object.keys(obj);
            if (keys.length === 0) {
                next(null, obj)
            } else {
                f(obj, callback, context, next, keys, keys.length);
            }
        }
    }

    function invokeCallback(callback, context, memo, value, key, obj, next) {
        var callbackLength = callback.length;

        if (typeof obj === "function") {
            next = obj;
            obj = null;
        }

        if (callbackLength === 1) {
            callback.call(context, next);
        } else if (callbackLength === 2) {
            callback.call(context, memo, next);
        } else if (callbackLength === 3) {
            callback.call(context, memo, value, next);
        } else if (callbackLength === 4) {
            callback.call(context, memo, value, key, next);
        } else {
            callback.call(context, memo, value, key, obj, next);
        }
    }
}());
