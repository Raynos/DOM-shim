path      = require 'path'
fs        = require 'fs'
coffee    = require 'coffee-script'
_         = require 'underscore'
dir       = fs.realpathSync()

# infer abs domain path and file name from path relative to dir
domainSplit = (relPath) ->
  if path.existsSync(relPath)
    epath = relPath
  else
    throw new Error("modul8: cannot resolve #{relPath} (#{epath})")

  file = relPath.split('/')[-1...][0] # get last element of split
  dom = epath.split(file)[0]
  [dom, file]

# fs shortcut
read = (name) -> fs.readFileSync(name, 'utf8')

# compile factory
makeCompiler = (external={}) ->
  # sanity
  for key,fn of external
    if key in ['','.js','.coffee']
      throw new Error("modul8: cannot re-register #{key} extension")
    if !_.isFunction(fn)
      throw new Error("modul8: registered compiler must be a fn returning a string")

  (file, bare=true) ->
    ext = path.extname(file)
    raw = read(file)
    return raw if ext is '.js'
    return coffee.compile(raw, {bare}) if ext is '.coffee'
    return fn(raw, bare) for key,fn of external when key is ext # compile to js languages must take two params, read input and bare bool - bare only if safety wrapping done by default
    throw new Error("modul8: requested file #{file} does not have a valid javascript, coffeescript or externally registered extension")


# simple fs extension to check if a file exists [used to verify require calls' validity]
exists = (file) ->
  try
    stat = fs.statSync(file)
    return not stat.isDirectory()
  catch e
    return false


module.exports = {
  makeCompiler
  exists
  read
  domainSplit
}
