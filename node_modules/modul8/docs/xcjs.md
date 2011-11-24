# Extended CommonJS

This is going to contain more advanced background about what a general module systems do, and, finally, what
distinguishes modul8 from plain CommonJS.

## CommonJS Parsing
Or, how a module system works.

### JavaScript Modules

JavaScript has no module system.

_we're off to a great start.._

On the other hand, got functions. Functions with closures.

    (function(){
      var private = 5;
      window.publicFn = function(){
        console.log(private);
      }
    })();

This is the commonly employed method of encapsulating and exposing objects and functions that can reference private variable through a closure.
This works; `private` is inaccessible outside this anonymous function.

Unfortunately, this just exposes publicFn to the global window object. This is not ideal, as anything, anywhere can just reference it, leaving
us not much wiser. True modularity is clearly impossible when things are just lying around freely like this for everyone. It is fragile, and
it is error prone as conflicting exports will actually just favour the last script to execute - as JavaScript simply runs top to bottom, attaching its
exports to window as we go along. Clearly we need something better than this.

### CommonJS Idea

There is a way to fix this, but first of all it assumes all modules need to support a stadardised format for exporting of modules.
CommonJS is a such a standardization. It has very large traction at the moment, particularly driven by server side environments such as NodeJS.

Its ideas are simple. Each module avoids the above safety-wrapper, must assume it has a working `require()`,
and instead of attaching its exports to a global object, it attaches them to an opaque `exports` object.
Alternatively, it can replace the `module.exports` object to define all your exports at once.

By making sure each module is written this way, CommonJS parsers can implement clever trickery on top of it to make this behaviour work.
I.e. having each module's exports objects stored somewhere for `require()` and allocating a singleton for each module.

### CommonJS Basics

From the above rationale, it is clear that a CommonJS parser must turn this:

    var private = 5;
    var b = require('b');
    exports.publicFn = function(){
      console.log(private);
    };

into something like this:

    var module = {};
    (function(require, module, exports){
      var private = 5;
      var b = require('b');
      exports.publicFn = function(){
        console.log(private);
      };
    })(makeRequire(location), module, stash[location])
    if (module.exports) {
      delete stash[location];
      stash[location] = module.exports;
    }

where `location` is a unique identifier passed down from the compiler to indicate where the module lives, so that `require()` can later retrieve it.
The `makeRequire()` factory must be able to construct specifically crafted `require()` functions for given locations.
Finally, `stash` will be a pre-defined object on which all modules are exported.

Wrapping up this behaviour inside a function, we can write something like this.

    define(location, function(require, module, exports) {
      var private = 5;
      var b = require('b');
      exports.publicFn = function(){
        console.log(private);
      }
    });

The `makeRequire()` and `define()` functions can cleverly be defined inside a closure with access to `stash`. This way only these functions can access your modules.

If the module system simply created a global namespace for where your modules resided, say, `stash = window.ModuleSystem`, then this would be **bad**.
You could still bypass the system and end up requiring stuff implicitly again.

modul8 encapsulates such a `stash` inside a closure for `require()` and `define()`, so that only these functions + a few carefully constructed functions to
debug export information and require strings.

#### Code Order
Now, a final problem we have glossed over is which order the modules must be included in. The module above requires the module `b`.
What happens if this module has not yet been placed in the document? Syntax error. The indepentent modules must be included first.

To solve this problem, you can either give a safe ordering yourself - which will become increasingly difficult as your application grows in size -
or you can resolve `require()` calls recursively to create a dependency tree.

modul8 in particular, does so via excellently simple `detective` module that constructs a full Abstract Syntax Tree before it safely scans for `require()` calls.
Using `detective` data, a tree structure representing the dependencies can be created. modul8 allows printing of a prettified form of this tree.

    app::main
    ├───app::forms
    ├──┬app::controllers/user
    │  └──┬app::models/user
    │     └───app::forms
    ├──┬app::controllers/entries
    │  └───app::models/entry
    └──┬shared::validation
       └───shared::defs

It is clear that the modules on the edges of this tree must get required first, because they do not depend on anything. And similarly,
the previous level should be safe having included the outmost level. Note here that `app::forms` is needed both by
`app:moduls/user` and `app::main` so it must be included before both. Thus, we only care about a module's outmost level.

Thus, to order our modules correctly, we must reduce the tree into an unique array of modules and their (maximum) level numbers,
and simply sort this by their level numbers descending.

## modul8's CommonJS Extensions
### Require Path Problem
Whilst maintaining compatibility with the CommonJS spec, we have extended `require()` to ameliorate one common problem.

 - `require()` calls is a simple (clash prone) object property look-up on `stash[reqStr]`

We wanted to be able to share code between the server and the client by essentially having multiple _require paths_.
But require paths force you to scan all of them, with no way of specifying what path to do your look-up on. It also would
make it very difficult to whitelist injected data from the server resolver - as it could simply find files with the same names as your data somewhere..

The relation between the paths are also lost on the browser, so there is no sense in maintining any illusions about this by using traditional require paths.

### Domains
In the end, namespacing each path became the accepted solution. To distinguish them from typical require paths, we refer to them as _domains_ or _require domains_.

This also simplifies implementation as well, as we can create one object container directly on `stash` for each domain with key equal to its name.

Additionally, we can make `require()` functions that knows which domains to look on by passing this extra parameter on from the compiler,
down to `define`, and finally, down to the require factory.

The result is that, with modul8, we can `require()` files relatively as if it was on a 100% CommonJS environment,
but we could also do cross-domain `require()` by using C++ style namespacing, e.g. calls like `require('shared::helper.js')`
to get access to code on a different domain that does not rely on the DOM, which can be required directly on the server as well.

To get the most out of this deal, having domains that are server-clean and client-clean are therefore advantageous.
I.e. it should not reference something from outside its base directory to work on the client, and it should not reference DOM/client specific elements to work on the server.

Domains also provide 3 more areas of use that each get their own reserved domain.

#### Arbiters
modul8 hates globals. They ruin otherwise solid modularity. Thus, it desperately tries to integrate globally exported libraries into its require system.
It removes the global shortcut(s) from your application code and inserts them onto the reserved `M8` domain.
Why we (can and sometimes) want to do this is explained in the [modularity doc](modularity.html), whilst
the feature is fully documented in the [API](api.html).

#### Live Extensions
Because we have a `require()` function available in all the application code, and because this is synchronous (in the sense that it has been resolved on the server already),
we migth want to extend our requiable data with results from third-party asynchronous script loaders.
There's an `external` domain for that, and a client API for it. It's documented in the [API doc](api.html).

#### Direct Extension
Finally, modul8 allows exporting of data that exists on the server, without having to add separate script tags for them.
The `data` domain contains all such data, and like all the above, it can be gotten with `require()`. The [API doc](api.html) contains how to use it.
