0.14.0 / 2011-11-2?
==================
  * Use detective's new caching layer?
  * Store states in a config file in user home rather than one file per output in the states directory.

0.13.0 / 2011-11-22
==================
  * data API for strings now only take code strings (pre-serialized values)
  * tests now pass with node 0.6.1 using `npm test`
  * tests (when npm installed) now include vital file
  * Plugin::name can be a simple key (cleaner Plugin API)
  * CLI allows concatenating on libraries like the main API (but without the separate libraries().target() option available)
  * Existing CLI API modified to be consistent with itself: Delimiters are querystring style.
  * CLI test module included in test/
  * Fixed bug causing collision testing to not be strict enough
  * Fixed bug causing arbiters with globals different to its name to not resolve on the client
  * Bundled require code passes through JSLint
  * Domains can be required with simply `require('dom::')` if an index file is present on the domain
  * If compile target is deleted, forceUpdate output regardless of cached states

0.12.0 / 2011-11-13
==================
  * Plugin API more semantic, name, data, domain methods all returning singles rather than pairs and triples.
  * Deprecates m8-templation <0.2.0 and m8-mongoose <0.2.0 (newer versions released simultaneously - and plugin API expected to freeze soon)
  * Tests for Plugin interface

0.11.2 / 2011-11-13
==================
  * Better package.json future proofing of build breaking updates from dependencies

0.11.0 / 2011-11-09
==================
  * functions passed to `.data()` will self-execute on the client (the fn.toString representation) - to be used with caution
  * strings passed in to `.data()` will no longer assumed to be code strings, they will be strings
  * strings passed in to `.data().add()` when third parameter is set to true, it will be assumed to be a code string
  * Ditto for plugin API (docs updated)

0.10.1 / 2011-11-08
==================
  * functions passed to `.data()` will be serialized using fn.toString() - to be used with caution
  * Plugin documentation tweaks
  * More sensibly, the logging option on the CLI can set the level, so that the unset default corresponds to the API default.

0.10.0 / 2011-11-07
==================
  * Data functions are executed in the interface rather than in the last step
  * Plugin interface via `.use()`
  * Documentation of Plugins + two quick plugins introduced
  * `.data()` no longer uses pull functions but expects the data directly - it will serialize itself if needed - can take objects,arrays,numbers or serialized JavaScript
  * Server side logging now includes a socket.io style logger class
  * Better documentation of logging
  * node v0.6.0 shown to work (although some tests segfaults)

0.9.3 / 2011-10-30
==================
  * Big documentation improvements
  * Intelligent whitespace added to output code when not minified to make it more readible

0.9.2 / 2011-10-30
==================
  * Logging level defaults to ERROR (CLI still has to do -l for this)
  * External extensions bug in 0.9.<2

0.9.1 / 2011-10-29
==================
  * Logging bug fixed

0.9.0 / 2011-10-29
==================
  * Logging now has levels - defaults to false, -l flag in CLI sets to ERROR level
  * Fixed a bug causing global install not to resolve all dependencies for CLI
  * Write the client side code manually in JavaScript for client side readibility
  * No longer passing data in to the require closure from outside - simply inject it with RegExps
  * Relative requires a little more flexible (../ prefix allowed vs old ./../)

0.8.0 / 2011-10-29
==================
  * `.domains()` call no longer required - application domain inferred from entrypoint
  * entry point must be specified to modul8(entry) WITH a path (relative or absolute) -
  as opposed to just specifying filename and inferring its path from the main domain
  * Fixed a bug in 0.7.0 where app would not recompile even if app files had been modified

0.7.0 / 2011-10-28
==================
  * Command Line Interface - documented under CLI
  * recompiling now happens if settings were changed as well (bug)
  * move underscore copied snippets out of src - require underscore instead
  * domloader API simplified to work with CLI, also now defaults to anonymous fn rather than jQuery domloader
  * `.compile()` will not recompile the file if no changes have been made to previously included files
  * modified test suite included to ensure above works
  * arbiter test suite included
  * `.analysis.hide(domain)` was not working correctly
  * server side resolver was ignoring resource names on other domains when clashing with arbiters

0.6.1 / 2011-10-18
==================
  * `.arbiters()` allows an object to be inserted at once
  * Biggish documentation improvements

0.6.0 / 2011-10-17
==================
  * `require('folder')` will look for a `folder` file then an `index` file under `folder/`
  * `require('folder/')` will look for an `index` file under `folder/`
  * `require()` collision priority updated
  *  collision test suite included
  * `.compile()` will throw error if multiple files with same unique identifier (extensionless dom::filename) are attempted included - but helpfully after `.analysis()`
  * `.register('.ext', extCompiler)` will allow bundling of other altJs languages

0.5.0 / 2011-10-14
==================
  * `.data()` and `.domains()` now both can take objects directly instead of adding
  * `.libraries()` can be specified without all the 3 sub-calls, just specify all htree parameters direcly on this instead
  * `.analysis().ignore(domain)` can be used to supress certain domains from printed depedency tree (perhaps good to hide `external` or `M8`)

0.4.0 / 2011-10-13
==================
  * Better documentation + examples bundled
  * Fixed a collision bug causing same folder structure to be ignored by the bundler in one branch
  * Fixed a bug in the circular checker not correctly matching + no longer hanging on cirtain curculars
  * Loggability of requires on the client works as in the documentation
  * `M8.domains()` now returns a list of strings instead of console.logging it
  * 'M8.data()' and 'M8.external()' does not return
  * Configured a basic test environment using zombiejs
  * Safed up API against subclass calls against on superclass.

0.3.0 / 2011-10-08
==================

  * Full documentation
  * `arbiters()` added

==================
  modul8 was never advertised before this point
==================

0.2.2 / 2011-10-04
==================

  * Fix a define and a require bug

0.2.0 / 2011-10-03
==================

  * Initial commit on the new name
  * Style bundling factored out to a separate module

0.1.0 / 2011-09-20
==================

  * Initial commit on brownie
