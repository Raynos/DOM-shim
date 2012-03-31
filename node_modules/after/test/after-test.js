var assert = require("assert"),
    after = require("../lib/after.js");

suite("After", function () {
    test("exists", function () {
        assert(typeof after === "function", "after is not a function");
        assert(after.forEach, "forEach");
        assert(after.map, "map");
        assert(after.reduce, "reduce");
        assert(after.reduceRight, "reduceRight");
        assert(after.every, "every");
        assert(after.filter, "filter");
        assert(after.some, "some");
    });

    suite("after", function () {
        test("after when called with 0 invokes", function (done) {
            after(0, done);
        });

        test("after 1", function (done) {
            var next = after(1, call(done));
            next();
        });

        test("after 5", function (done) {
            var next = after(5, call(done)), i = 5;
            while (i--) {
                next();
            }
        });

        test("manipulate count", function (done) {
            var next = after(1, call(done)), i = 5;

            next.count = i;
            while (i--) {
                next();
            }
        });

        test("after arguments", function (done) {
            var next = after(2, function () {
                assert(arguments[0][0] === data);
                assert(arguments[1][0] === data);
                assert(arguments[1][1] === data);
                done();
            }), data = {};

            next(data);
            next(data, data);
        });

        test("unpack", function () {
            var next = after(2, function () {
                var data = after.unpack(arguments);
                assert(data.foo === "foo");
                assert(data.bar === "bar");
            });

            next("foo", "foo");
            next("bar", "bar");
        })
    });

    var obj = {
        "foo": "bar",
        "foo1": "bar1",
        "foo2": "bar2"
    }

    suite("iterators", function () {
        test("multiple APIs", function (done) {
            done = after(4, call(done));

            after.forEach(obj, function (next) {
                assert(typeof next === "function");
                next();
            }, done);

            after.forEach(obj, function (value, next) {
                assert(typeof next === "function");
                next();
            }, done);

            after.forEach(obj, function (value, key, next) {
                assert(typeof next === "function");
                next();
            }, done);

            after.forEach(obj, function (value, key, obj, next) {
                assert(typeof next === "function");
                next();
            }, done);
        });

        test("context", function (done) {
            after.forEach(obj, function (next) {
                assert(this === obj);
                next();
            }, obj, call(done));
        });

        test("errors", function (done) {
            done = after(3, call(done));
            after.forEach(obj, function (next) {
                next(new Error("lulz"));
            }, obj, function (err) {
                assert(err.message === "lulz");
                done();
            })
        })
    });

    suite("forEach", function () {
        test("forEach on object", function (done) {
            after.forEach(obj, function (value, key, next) {
                assert(obj[key] === value);
                next();
            }, function () {
                done(); 
            });
        });

        test("forEach on empty array", function (done) {
            after.forEach([], function () {

            }, function () {
                done()
            })
        })
    });

    suite("map", function () {
        test("map on object", function (done) {
            after.map(obj, function (value, next) {
                next(null, value + value);
            }, function (err, o) {
                Object.keys(o).forEach(function (key) {
                    assert((obj[key] + obj[key]) === o[key]);
                });
                done();
            });
        });

        test("mapping over an array returns an array", function (done) {
            after.map([1], function (value, next) {
                next(null, value);
            }, function (err, arr) {
                assert(Array.isArray(arr));
                done();
            });
        });

        test("mapped object has same prototype", function (done) {
            var o = {};
            after.map(Object.create(o, { 
                foo: { 
                    value: 42, 
                    enumerable: true
                } 
            }), function (next) {
                next(null, 42); 
            }, function (err, obj) {
                assert(Object.getPrototypeOf(obj) === o);
                done();
            });
        });
    });

    suite("reduce", function () {
        test("reduce on object", function (done) {
            var count = 0;
            after.reduce(obj, function (memo, value, next) {
                count++;
                next(null, memo + value);
            }, function (err, str) {
                assert(str === "barbar1bar2");
                assert(count === 2);
                done();
            });
        });
    });

    suite("reduceRight", function () {
        test("reduceRight on object", function (done) {
            after.reduceRight(obj, function (memo, value, next) {
                next(null, memo + value);
            }, function (err, str) {
                assert(str === "bar2bar1bar");
                done();
            }); 
        });
    });

    suite("filter", function () {
        test("filter on object", function (done) {
            after.filter(obj, function (value, next) {
                next(null, value === "bar");
            }, function (err, obj) {
                assert(Object.keys(obj).length === 1);
                assert(obj.foo === "bar");
                done();
            });
        }) 
    });

    suite("every", function () {
        test("every on object", function (done) {
            var called = 0;
            after.every(obj, function (next) {
                called++;
                next(null, true);
            }, function (err, obj) {
                assert(obj === true);
                assert(called === 3);
                done();
            });
        });
    });

    suite("some", function () {
        test("some on object", function (done) {
            var called = 0;
            after.some(obj, function (next) {
                called++;
                next(null, true);
            }, function (err, obj) {
                assert(obj === true);
                assert(called === 1);
                done();
            }); 
        })
    })
});

function call(f) {
    return function () {
        f();
    };
}