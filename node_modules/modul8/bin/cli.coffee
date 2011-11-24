#!/usr/bin/env coffee

# Module dependencies

fs      = require('fs')
path    = require('path')
program = require('../node_modules/commander')
modul8  = require('../')
utils   = require('../lib/utils')
dir     = fs.realpathSync()
{basename, dirname, resolve, join} = path

# parse query string like options in two ways
makeQsParser = (isValueList) ->
  (val) ->
    out = {}
    for e in (val.split('&') or [])
      [k,v] = e.split('=')
      out[k] = if isValueList then v?.split(',') else v
    out

simpleQs = makeQsParser(0)
listQs = makeQsParser(1)

# options

program
  .version(modul8.version)
  .option('-z, --analyze', 'analyze dependencies instead of compiling')
  .option('-p, --domains <name=path>', 'specify require domains', simpleQs)
  .option('-d, --data <key=path>', 'attach json parsed data from path to data::key', simpleQs)

  .option('-b, --libraries <path=lib1,lib2>', 'concatenate listed libraries in front of the standard output', listQs)
  .option('-a, --arbiters <shortcut=glob,glob2>', 'specify arbiters shortcut for list of globals', listQs)
  .option('-g, --plugins <path=arg,arg2>', 'load in plugins from path using listed constructor arguments', listQs)

  .option('-o, --output <file>', 'write output to a file rather than send to stdout')
  .option('-l, --logging <level>', 'set the logging level')
  .option('-n, --namespace <name>', 'specify the target namespace used in the compiled file')
  .option('-w, --wrapper <fnName>', 'name of wrapping domloader function')
  .option('-t, --testcutter', 'enable pre-processing of files to cut out local tests and their dependencies')
  .option('-m, --minifier', 'enable uglifyjs post-processing')

program.on '--help', ->
  console.log('  Examples:')
  console.log('')
  console.log('    # analyze application dependencies from entry point')
  console.log('    $ modul8 app/entry.js -z')
  console.log('')
  console.log('    # compile application from entry point')
  console.log('    $ modul8 app/entry.js > output.js')
  console.log('')
  console.log('    # specify extra domains')
  console.log('    $ modul8 app/entry.js -p shared=shared/&bot=bot/')
  console.log('')
  console.log('    # specify arbiters')
  console.log('    $ modul8 app/entry.js -a jQuery=$,jQuery&Spine')
  console.log('')
  console.log('    # wait for the DOM using the jQuery function')
  console.log('    $ modul8 app/entry.js -w jQuery')
  console.log('')
  console.log('    # specify plugins')
  console.log('    $ modul8 app/entry.js -g m8-templation=template_path,.jade')
  console.log('')


complete = ->
  # first arg must be entry
  entry = program.args[0]
  if !entry
    console.error("usage: modul8 entry [options]")
    console.log("or modul8 -h for help")
    process.exit()

  # utils
  i_d = (a) -> a
  construct = (Ctor, args) ->
    F = -> Ctor.apply(@, args)
    F:: = Ctor::
    new F()

  # convenience processing of plugins and data input
  plugins = []
  for name,optAry of program.plugins
    if !name
      console.error("invalid plugin usage: -g path=[args]")
      process.exit()
    rel = join(fs.realpathSync(), name)
    name = rel if path.existsSync(rel)
    # path can now be absolute, relative to execution directory or relative to CLI directory
    P = require(name).Plugin
    plugins.push construct(P, optAry)

  for k,p of program.data
    if not p or not path.existsSync p
      console.error("invalid data usage: value must be a path to a file")
      process.exit()
    program.data[k] = fs.readFileSync(p, 'utf8')

  libPath = Object.keys(program.libraries ? {})[0]?
  libs = program.libraries?[libPath]?

  modul8(entry)
    .domains(program.domains)
    .data(program.data)
    .use(plugins)
    .analysis(if program.analyze then console.log else false)
    .arbiters(program.arbiters)
    .libraries(libs or [], libPath)
    .set('namespace', program.namespace ? 'M8')
    .set('logging', program.logging ? 'ERROR') # if not set, do like default server behaviour
    .before(if program.testcutter then modul8.testcutter else i_d)
    .after(if program.minifier then modul8.minifier else i_d)
    .set('domloader', program.wrapper)
    .set('force', true) # always rebuild when using this
    .compile(if program.analyze then false else program.output ? console.log)

if module is require.main
  program.parse(process.argv)
  complete()

# allow injecting of custom argv to test cli
module.exports = (argv) ->
  program.parse(argv)
  complete()

  # for testing, program retains state between multiple calls
  resettables = [
    'analyze'    # -z
    'data'       # -d
    'domains'    # -p
    'namespace'  # -n
    'testcutter' # -t
    'minifier'   # -m
    'wrapper'    # -w
    'output'     # -o
    'arbiters'   # -a
    'logging'    # -l
    'plugins'    # -g
    'libraries'  # -b
  ]
  delete program[k] for k in resettables
