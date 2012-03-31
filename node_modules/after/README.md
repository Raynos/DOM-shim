# After [![Build Status][1]][2]

All the flow control you'll ever need

## Status: production ready

## Example

    var after = require("after"),
        next = after(3, logItWorks);

    next();
    next();
    next(); // it works

    function logItWorks() {
        console.log("it works!");
    }

## Motivation 

Minimal flow control. A lot of the libraries out there are over kill. I want a small tool that gives me fundamental concrete building blocks

## Documentation

### after(count, callback) <a name="after" href="#after"><small><sup>link</sup></small></a>

`after` takes a count and a callback and returns a function `next`. The callback get's invoked when the `next` function is invoked count number of times. The callback aggregates the data given to `next` as un-ordered parameters.

    var next = after(3, printData);

    next("foo", "bar", { ... })
    next({ ... });
    next(42);

    function printData() {
        for (var i = 0, len = arguments.length; i < len; i++) {
            console.log(arguments[i]);  
        }
        // in some order
        // 42
        // { ... }
        // [ "foo", "bar", { ... }]
    }

Note that the internal counter is exposed as `next.count` so you can manually increment or decrement it in a dynamic fashion. This is useful for recursively algorithms that want to increment the counter.

### after.unpack(arguments) <a name="unpack" href="#unpack"><small><sup>link</sup></small></a>

Unpack data from after using a convention

``` javascript
var next = after(2, function () {
    var data = after.unpack(arguments); 
    /* data = { foo: "bar", baz: "boz"}; */
});

next("foo", "bar");
next("baz", "boz");
```

### after set utilities

The following methods are asynchronous parallel versions of the `Array.prototype` methods.

They all take parameters `(set, iterator, optionalContext, finishedCallback)`

 - set : the set to operate on
 - iterator : iterator function that is called for every value in the set.
    iterator has multiple signatures. Either `(callback)` or `(value, callback)` or `(value, index, callback)` or `(value, index, obj, callback)`. The last argument is always the callback. The callback should be invoked when your done iterating over that item. You may invoke the callback with `(err, result)`
 - optionalContext : optional parameter, if given it will be the value of `this` 
    inside the iterator
 - finishedCallback : this callback is invoked when every iterator has invoked it's
    individual callback. It has a signature of `(err, result)`. The `err` parameter
    is whatever passed an error first or `null`. The result parameter is specific
    to each set utility function

Note that `reduce` has an `optionalInitialValue` instead of an `optionalContext`.

Also reduce's signature is `(memo, value, index, obj, callback)` or any of the shorter forms like `(memo, value, callback)`.

Apart from reduce and reduceRight all of these set iterators run their iterators in parallel over the set

### after.forEach(set, iterator, optionalContext, finishedCallback) <a name="after.forEach" href="#after.forEach"><small><sup>link</sup></small></a>

For `.forEach` the `result` parameter of the finishedCallback is always undefined.

    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.forEach(set, synchronizeOAuth, finished)

    function synchronizeOAuth(userObject, oAuthName, callback) {
        getOAuth(oAuthName).sychronize(userObject, callback);
    }

    function finished(err) {
        if (err) throw err;
    }

### after.map(set, iterator, optionalContext, finishedCallback) <a name="after.map" href="#after.map"><small><sup>link</sup></small></a>

For `.map` the `result` parameter of the finishedCalllback is the object your mapping too.

map will return a result that either inherits from your objects prototype or is an array depending on whether the call value is an object or an array

    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.map(set, getOAuthUser, finished);

    function getOauthUser(userObject, oAuthName, callback) {
        getOAuth(oAuthName).getUser(userObject, callback);
    }

    function finished (err, oAuthUserObjects) {
        if (err) throw err;
        for (var service in oAuthUserObjects) {
            ...
        }
    }

### after.reduce(set, iterator, optionalInitialValue, finishedCallback) <a name="after.reduce" href="#after.reduce"><small><sup>link</sup></small></a>

For `.reduce` the `result` parameter is the reduced value.

    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.reduce(set, aggregateFriends, 0, finished);

    function aggregateFriends(memo, userObject, oAuthName, callback) {
        getOAuth(oAuthName)
            .getNumberOfFriends(userObject, function (err, friends) {
                callback(err, friends + memo);
            });
    }

    function finished (err, numberOfFriends) {
        if (err) throw err;
        ...
    }
    
### after.reduceRight(...) <a name="after.reduceRight" href="#after.reduceRight"><small><sup>link</sup></small></a>

`.reduceRight` is the same as `reduce` excepts runs over the object in reverse.

### after.filter(set, iterator, optionalContext, finishedCallback) <a name="after.filter" href="#after.filter"><small><sup>link</sup></small></a>

For `.filter` the `result` is the filtered object/array.


    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.filter(set, isRegistered, finished);

    function isRegistered(memo, userObject, oAuthName, callback) {
        getOAuth(oAuthName).userExists(userObject, callback);
    }

    function finished (err, usersThatExist) {
        if (err) throw err;
        ...
    }

### after.every(set, iterator, optionalContext, finishedCallback) <a name="after.every" href="#after.every"><small><sup>link</sup></small></a>

Every passes `true` to the finished callback if every callback in the iteration passed `true`.

    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.every(set, isRegistered, finished);

    function isRegistered(memo, userObject, oAuthName, callback) {
        getOAuth(oAuthName).userExists(userObject, callback);
    }

    function finished (err, registeredOnAllServices) {
        if (err) throw err;
        ...
    }

### After.some(set, iterator, optionalContext, finishedCallback) <a name="after.some" href="#after.some"><small><sup>link</sup></small></a>

Some passes `false` to the finished callback if every callback in the iteration passed `false`.

    var set = {
        google: googleUser,
        github: githubUser,
        facebook: facebookUser
    };

    after.every(set, isRegistered, finished);

    function isRegistered(memo, userObject, oAuthName, callback) {
        getOAuth(oAuthName).userExists(userObject, callback);
    }

    function finished (err, registeredOnAnyServices) {
        if (err) throw err;
        ...
    }

## Installation

`npm install after`

## Tests

`make test`

## Blog post

[Flow control in node.js][3]

## Examples :

 - [Determining the end of asynchronous operations][4]
 - [In javascript what are best practices for executing multiple asynchronous functions][5]
 - [JavaScript performance long running tasks][6]
 - [Synchronous database queries with node.js][7]

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/after.js.png
  [2]: http://travis-ci.org/Raynos/after.js
  [3]: http://raynos.org/blog/2/Flow-control-in-node.js
  [4]: http://stackoverflow.com/questions/6852059/determining-the-end-of-asynchronous-operations-javascript/6852307#6852307
  [5]: http://stackoverflow.com/questions/6869872/in-javascript-what-are-best-practices-for-executing-multiple-asynchronous-functi/6870031#6870031
  [6]: http://stackoverflow.com/questions/6864397/javascript-performance-long-running-tasks/6889419#6889419
  [7]: http://stackoverflow.com/questions/6597493/synchronous-database-queries-with-node-js/6620091#6620091