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

setup = (sub, libPrefix = 'glob') ->
  options =
    paths :
      app      : dir+'/arbiters/'+sub+'/app/'
      shared   : dir+'/arbiters/'+sub+'/shared/'
      libs     : dir+'/arbiters/'+sub+'/libs/'
    out :
      app   : dir+'/output/outarb'+sub+'.js'
      libs  : dir+'/output/outarblibs'+sub+'.js'

  makeApp = (requireLibs) ->
    fs.mkdirSync(dir+'/arbiters/'+sub, 0755)
    for p of options.paths
      fs.mkdirSync(dir+'/arbiters/'+sub+'/'+p, 0755)

    l = []
    for i in [0...3]
      fs.writeFileSync(options.paths.libs+libPrefix+i+'.js', "(function(){window['#{libPrefix}#{i}'] = 'ok';})();")
      fs.writeFileSync(options.paths.app+i+'.js', "module.exports = 'ok';")
      fs.writeFileSync(options.paths.shared+i+'.js', "module.exports = 'ok';")
      l.push "exports.app_#{i} = require('./#{i}');" # if we include arbiters with same name then they will gain priority over non-specific require from app to app
      l.push "exports.shared_#{i} = require('shared::#{i}');"
      l.push "exports.libs_#{i} = require('M8::#{libPrefix}#{i}');" if requireLibs
    fs.writeFileSync(options.paths.app+'entry.js', l.join('\n'))

  compileApp = (useLibs, separateLibs, useArbiters) ->
    keys = (libPrefix+i for i in [0...3])
    arbs = {}
    arbs[k] = k for k in keys

    modul8(options.paths.app+'entry.js')
      .analysis().output(if !libPrefix then console.log else false).suffix(true)
      .arbiters(if useLibs and useArbiters then arbs else {})
      .set('logging', false)
      .set('domloader', (a) -> a)
      .set('force', true)
      .libraries()
        .list(if useLibs then (libPrefix+i+'.js' for i in [0...3]) else false)
        .path(options.paths.libs)
        .target(if separateLibs then options.out.libs else false)
      .domains()
        .add('shared', options.paths.shared)
      .compile(options.out.app)

  [makeApp, compileApp, options]

compile = utils.makeCompiler()


exports["test arbiters#priority"] = ->
  # clean out old directory
  try rimraf.sync(dir+'/arbiters')
  catch e
  fs.mkdirSync(dir+'/arbiters', 0755)
  count = 0

  exts = ['','.js','.coffee']
  compile = utils.makeCompiler()

  run = (suf, libReq) ->
    [makeApp, compileApp, opts] = setup('noglob'+suf, '')
    doms = {}
    doms[name] = path for name,path of opts.paths when name isnt 'libs'
    makeApp(libReq)

    arbs = if libReq then {'0':['0'], '1': ['1'], '2':['2']} else {}
    ca = analysis
      entryPoint : 'entry.js'
      domains    : doms
      before     : (a) -> a
      arbiters   : arbs
      exts       : exts
      ignoreDoms : []
      compile
    order = ca.sorted()
    assert.includes(order[order.length-1], 'entry.js', "ordered list includes entry when libsRequired=#{libReq}")
    order.pop()
    wantedLen = 6
    assert.equal(order.length, wantedLen, "order contains all files when libsRequired=#{libReq}")
    count += 2

  run('a', false)
  run('b', true)

  console.log 'arbiters#priority - completed:', count



testCount = 0
num_tests = 7
testsDone = (count) ->
  testCount += count
  num_tests -= 1
  #console.log 'arbiters#handling - partially completed:', testCount, 'run:', num_tests
  console.log 'arbiters#handling - completed:', testCount if !num_tests


exports["test arbiters#handling"] = ->
  # clean out old directory
  try rimraf.sync(dir+'/arbiters')
  catch e
  fs.mkdirSync(dir+'/arbiters', 0755)

  requireLibs = false
  useLibs = false
  separateLibs = false
  useArbiters = false

  testNum = 0
  b = []
  o = []

  for libsOn in [true, false]
    optionAry = if libsOn then [false, true] else [false]
    for libsSeparate in optionAry
      for arbitersOn in optionAry
        arbiterOptions = if arbitersOn then [true, false] else [false]
        for libsRequired in arbiterOptions # this one should not actually make a difference to anything - but can only require if we use arbiters obv.
          #console.log 'run', testNum
          ((k, useLibs, separateLibs, useArbiters, requireLibs) ->
            [makeApp, compileApp, o[k] ] = setup(k)
            #console.log 'running test', k, "with (useLibs, separateLibs, useArbiters, requireLibs) = ", useLibs, separateLibs, useArbiters, requireLibs

            makeApp(requireLibs)
            compileApp(useLibs, separateLibs, useArbiters)
            b[k] = new zombie.Browser()

            b[k].visit 'file:///'+dir+"/empty.html", (err, browser, status) ->
              throw err if err

              count = 2
              if separateLibs
                libCode = compile(o[k].out.libs)
                assert.isUndefined(browser.evaluate(libCode), ".compile() result evaluates successfully")
                assert.ok(browser.evaluate("window.glob0 === 'ok'"), "glob#{i} exists before arbiters kick in (useArbiters = #{useArbiters})")
                count += 2

              mainCode = compile(o[k].out.app)
              assert.isUndefined(browser.evaluate(mainCode), ".compile() to #{o[k].out.app} gives an evaluable result")
              assert.isDefined(browser.evaluate("M8"), "global namespace is defined")


              for domain,path of o[k].paths when domain isnt 'libs'
                for i in [0...3]
                  assert.ok(browser.evaluate("M8.require('#{domain}::#{i}.js') === 'ok'"), "can require #{domain}::#{i} from app")
                  count += 1
              for i in [0...3]
                if useLibs
                  if useArbiters
                    assert.isUndefined(browser.evaluate("window.glob#{i}"), "window.glob#{i} has been deleted")
                    assert.ok(browser.evaluate("M8.require('M8::glob#{i}') === 'ok'"), "glob#{i} arbiter exist")
                  else
                    assert.ok(browser.evaluate("window.glob#{i} === 'ok'"), "glob#{i} exists when !useArbiters")
                    assert.isUndefined(browser.evaluate("M8.require('M8::glob#{i}')"), "glob#{i} arbiter does not exist")
                else
                  # no use libs
                  assert.isUndefined(browser.evaluate("window.glob#{i}"), "window.glob#{i} does not exist when !useLibs, useArbiters==#{useArbiters}")
                  assert.isUndefined(browser.evaluate("M8.require('M8::glob#{i}')"), "glob#{i} arbiter does not exist when !useLibs, useArbiters==#{useArbiters}")
                count += 2

              testsDone(count)
          )(testNum, libsOn, libsSeparate, arbitersOn, libsRequired)
          testNum++
  return
