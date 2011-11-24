# require()

modul8's `require()` works hand in hand with a private `define()` call that will wrap each module in the compiled source.
This ensures that each module has the necessary context for the `require()` calls it will make. All this context is stored via closures and will be hidden from you.

## Ways to require

There are four different ways to use require:

#### Absolutely

- `require('subfolder/module.js')` - Can resolve subfolder/module.js on any domain - regardless of what subfolder or domain you are in - but will scan the current domain first.

#### Relatively

- `require('./module.js')` - Can resolve a module.js file on the current domain in the current folder.

You can indicate a relative require by using either the `./` prefix, or the folder traversing `../` prefix. Going up folders is done by chaining on `../` strings.

**Note** that all the `../` chaining has to happen in the beginning of the require string (easy convention on the client). In other words:

- `require('./../subfolder/../basemodule.js')` **is not legal** while `require('./../basemodule.js')` **is**.

#### Domain Specific

- `require('shared::val.js')` - Like absolute requires, but specifies the only domain which will be searched. If you want to do relative domain specific requires,
just use a pure relative require where the current domain is implicitly assumed.

Note that `require('dom::')` will look for an index file in the root of that domain. So if you want to minimize the cross-domain interaction,
export everything relevant from there.

##### Data Domain

- `require('data::datakey')` - Data on this domain does not represent actual files, but data injected into the require system on the server. It will not show up in the dependency tree.

##### External Domain

- `require('external::extkey')` - Same as data domain, but only extensible from the client.

##### Arbiter Domain

- `require('jQuery')` - Shortcut domain for old globals that were deleted to help identify hidden dependencies - must be defined on the server.
This does not require a domain prefix because it is assumed this domain gets sufficiently frequent use to have it bumped up on the priority list.

Note that if a jQuery.js file is found on the current domain, however, it will gain priority over the arbiter domain.
If this coexistence is necessary, any arbiters must be  required by specifying the internal domain name: `$ = require('M8::jQuery')`.

## File extensions

File extensions are never necessary, but you can (and sometimes should) include them for specificity (except for on the data domain).

The reason you perhaps should is that modul8 allows mixing and matching JavaScript, CoffeeScript, and other AltJS languages,
but is only as forgiving with such mixing as you deserve. If you only use one language and never put files of another language in your directories,
the following warning does not apply to you.

### Extension Priority
To see why, consider a simplified resolver algorithm from the server

    name = require input, domain = domain of requiree
    while(domain)
      return true if exists(domain + name)
      return true if exists(domain + name + '.js')
      return true if exists(domain + name + '.coffee')
      return true if exists(domain + name + altJsExt) //optional
      domain = nextDomain // if applicable (see require priority below)
    return false

If you use _CoffeeScript_ or other registered compilers for AltJS languages,
and if there is even a chance of a file of the same name with a `.js` extension popping up in the same folder,
then it will gain priority over your normal files if you do not specify the extension.

#### Extension Truncation
The corollary to this extension priority is that we can't accurately distinguish between two extensions on the client when we omit the extension.
Thus, since omitting the extension is generally advantageous for brevity, we have decided to simply truncate the extension on the client.

This is advantageous also because it makes the require code leaner, more perfomant, and each **dom::name pair is unique** as they should be.

You can still have a `.js` duplicate of your `.coffee` file in a directory, but you then have to explicitly define `.coffee` so that the server
can pre-pick the right one to include for you.

#### Server Error
To help you remember this, modul8 will actually throw an error if you simultaneously try to require both

- app::subpath/module.js
- app::subpath/module.otherExt

It is not a complete failsafe, we are aware, but it helps force usage so that the problem above does not occur.

**In short**: try not to have different extension versions of your files in the same directory or you can run into the following two problems:

- **A)** your Coffee changes wont do anything because you are unknowingly requiring a JS version that got in the directory
- **B)** you will have a conflict error thrown at you to help you not challenging fate with techniques that can result in problem A

Note that the error will only be thrown after the `.analysis()` dependency tree was logged, allowing you to pinpoint the careless `require()`.

## Folders Priority

Require strings that contain a trailing slash or does not point to a file directly, will try to resolve the name as a folder and look for a file named `index` following the above logic.
The following will all resolve a folder, but the last has the possiblility of a collision with a file of the same name as the folder:

    require('controllers/index');
    require('controllers/'); //looks for controllers/index+extension
    require('controllers'); //looks for controllers+extension then controllers/index+extension

## General Priority

Requires are attempted resolved with the following priority:

    if require string is relative
      resolve absolutized require string on current domain
    else if require string includes domain prefix
      resolve require string on specified domain
    else //try arbiter search
      resolve require string on the M8 domain

    if none of the above true
      resolve on all real domains, starting with current domain

    //error

In other words, collisions should not occur unless you have duplicate files in different domains and
you are overly relaxed about your domain specifiers, or you have actual files with arbiter names lying around.

## Hooking into define

modul8 defines way to help you attach objects/fn to certain domains both live on the client and from the server.
The [API docs](api.html) have full information on these features.
