_           = require 'underscore'
fs          = require 'fs'
crypto      = require 'crypto'
path        = require 'path'
codeAnalyis = require './analysis'
Logger      = require './logger'
{makeCompiler, exists, read} = require './utils'
log = new Logger()

# helpers
anonWrap = (code) ->
  "(function(){\n#{code}\n})();"

makeWrapper = (ns, fnstr, hasArbiter) ->
  return anonWrap if !fnstr
  location = if hasArbiter then ns+".require('M8::#{fnstr}')" else fnstr
  (code) -> location+"(function(){\n"+code+"\n});"

# creates a unique filename to use for the serializers
# uniqueness based on execution path, target.js and targetlibs.js - should be sufficient
makeGuid = (vals) ->
  vals.push fs.realpathSync()
  str = (v+'' for v in vals).join('_')
  crypto.createHash('md5').update(str).digest("hex")

# analyzer will find files of specified ext, but these may clash on client
verifyCollisionFree = (codeList) ->
  for [dom, file] in codeList
    uid = dom+'::'+file.split('.')[0]
    for [d,f] in codeList when dom isnt d or file isnt f # dont check self
      uidi = d+'::'+f.split('.')[0]
      if uid is uidi
        throw new Error("modul8: does not support requiring of two files of the same name on the same path with different extensions: #{dom}::#{file} and #{d}::{#f} ")
  return

# checks whether serialized options object corresponds to the one we passed in
isOptionsChanged = (guid, o, log) ->
  cfgStorage = __dirname+'/../states/'+guid+'_cfg.json'
  cfg = if exists(cfgStorage) then JSON.parse(read(cfgStorage)) else {}
  return false if _.isEqual(cfg, JSON.parse(JSON.stringify(o))) #o must to mimic parse/stringify movement to pass
  fs.writeFileSync(cfgStorage, JSON.stringify(o))
  console.log 'modul8: updated settings - recompiling' if !_.isEqual(cfg, {}) and log
  true

# checks mTimes for a list of [dom, file] where dom is in domains
mTimeCheck = (guid, fileList, doms, type, log) ->
  mTimes = {}
  mTimes[d+'::'+f] = fs.statSync(doms[d]+f).mtime.valueOf() for [d, f] in fileList
  mStorage = __dirname+'/../states/'+guid+'_'+type+'.json'
  mTimesOld = if exists(mStorage) then JSON.parse(read(mStorage)) else {}

  fs.writeFileSync(mStorage, JSON.stringify(mTimes)) # update state
  if _.isEqual(mTimesOld, {})
    console.log 'modul8: first compile of '+type if log
    return true
  mTimesUpdated(mTimes, mTimesOld, type, log)

# returns whether the serialized mTimes object is out of date
mTimesUpdated = (mTimes, mTimesOld, type, log) ->
  for file,mtime of mTimes
    if !(file of mTimesOld)
      console.log 'modul8: files added to '+type if log
      return true
    if mTimesOld[file] isnt mtime
      console.log 'modul8: files updated in '+type if log
      return true
  for file of mTimesOld
    if !(file of mTimes)
      console.log 'modul8: files removed from '+type if log
      return true
  false


# main packager
bundleApp = (codeList, ns, domload, compile, o) ->
  l = []

  # 1. construct the global namespace object
  l.push "window.#{ns} = {data:{}};"

  # 2. pull in data from parsers (force result to string if it isnt already)
  l.push "#{ns}.data.#{name} = #{json};" for name, json of o.data

  # 3. attach require code
  config =
    namespace : ns
    domains   : Object.keys(o.domains)
    arbiters  : o.arbiters
    logging   : o.logLevel

  l.push anonWrap( read(__dirname+'/require.js')
    .replace(/__VERSION__/, JSON.parse(read(__dirname+'/../package.json')).version)
    .replace(/__REQUIRECONFIG__/, JSON.stringify(config))
  )

  # 4. include CommonJS compatible code in the order they have to be defined - defineWrap each module
  defineWrap = (exportName, domain, code) ->
    "#{ns}.define('#{exportName}','#{domain}',function(require, module, exports){\n#{code}\n});"

  # 5. filter function split code into app code and non-app code
  harvest = (onlyMain) ->
    for [domain, name] in codeList when (domain is 'app') == onlyMain
      code = o.before(compile(o.domains[domain] + name)) # middleware applied to code first
      basename = name.split('.')[0] # take out extension on the client (we throw if collisions requires have happened on the server)
      defineWrap(basename, domain, code)


  # 6.a) include modules not on the app domain
  l.push "\n// shared code\n"
  l.push harvest(false).join('\n')

  # 6.b) include modules on the app domain, and hold off execution till DOMContentLoaded fires
  l.push "\n// app code - safety wrap\n\n"
  l.push domload(harvest(true).join('\n'))

  # 7. Use a closure to encapsulate the public and private require/define API as well as all export data
  anonWrap(l.join('\n'))


module.exports = (o) ->
  guid = makeGuid([o.target, o.libsOnlyTarget])
  forceUpdate = isOptionsChanged(guid, o) or o.options.force # force option (using CLI)
  forceUpdate |= (o.target and !_.isFunction(o.target) and !exists(o.target)) # forceUpdate if target deleted or does not exist

  ns = o.options.namespace+''         # force into string (we know it's valid from before)
  domwrap = o.options.domloader or '' # force into string if not function or falsy
  domwrap = makeWrapper(ns, domwrap, domwrap of o.arbiters) if !domwrap or !_.isFunction(domwrap) # else use (empty?) str to make wrapper

  o.before = if o.pre.length > 0 then _.compose.apply({}, o.pre) else _.identity
  o.after = if o.post.length > 0 then _.compose.apply({}, o.post) else _.identity

  compile = makeCompiler(o.compilers) # will throw if reusing extensions or invalid compile functions
  o.exts = ['','.js','.coffee'].concat(ext for ext of o.compilers)

  ca = codeAnalyis(o, compile)

  if o.treeTarget # do tree before collisionCheck (so that we can identify what triggers collision) + works better with CLI
    tree = ca.printed(o.extSuffix, o.domPrefix)
    if _.isFunction(o.treeTarget)
      o.treeTarget(tree)
    else
      fs.writeFileSync(o.treeTarget, tree)

  if o.target
    codelist = ca.sorted()
    verifyCollisionFree(codelist)

    useLog = o.options.logging and !_.isFunction(o.target) # dont log anything from server if we output result to console
    logCompiles = useLog and o.logLevel >= 2
    logDebugs = useLog and o.logLevel >= 4

    appUpdated = mTimeCheck(guid, codelist, o.domains, 'app', logDebugs)

    c = bundleApp(codelist, ns, domwrap, compile, o)
    c = o.after(c)

    return o.target(c) if _.isFunction(o.target) # pipe output to fn without libs for now

    if o.libDir and o.libFiles

      libsUpdated = mTimeCheck(guid, (['libs', f] for f in o.libFiles), {libs: o.libDir}, 'libs', logDebugs)

      if libsUpdated or (appUpdated and !o.libsOnlyTarget) or forceUpdate
        # necessary to do this work if libs changed
        # but also if app changed and we write it to the same file
        libs = (compile(o.libDir+file, false) for file in o.libFiles).join('\n') # concatenate libs as is - safetywrap any .coffee files
        libs = o.after(libs)

      if o.libsOnlyTarget and libsUpdated
        fs.writeFileSync(o.libsOnlyTarget, libs)
        log.info 'modul8 - compiling separate libs' if logCompiles
        libsUpdated = false # no need to take this state into account anymore since they are written separately
      else if !o.libsOnlyTarget
        c = libs + c
    else
      libsUpdated = false # no need to take lib state into account anymore since they dont exist

    if appUpdated or (libsUpdated and !o.libsOnlyTarget) or forceUpdate
      # write target if there were any changes relevant to this file
      log.info 'modul8 - compiling' if logCompiles
      fs.writeFileSync(o.target, c)
      #console.log 'writing app! bools: libsUp='+libsUpdated+', appUp='+appUpdated+', force='+forceUpdate

  return
