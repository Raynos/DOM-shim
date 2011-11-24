# Extensible CommonJS browser code sharing
## Intro

Write a `main.js` as the application entry point

````javascript
var determine = require('./determine');
console.log(determine.isCool(['clux', 'lava']));
````

the required module `determine.coffee` (or .js if you prefer)

````coffeescript
cool = require('shared::cool') # cross-domain require
exports.isCool = (input) -> input.filter(cool)
````

and finally its required `cool.js` on the `shared` domain [?](http://clux.github.com/modul8/docs/xcjs.html#modul8extensions)

````javascript
module.exports = function(name){
  return (name === 'clux');
};
````

To compile these files invoke `modul8()` and chain on options

````javascript
var modul8 = require('modul8');

modul8('./client/main.js')
  .domains({'shared': './shared/'})
  .compile('./out.js');
````

This will construct a single, browser compatible `out.js` in your execution path, and the generated dependency tree will look as follows:

    app::main
    └──┬app::determine
       └───shared::cool

The shared code is independent of the application and **can be reused on the server**.

Compilation can also be performed via the command line interface by typing

````bash
$ modul8 client/main.js -p shared:shared/ > out.js
````

from the path containing the shared/ and client/ folders.

To load the browser compatible output file from your site simply stick it in the HTML

````html
<script src="/out.js"></script>
````

## Quick Overview

modul8 is an extensible CommonJS code packager and analyzer for JavaScript and CoffeeScript web applications.
Applications are recursively analyzed for dependencies from an entry point and will pull in + compile just what is needed.

Code can be shared with the server by isolating modules/libraries in  shared _domains_. This means stand alone logic
can exist on the server and be referenced via a normal `require(dir+'module')`, but also be referenced via `require('shared::module')` on the client.

To give you full overview and control over what code is pulled in, modul8 automatically generates a depedency tree. This allows
fast analysis and identification of extraneous links, and becomes a very important tool for refactoring.

modul8 supports live extensions of certain exports containers via third party script loaders, and server side data injection at compile time.

Lastly, modul8 aims to eliminate most global variables from your code. It does so using the following approaches

 - Encapsulate all exported data in the closure inhabited by `require()`
 - Incorporate globally available libraries into the module system via automatic arbiters

To dive in properly; consult the [api docs](http://clux.github.com/modul8/docs/api.html).

## Features

 - highly extensible client side require
 - simple and safe code sharing between the server and the client
 - dynamic resolution and compilation of dependencies server-side
 - compatible with JavaScript, CoffeeScript or (configurable) AltJS languages
 - low footprint: ~1kB (minified/gzipped) output size inflation
 - enforces modularity best practices and logs an npm style dependency tree
 - can inject data to require dynamically from the server or live from the client
 - easy to write, modular plugins allows super easy client extensions with server logic and data
 - minimizes global usage, encapsulates exports in closures, absorbs library globals
 - only rebuilds on repeat calls if necessary (files modified || options changed)
 - ideal for single page web applications, 1 or 2 HTTP request to get all code

## Installation

Install the library:

````bash
$ npm install modul8
````

Install the command line tool:

````bash
$ npm install -g modul8
````

Download the development version:

````bash
$ git clone git://github.com/clux/modul8
````

## Usage
Basic use only only the path to the entry point and an output.

````javascript
modul8('./client/app.js').compile('./out.js');
````

This compiles everything referenced explicitly through `app.js` to the single browser compatible `out.js`.


Every `require()` call is tracked and the resulting dependency tree is loggable. Cross domain `require()`s are namespaced
C++ style: `require('shared::validation')` will look for a `.js` then `.coffee` file named `validation` on the shared domain.
This extra domain must be configured using a chained `.domains()` call:

````javascript
modul8('./client/app.js')
  .domains({'shared': './shared/'})
  .compile('./out.js');
````

To ensure that the `shared` domain here can work on the server and the client, any `require()` calls within domains
should be relative and not pull in anything outside that folder.
As an example, a same-origin require of `shared::defs` should be done with a **./** prefix:  `require('./defs')`.

The dependency analyzer will typically output something like this if configured

    app::app
    ├──┬app::controllers/user
    │  └───app::models/user
    ├──┬app::controllers/entries
    │  └───app::models/entry
    ├──┬shared::validation
    │  └───shared::defs
    └───M8::jQuery

`jQuery` can be seemlessly integrated (and will show up in the dependency tree as above) by using `.arbiters()`

## Injecting Data

Data can by injected at compile time from the server by specifying keys and evaluable strings.

````javascript
modul8('./client/app.js')
  .data({'models': {'user':'clux'}})
  .compile('./out.js');
````

The `data` domain is initialized from the server with every key specified to `.data()`, but can be extended live on the client.
The data API is particularly useful for web applications that needs particular application data to always be bundled.
Anything that can be serialized (including pre-serialized javascript input) can be sent to the data domain.

## Using Plugins
Extending the data domain in conjunction with creating specialized domains to handle that data,
is a popular method that can be employed by node modules to break browser code down into more managable chunks - while linking them to the server.

This is so useful that it has become the defacto plugin API.

````javascript
modul8('./client/app.js')
  .use(new Plugin(opts))
  .compile('./out.js');
````

This will allow the Plugin to extend 'out.js' with data created in Plugin, as well as add a namespaced require domain on the browser.
Using a Plugin will inflate 'out.js' by the size of the data it creates plus **only the size of the modules you explicitly `require()`**.

Thus, adding plugins is a remarkably safe, monitorable, and robust way, to get discrete units of code - that shares logic with the server - to the client.

Writing your own plugins is also really easy. Please share.

### Available Plugins

- [m8-mongoose](https://www.github.com/clux/m8-mongoose)
- [m8-templation](https://www.github.com/clux/m8-templation)

## External Injection

Finally, modul8 defines an `external` domain for asynchronous script loaders to dump their results. This domain can only be used and extended from the client.

Both the `data` and `external` domains are only allowed to be modified through safe proxies. Objects residing on these domains can be referenced
with `require()` without messing up the compile time code analysis, but they can still show up in the dependency tree if desirable.

## Learn more

The [full documentation site](http://clux.github.com/modul8) should contain everything you could ever want to know about modul8 and probably more.
Read it, try it out, and give feedback if you like or hate it / parts of it, or if you want to contribute.

modul8 is my first proper open source project. It was crafted out of necessity, but it has grown into something larger.
Version 1.0 should be ready relatively soon - so the current code can be considered mostly stable.

Version 0.10.0 and up should work fine with node v0.6.

## Compatibility
Compiled code will work with ES5 compatible browsers (recent browsers minus Opera)
If you target older browsers, include [ES5-shim](https://github.com/kriskowal/es5-shim).

## Running Tests

Install development dependencies

````bash
$ npm install
````

Run the tests
````bash
$ npm test
````

This was actively tested with node 0.4.10-12 until very recently.
It is now exclusively tested with the 0.6 (>=0.6.1) branch.

## License

MIT Licensed - See LICENSE file for details
