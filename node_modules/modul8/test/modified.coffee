zombie    = require 'zombie'
assert    = require 'assert'
fs        = require 'fs'
rimraf    = require 'rimraf'
coffee    = require 'coffee-script'
detective = require 'detective'
utils     = require './../lib/utils'    # hook in to this
analysis  = require './../lib/analysis' # hook in to this
resolver  = require './../lib/resolver' # hook in to this
modul8    = require './../index.js' # public interface
dir       = __dirname

{read} = utils
{isLegalRequire, Resolver} = resolver

appSize = 1

makeApp = ->
  # clean out old directory
  try rimraf.sync(dir+'/modified')
  catch e
  fs.mkdirSync(dir+'/modified', 0755)
  for p of options.paths
    fs.mkdirSync(dir+'/modified/'+p, 0755)

  l = []
  for i in [0...appSize]
    fs.writeFileSync(options.paths.libs+i+'.js', "(function(){window.#{i} = 'ok';})();")
    fs.writeFileSync(options.paths.app+i+'.js', "module.exports = 'ok';")
    fs.writeFileSync(options.paths.shared+i+'.js', "module.exports = 'ok';")
    l.push "exports.app_#{i} = require('#{i}');"
    l.push "exports.shared_#{i} = require('shared::#{i}');"
    #l.push "exports.libs_#{i} = require('M8::#{i}');" #TODO: also verify that this works
  fs.writeFileSync(dir+'/modified/app/entry.js', l.join('\n'))

options =
  paths :
    app      : dir+'/modified/app/'
    shared   : dir+'/modified/shared/'
    libs     : dir+'/modified/libs/'
  out :
    app   : dir+'/output/outmod.js'
    libs  : dir+'/output/outlibs.js'

compile = (useLibs, separateLibs) ->
  modul8(options.paths.app+'entry.js')
    #.analysis().output(console.log).suffix(true)
    #.arbiters().add('0').add('1').add('2') #TODO: fix priority here as well!
    .set('logging', 'WARN')
    .libraries()
      .list(if useLibs then (i+'.js' for i in [0...appSize]) else false)
      .path(options.paths.libs)
      .target(if separateLibs then options.out.libs else false)
    .domains({'shared': options.paths.shared})
    .compile(options.out.app)

modify = (pathName, num) ->
  file = options.paths[pathName]+num+'.js'
  sleep(1005)
  fs.writeFileSync(file, read(file)+';')
  sleep(1005)
  return

sleep = (ms) ->
  now = new Date().getTime()
  null while(new Date().getTime() < now + ms)
  return

mTimesOld = {app : 0, libs : 0}
wasUpdated = (type) ->
  mtime = fs.statSync(options.out[type]).mtime.valueOf()
  didUpdate = mtime isnt mTimesOld[type]
  mTimesOld[type] = mtime if didUpdate
  didUpdate


exports["test compile#modified"] = ->
  if true
    console.log 'compile#modified on hold - skipping 24 second test'
    return

  makeApp()
  compile()
  wasUpdated('app')
  testCount = 0

  ###TestPlan
  for each file and path
    0. read mtimes
    1. compile
    2. verify that file has NOT changed (always)
    3. modify a file
    4. compile
    5. verify that app file has changed (if it should)

   do above for cases:
    with libs, without libs
    with libsOnlyTarget, without libsOnlyTarget
  ###

  for withLibs in [false, true]
    optionAry = if withLibs then [false, true] else [false]
    for separateLibs in optionAry

      for name, path of options.paths
        continue if !withLibs and name is 'libs'

        modifyingLibs = name is 'libs'
        compile(withLibs, separateLibs) # will log 'compiling libs' the first time we compile withLibs
        # store times
        wasUpdated('app')
        wasUpdated('libs') if separateLibs

        for i in [0...appSize]
          compile(withLibs, separateLibs)
          #console.log "modifying #{name}::#{i} using libs? #{withLibs}. Separately? #{separateLibs}."
          assert.ok(!wasUpdated('app'), "preparing to modify #{name}::#{i} - recompile does not change libs mTimes without changes")

          if separateLibs
            assert.ok(!wasUpdated('libs'), "preparing to modify #{name}::#{i} - recompile does not change libs mTimes without changes")
            testCount += 1

          #modify sleeps as there is a limited resolution on mtime
          # => cant make rapid changes to files programmatically and expect modul8 to understand all the time
          #TODO: use fs.(f)utimesSync when newer node versions are stable?
          modify(name, i)
          compile(withLibs, separateLibs)
          appChanged = wasUpdated('app')
          libsChanged = if separateLibs then wasUpdated('libs') else true


          if modifyingLibs and !separateLibs
            assert.ok(appChanged, "modified #{name}::#{i} - compiling with lib changes for included libs app mtime")
          else if modifyingLibs and separateLibs
            assert.ok(libsChanged, "modified #{name}::#{i} - compiling with lib changes for separate libs changes libs mtime")
            assert.ok(!appChanged, "modified #{name}::#{i} - compiling with lib changes for separate libs does not change app mtime")
            testCount +=1
          else if !modifyingLibs
            assert.ok(appChanged, "modified #{name}::#{i} - compiling with app changes changes app mtime")

          testCount += 2

  # takes sleepDuration * appSize * 2 * 2 * numPaths = 2*1*2*2*3 = 24s

  console.log 'compile#modified - completed:', testCount

