# API

modul8's API is extremely simple, all we need to do pass a entry point and an output - in its basic form.
To add extra require domains for the client pass a dictionary of form `{name : path}`.

    var modul8 = require('modul8');
    modul8('./client/app.js')
      .domains({'shared': './shared/'})
      .compile('./out.js');

Alternatively, you can `.add()` each domain separately.

    var modul8 = require('modul8');
    modul8('./client/app.js')
      .domains()
        .add('shared', './shared/')
        .add('framework', './libs/client/')
      .compile('./out.js');

You can add any number of domains to be scanned. Files on these domains can be required specifically with `require('domain::name')`.
Both the domain and file extension can be omitted if there are no conflicts (current domain gets scanned first, .js scanned before .coffee).

The following are equivalent from a file in the root of the application domain, having the file `validation.js` in the same folder

    require('./validation.js') //relative require searches only this domain
    require('./validation') //.js extension always gets searched before .coffee
    require('validation') // resolves this domain first (but moves on if this fails)

The last form should be avoided if possible. If not careful it can pull in dependencies from other domains than intended.

More information on `require()` priority is available in [this section](require.html)

## Injecting Data

One of the eternal problems with web development is how to export data from the server to the client reliably.
State-dependent data are best transported via your normal request handlers, so this section is useful for
state-independent data, i.e. app level data like templates and server model logic.
modul8 provides two simple ways of making such data available on the client without having to duplicate files.

 - Put the data exporting CommonJS compatible file on a shared domain
 - Export the object directly onto the `data` domain

The first is good if you have static data like definitions, because they are perhaps useful to the server as well,
but suppose you want to export more ephemeral data that the server has no need for, like perhaps template versions or auto-generated client versions of server objects.
To export these to the server, you will have to obtain the data somehow, and dump the result to modul8.

The data API is simply chaining `add()` onto `data()` with data key + data or data string to add.

    modul8(dir+'/app/client/app.js')
      .data()
        .add('versions', {'user/edit':[0,3,1], 'user/profile':[1,0,0]} )
        .add('models', {user: {name:'clux', type:'String'}} ))
        .add('preserialized', "{'myKey':123}")
        .add('started', 'new Date()')
      .compile('./out.js');

Anything sent to `data()` that isn't a string will be serialized using `JSON.stringify` and evaluated back on the client.
Note that certain objects cannot be serialized properly: Date instances, for instance, will evaluate to strings on the client.
Functions will not serialize at all, and objects containing functions will likely lose those keys.

If you pass a string, it will assume to be a valid serialization or valid code and assign it verbatim on its key as code.
Thus, you should in general avoid passing down strings unless you have to. It is error prone, and can break your build
(although a quick source inspection is likely to point out where it went wrong).
If you do want to bundle extra behaviour with the data, either place this on a separate domain, or encapsulate this behaviour in a plugin with the data.

A `.data()` call alternatively be made with an object of key=>string/serializableObj instead of chaining the key,vals on `.add()` individually.

The data attached above can be obtained on the client via `require()`

- `require('data::models')`  -> {user: {name:'clux', type:'String'}}
- `require('data::versions')['user/edit']`  -> [0,3,1]
- `require('data::started').getTime()` -> 1320697746356
- `require('data::preserialized').myKey` -> 123

## Using Plugins

Plugins are perhaps the coolest feature of modul8. They are neat shortcuts for exporting both data and code to a domain.
This means the code can come with the data it depends on can be joined on the server so that you get a very modular programming structure.
Note that all code that is exported by plugins have to be explicitly required to actually get pulled into the bundle.

Plugins can typically be used by calling `.use()` with a `new Plugin(opts)` instance.

    modul8('./client/app.js')
      .use(new Plugin())
      .compile('./out.js');

An intro to available plugins, and how to write them is available in the [plugin section](plugins.html).

## Code Analysis

To dynamically resolve dependencies from a single entry point, modul8 does a recursive analysis what is passed to `require()`.
Note that modul8 enforces a **no circular dependencies rule**. Granted, this is possible with sufficient fiddling,
but it brings one major disadvantages to the table:

A circularly dependent set of modules are inherently tightly coupled; they are less a no longer a set of moudles, but more like a library.
There are plenty of reasons why tight coupling is bad. Some of these reasons,
including a bunch of general advice to achieve good modularity can be found [here](modularity.html).

Additionally, circular dependencies cannot be easily visualized anymore as the tree structure of requires is lost.
With the no circulars rule enforced, we can print a pretty `npm list`-like dependency tree for your client code.

    app::main
    ├──┬app::controllers/user
    │  └───app::models/user
    ├──┬app::controllers/entries
    │  └───app::models/entry
    └──┬shared::validation
       └───shared::defs

While this usually grows much lot bigger than what is seen here, by putting this in your face at every change, it helps you identify what pieces of code
that perhaps should not need to be required at a particular point. In essence, we feel this helps promote more loosely coupled applications.
We strongly encourage you to use it if possible. The API consists of chaining 1-3 methods on `analysis()`, or using it directly (further below)

    modul8('app.js')
      .domains({app : dir+'/app/client/'})
      .analysis()
        .output(console.log)
        .prefix(false)
        .suffix(true)
        .hide('external')
      .compile('./out.js');

The `output()` method must be set for `analysis()` to have any effect.
It must take either a function to pipe the tree to, or a filepath to write it out to.

The additional boolean methods, `prefix()` and `suffix()` simply control the layout of the printed dependency tree.
Prefix refers to the domain (name::) prefix that may or may not have been used in the require, and similarly, suffix refers to the file extension.
Defaults for thes are : `{prefix: true, suffix: false}`.

The `.hide()` call specifies what domains to suppress in the dependency tree. Takes a domain name string or an array of such strings.

The analysis call can be shortcutted with a direct (up to) four parameter call to `.analysis()` with parameters output, prefix, suffix, hide.
So the above could be done with

    .analysis(console.log, false, true 'external')

Of course, you can also mix and match.

    .analysis(console.log)
      .hide('external')


## Adding Libraries

Appending standard (window exporting) JavaScript and CoffeeScript files is easy. Call `.libraries()` and chain on your options as below.
CoffeeScript libs / AltJS libs are compiled with the safety wrapper, whereas plain JavaScript is simply concatenated on bare.

    modul8('./app/client/app.js')
      .libraries()
        .list(['jQuery.js','history.js'])
        .path('./app/client/libs/')
        .target('./out-libs.js')
      .compile('./out.js');

Note that without the `.target()` option added, the libraries would be inserted in the same file before you application code.

Alternatively, there is a succinct syntax to provide all libraries options in one call. Where the third parameter is not required.

    modul8(dir+'/app/client/app.js')
      .libraries(['jQuery.js','history.js'], './app/client/libs/', './out-libs.js')
      .compile('./out.js');


Note that libraries tend to update with a different frequency to the main client code. Thus, it can be useful to separate these from your main application code.
Modified files that have already been downloaded from the server simply will illicit an empty 304 Not Modified response when requested again. Thus, using `.target()` and
splitting these into a different file could be advantageous from a bandwidth perspective.

If you would like to integrate libraries into the require system check out the documentation on `arbiters()` below.

#### Libraries CDN Note
Note that for huge libraries like jQuery, you may benefit (bandwidth wise) by using the [Google CDN](http://code.google.com/apis/libraries/devguide.html#jquery).
In general, offsourcing static components to load from a CDN is a good first step to scale your website.
There is also evidence to suggest that splitting up your files into a few big chunks may help the browser load your page faster, by downloading the scripts in parallel.
Don't overdo this, however. HTTP requests are still expensive. Two or three JavaScript files for your site should be plenty using HTTP.

#### Libraries + require()
Libraries do not show up in the dependency tree by default as they are not required, but rather implicitly available through globals.
This can be changed by configuring arbiters for the globals in the require system. See the arbiters section below.

#### Libraries List order
Libraries passed to `list()` must be in the same order you would normally order your script tags.
modul8 does not scan libraries in any way.

## Middleware

Middleware come in two forms: pre-processing and post-processing:

 - `.before()` middleware is applied before analysing dependencies as well as before compiling.
 - `.after()` middleware is only applied to the output right before it gets written.

modul8 comes bundled with one of each of these:

 - `modul8.minifier` - post-processing middleware that minifies using `UglifyJS`
 - `modul8.testcutter` - pre-processing middleware that cuts out the end of a file (after require.main is referenced) to avoid pulling in test dependencies.

To use these they must be chained on `modul8()` via `before()` or `after()` depending on what type of middleware it is.

    modul8('app.js')
      .before(modul8.testcutter)
      .after(modul8.minifier)
      .compile('./out.js');

**WARNING:** testcutter is not very intelligent at the moment, if you reference `require.main` in your module,
expect that everything from the line of reference to be removed.
If you do use it, always place tests at the bottom of each file, and never use wrapper functions inside your scripts (as the `});` bit will get chopped off).
This should be easy as modul8 wraps everything for you anyway - it even wraps to hold off execution until the DOM is ready.
It could, however, pose problems in more specialized situations.

## Settings

Below are the settings available:

   - `domloader`  A function or name of a global fn that safety wraps code with a DOMContentLoaded barrier
   - `namespace`  The namespace modul8 uses in your browser, to export console helpers to, defaulting to `M8`
   - `logging`    Boolean to set whether to log `require()` calls in the console, defaults to `false`
   - `force`      Boolean to set whether to force recompilation or not - should only be useful when working on modul8 itself.

**You SHOULD** set `domloader` to something. Without this option, it will NOT wait for the DOM and simply wrap all main application code
in a anonymous self-executing function.

If you are using jQuery simply set this option to `jQuery` (and it will also deal with the possibility of jQuery being arbitered).

Alternatively, you could write your own implementation function and pass it as the parameter to `.set('domloader', param)`.
The following is the equivalent function that is generated if `jQuery` is passed in:

    domloader_fn = function(code){
     return "jQuery(function(){"+code+"});"
    };

Note that the namespace does not actually contain the exported objects from each module, or the data attachments.
This information is encapsulated in a closure. The namespace'd object simply contains the public debug API.

Options can be set by chaining them on `modul8()` using the `set(option, value)` method. For example:

    modul8('./client/app.js')
      .set('namespace', 'QQ')
      .set('domloader', '$(document).ready')
      .set('logging', 'ERROR')
      .compile('./out.js');

Logging has 3 levels at the moment

- ERROR
- INFO
- DEBUG

They have cumulative ordering:

- ERROR will only give failed to resolve require messages in the client console via `console.error`.
- INFO additionally gives recompile information on the server (via internal logger class).
- DEBUG adds log messages from require on the client to show what is attempted resolved via `console.log`.

ERROR level will not give any messages on the server, but if you don't even want the fail messages from require, you may disable logging altogether by pasing in false.
Note that ERROR is the default.

## Environment Conditionals

We can conditionally perform the following action, if __NODE_ENV__ matches specified environment.

    modul8(dir+'/app/client/app.js')
      .in('development').after(modul8.minifier)
      .in('development').compile('./out.js')
      .in('production').compile('./out.js');

The environment conditionals may be applied to several calls:

    modul8(dir+'/app/client/app.js')
      .in('development')
        .after(modul8.minifier)
        .analysis()
          .output(console.log)
          .prefix(true)
          .suffix(false)
        .domains()
          .add('debug', dir+'/app/debug/')
      .in('production')
        .libraries()
          .list(['analytics.js'])
          .path(dir+'/app/client/libs/')
      .in('all')
       .compile('./out.js');

If we perform the same action for environments, set them before
the first `in()` call, or use `in('all')`.

## Live Extensions

It is plausible you may want to store requirable data or code inside modul8's module containers.
Perhaps you have a third-party asynchronous script loader, and you want to attach the resulting object onto some appropriate domain.

This is an issue, because `require()` calls are analysed on the server before compilation, and if you reference something that will be loaded in
separately, it will not be found on the server. The solution to this is the same solution modul8 uses to allow data domain references; whitelisting.

The domains `M8`, `data` and `external` have been whitelisted for this purpose, and an API exists on the client.
The `M8` domain is reserved for arbiters and can only be extended from the server, but the other two have a public API from the client.
But note that no other domains can be manipulated on the client.

You can access the API from your application code by referencing modul8's single global object. The name of this object can be changed through the `namespace` setting,
and by default it is set to `M8`, but we refer to it here simply as `ns` to avoid confusion with the `M8` domain.

Note that the `ns` object stores simply the API to interact with the data, not the actual data. You have to `require()` if you want to actually get it.

  - `ns.data` - is a function(name, object) - manipulating data::name
  - `ns.external` -  function(name, object) - manipulating external::name

Both these functions will overwrite on repeat calls. For example:

    ns.data('libX', libXobj);
    require('data::libX'); // -> libXobj

    ns.data('libX', {});
    require('data::libX'); // -> {}

    ns.data('libX'); //unsets
    require('data::libX'); // -> undefined

And similarly for `ns.external`.
See the debug section for how to log the `external` and `data` domains.

## Debugging

If you have wrongly entered data to `require()`, you will not get any information other than an undefined reference back.
Since all the exported data is encapsulated in a closure, you will also not be able to locate it from the console.

To see where the object you are looking for should live or lives, you may find it useful to log the specified domain object
with the globally available `ns.inspect(domainName)` method. Additionally, you may retrieve the list of domains modul8 tracks using the
`ns.domains()` command.

If you want every `require()` call to be logged to the console, you can set the `logging` setting appropriately.
The `ERROR` level is recommended as it will tell you when a `require()` call failed.

There is additionally a console friendly require version globally available at `ns.require()`.
This acts as if you were a file called 'CONSOLE' in the same folder as your entrypoint, so you can use relative requires to get application code there..

## Arbiters

These help reveal invisible dependencies by reduce the amounts global variables in your code.

    modul8(dir+'/app/client/app.js')
      .libraries(['jQuery.js','Spile.coffee'], dir+'/app/client/libs/')
      .arbiters()
        .add('jQuery', ['$', 'jQuery'])
        .add('Spine')
      .compile(dir+'/out.js');

This code would delete objects `$`, `jQuery` and `Spine` from `window` and under the covers add closure bound alternatives you can `require()`.
The second parameter to `arbiters().add()` is the variable name/names to be deleted. If only a single variable should be deleted,
it can be entered as a string, but if this is the same as as the arbiter's name, then it can be omitted completely - as with Spine above.

Arbitered libraries can be should be referenced simply with `require('jQuery')`, or `require('M8::jQuery')` it there is a conflicting
jQuery.js file on your current domain. Normally this specificity should not be required.

Alternative adding syntax is to add an object directly to `arbiters()`

    .arbiters({
      jQuery : ['$', 'jQuery']
      Spine  : Spine
    })

Or even simpler:

    .arbiters(['$','jQuery', 'Spine'])

But note that this version has a slightly different meaning - it adds them all without a second parameter, i.e.

- `require('$')` and `require('jQuery')` would both resolve whereas above only `require('jQuery')` would.


## Registering a Compile-to-JS Language

It is possible to extend the parsers capabilities by sending the extension and compiler down to modul8.
For instance, registering Coffee-Script (if it wasn't already done automatically) would be done like this

    var coffee = require('coffee-script');
    modul8('./client/app.js')
      .register('.coffee', function(code, bare){
        coffee.compile(code, {bare:bare})
      })
      .compile('./out.js');

Note the boolean `bare` option is to let modul8 fine tune when it is necessary to include the safety wrapper - if the compile to language includes one by default.

CoffeeScript uses a safety wrapper by default, but it is irrelevant for application code as we define-wrap each file in a function anyway.
However, if you included library code written in CoffeeScript, then modul8 will call the compile function with bare:false.

You should implement the bare compilation option if your language supports it, as an optimization (less function wrapping for app code). If your code already contains wrapper,
or if your language always safety-wraps, then this is fine too.
