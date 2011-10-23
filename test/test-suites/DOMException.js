suites["test DOMException"] = {
    "test name": function (t) {
        var e = Object.create(DOMException.prototype);
        e.code = 18;
        t.equal(e.name, "SECURITY_ERR", "name value is not equal to the code");
        t.done();
    }
};