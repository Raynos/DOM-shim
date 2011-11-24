# Plugins

## Overview

Plugins are shortcuts for exporting both data and code to a domain. They facilitate getting data and their helpers to the browser as one unit,
and help encapsulate logic for the server. Additionally, if designed well, code can be reused on the server on the client.

Plugins can typically be used by calling `.use()` with a `new PluginName(opts)` instance.

    modul8('./client/app.js')
      .use(new PluginName(opts))
      .compile('./out.js');

Note that all code that is exported by plugins have to be explicitly required to actually get pulled into the bundle.

Plugins can also be loaded - albeit somewhat primitively - via the [CLI](cli.html)

## Available Plugins
A small current selection of available plugins follow. This section might be moved to the wiki.

### Template Version Control System
A simple version control system for web application templates.

If a web application wishes to store all its templates in localStorage, then they can become out of date with the server as they update there.
This module allows these states to simply synchronize with the server.

See the [project itself](https://github.com/clux/m8-templation) for more information and sample model implementations.

### Mongoose in the Browser
A way to use mongoose models on the server to generate validation logic on the client.

A web application using mongodb as its backend and using mongoose as an ORM layer on the server ends up defining a lot of validation logic on the server.
Logic that should be reused on the client. The mongoose plugin will export sanitized versions of your explicitly exported mongoose models, along with helpers
to utilize this data in a helpful way.

See the [project itself](https://github.com/clux/m8-mongoose) for more information.


# Writing Plugins
A plugin can export as many things as it wants to be used on the server, but it needs a class instance of a particular format to be compatible with modul8.

## Structure
The skeleton of such a plugin class should look something like this in CoffeeScript

    class Plugin
      constructor : (@name='PluginName') ->
      data : -> obj or stringify(obj)
      domain : -> __dirname + '/dom/'

Or something like this, if using plain JavaScript

    var Plugin = function(name) {
      this.name = (name != null) ? name : 'PluginName';
    }
    Plugin.prototype.data = function() {
      return obj || stringify(obj);
    };
    Plugin.prototype.domain = function() {
      return __dirname + '/domain/';
    };

### Constructor
For compatibility with the CLI, the constructor should be able to take the essential parameters as ordered arguments.
You decide how many parameters are essential, and you can encapsulate the remaining arguments in an object (for instance) to avoid having a huge number of ordered arguments.

If you design for CLI compatibility, then the constructor should coerce important internal arguments from strings (to what they are supposed to be),
as this is how they are passed in from the CLI. For instance, this design would work well with the CLI.

    constructor : (@name='pluginName', number,  @obj={}) ->
      @number = number | 0 # force to Int
      @obj.foo ?= 'inessential param'

### name key
The `name` key must be specified and have a default indicating the name used by the plugin.
It will specify the name of the key exported to the `data` domain (if it exports data), as well as the name of the domain exported to (if it exports behaviour).

This name should be configurable from the class constructor to avoid clashes, but it should default to the plugin name.

### data method
The `data` method must return an object or a pre-serialized object/array to attach to the data domain.
If a string is passed from `data` it will be assumed to be a pre-serialized object that evaluates so something sensible via `eval`.
Anything else will be internally serialized for you with eirther `JSON.stringify` or `.toString` if Function type.

### domain method
The `domain` method must return a path corresponding to the root of the exporting domain.
If a domain is exported, it should be clear on the server what files are available to the client by looking at the directory structure of the plugin.
It is recommended to put all these files within a `dom` subdirectory of your node module `lib` root.

## Domain
The domain method is set, modul8 will add a domain for named after the plugin (specified in name).
It will not append the files to the output, unless any of them have been required from the client.
If they are, however, they will pull in the dependencies (althoug only from this domain) they need to operate.

To make most use of domains, try to not duplicate work and note code under `dom/` can be required on the server from the `lib` directory.
For that reason, you may want this code to stay browser agnostic. Of course, sometimes this is not always possible.
If you do have to rely on certain browser elements, do not allow the code to run from this domain (because no non-app domains will wait for the DOM).
Instead make functions that, when called, expects the DOM to be ready, and only use these functions from the app domain.
