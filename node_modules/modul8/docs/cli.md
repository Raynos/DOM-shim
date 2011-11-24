# Command Line Interface

modul8 defines a command line interface when installed globally with npm, i.e.

    $ npm install -g modul8

This tool tries to expose the core functionality in as minimal way as possible, and may in a few ways be a little more restrictive with its options, but in most ways it is identical.

## Usage

### Code Analysis
Analyse application dependencies from an entrypoint via the `-z` flag

    $ modul8 entry.js -z

This will output only the dependency tree:

    app::app
     ├──┬app::controllers/users
     │  └──┬app::models/user
     │     └───app::utils/validation
     └───app::utils

### Minimal Compilation
Simply specify the entry point, and pipe the result to a file

    $ modul8 entry.js > output.js

Alternatively, you can also use the `-o` flag:

    $ modul8 entry.js -o output.js

The application domain is assumed to be in the location `entry.js` is found in.

### Basic Compilation
Suppose you also have a shared code domain in a different folder like so

    code
    ├───app
    └───shared

Then either

   $ modul8 entry.js -p shared=../shared/ > output.js

from the `app` directory, or

    $ modul8 app/entry.js -p shared=shared/ > output.js

from the `code/` directory.

If you want to wait for the DOM using jQuery, append the `-w jQuery` option (see wrapper below).

## Advanced Features

### Domains
Multiple domains are partition of name=path values delimited like a query string:

    $ modul8 app/entry.js -p shared=shared/&bot=../libs/bot/

### Arbiters
Loading of arbiters works like the programmatic API:

    $ modul8 app/entry.js -a Spine=Spine

We can omit the right hand side of an expression if the shortcut has the same name as the global.

    $ modul8 app/entry.js -a Spine

Multiple globals for a given shortcuts can be comma separated:

    $ modul8 app/entry.js -a jQuery=jQuery,$

Multiple arbiters can be delimited with an & symbol

    $ modul8 app/entry.js -a jQuery=$,jQuery&Spine

### Data Injection
Data injection works fundamentally different from the shell than from your node program.
Here you rely on your data pre-existing in a `.json` file and specify what key to attach it to.

    $ modul8 app/entry.js -d myKey=myData.json

Multiple data elements can be delimited with the & symbol like above.

## Loading Libraries
Libraries can be concatenated on in the order they wish to be included.
Load them with the `-b` flag, supplying a path as the key, and a list of files inside that path.

    $ modul8 app/entry.js -b libs/=jQuery.js,jQuery.ui.js,plugins/datepicker.js

### Loading Plugins
It requires a relative or absolute path to the plugins root, and an optional list of options
to pass as strings to the `require(pathOrNameOfModule).Plugin` constructor.

    $ modul8 app/entry.js -g pathToModule=opt1,opt2

This would be the equivalent of doing

    var Plugin = require('pathToModule');
    modul8('./app/entry.js')
      .use(new Plugin('opt1', 'opt2'))
      .compile(console.log)

For a blank constructor call, do not use `-g pathToModule=` as this is used to pass the empty string as the first parameter.
Instead omit the equals sign: `-g pathToModule`

### Extra Options
The following are equivalent methods for the programmatic API calls to `.set()`

    -w or --wrapper <str> ⇔ set('domloader', <str>)
    -n or --namespace <str> ⇔ set('namespace', <str>)
    -l or --logging  <str> ⇔ set('logging', <str>)

#### Booleans
The following are slightly limited versions of the programmatic `.before()` and `.after()` API

    -t or --testcutter ⇔ before(modul8.testcutter)
    -m or --minifier ⇔ after(modul8.minifier)

See the [API](api.html) for more details on how these work.
