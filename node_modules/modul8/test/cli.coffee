zombie = require 'zombie'
assert = require 'assert'
fs     = require 'fs'
rimraf = require 'rimraf'
utils  = require '../lib/utils' #hook in to this
dir    = __dirname
modul8 = require '../' #public interface

callCLI = (str) ->
  base = ["coffee", "./bin/cli.coffee"]
  argv = base.concat(str.split(' '))
  #console.log argv.join(' ')
  cli    = require '../bin/cli'
  cli(argv)

compile = utils.makeCompiler()

exports["test CLI#examples/simple"] = ->
  workDir = './examples/simple/'
  str = "#{workDir}app/app.js -a jQuery=jQuery,$ -w jQuery -o #{workDir}cliout.js"
  callCLI(str)

  browser = new zombie.Browser()
  browser.visit 'file:///'+dir+"/empty.html", (err, browser, status) ->
    throw err if err
    libs = compile(workDir+'libs/jquery.js')
    mainCode = compile(workDir+'cliout.js')
    assert.isUndefined(browser.evaluate libs, "libs evaluate successfully")
    assert.isUndefined(browser.evaluate mainCode, ".compile() result evaluates successfully")
    assert.isDefined(browser.evaluate "M8.require('jQuery')", "jQuery is requirable")
    assert.isUndefined(browser.evaluate "window.jQuery", "jQuery is not global")
    assert.isUndefined(browser.evaluate "window.$", "$ is not global")
    testCount = 5

    console.log 'CLI#examples/simple - completed:', testCount

# dont test examples/advanced in here, it spams the log + not very general test case anyway
initDirs = (num) ->
  # clean out old directory
  try rimraf.sync(dir+'/input')
  catch e
  fs.mkdirSync(dir+'/input', 0755)
  for i in [0...num]
    fs.mkdirSync(dir+'/input/'+i, 0755)
    fs.mkdirSync(dir+'/input/'+i+'/libs', 0755)
    fs.mkdirSync(dir+'/input/'+i+'/main', 0755)
    fs.mkdirSync(dir+'/input/'+i+'/plug', 0755)
    fs.mkdirSync(dir+'/input/'+i+'/dom', 0755)
  return

testCount = 0
num_tests = 7
testsDone = (count) ->
  testCount += count
  num_tests -= 1
  #console.log 'cli#complex - partially completed:', testCount, 'run:', num_tests
  console.log 'cli#complex - completed:', testCount if !num_tests


generateApp = (opts, i) ->
  plug = []
  plug.push "Plugin = function(name){this.name = (name != null) ? name : 'defaultName';};"
  plug.push "Plugin.prototype.data = function(){return {plugData:true};};"
  plug.push "exports.Plugin = Plugin;"

  entry = []
  entry.push "exports.libTest1 = !!window.libTest1;"
  entry.push "exports.libTest2 = !!window.libTest2;"
  entry.push "exports.data = !!require('data::dataKey').hy;" if opts.data
  entry.push "exports.plugData = !!require('data::"+(opts.plugName || 'defaultName')+"');" if opts.plug
  entry.push "exports.domain = !!require('dom::');" if opts.dom
  entry.push "if (module === require.main) { require('server-requirement'); }"if opts.testcutter

  fs.writeFileSync(dir+'/input/'+i+'/main/entry.js', entry.join('\n'))
  fs.writeFileSync(dir+'/input/'+i+'/dom/index.js', "module.exports = 'domainCode';")
  fs.writeFileSync(dir+'/input/'+i+'/libs/lib1.js', "window.lib1 = function(fn){fn();};") # lib1 is the domloader
  fs.writeFileSync(dir+'/input/'+i+'/libs/lib2.js', "window.libTest2 = 'lib2';")
  fs.writeFileSync(dir+'/input/'+i+'/plug/index.js', plug.join('\n')) if opts.plug
  fs.writeFileSync(dir+'/input/'+i+'/data.json', JSON.stringify({hy:'thear', wee: 122}) ) if opts.data

  fs.writeFileSync(dir+'/input/'+i+'/main/temp.js', "require('./code1')") # write blank entry point (but require one of the plugin files)

exports["test CLI#complicated"] = ->
  num_tests = 8
  initDirs(num_tests)
  for k in [0...num_tests] then do (k) ->
    opts = {}
    opts =
      dom     : k % 2 is 0
      data    : k % 4 is 0
      plug    : k % 8 is 0 # test this with all cases of data/dom

      libArb1 : k % 2 is 0
      libArb2 : k % 4 is 0
      wrapper : k % 8 is 1 # test this with all cases of libArb
      # test these occasionally
      minifier    : k % 4 is 1
      testcutter  : k % 5 is 1
    opts.ns = 'WOWZ' if k % 3 is 0

    generateApp(opts, k)

    workDir = dir+'/input/'+k+'/'

    flags = ["#{workDir}main/entry.js"]
    flags.push "-p dom=#{workDir}dom/" if opts.dom
    flags.push "-t" if opts.testcutter
    flags.push "-m" if opts.minifier
    flags.push "-w lib1" if opts.wrapper # should work regardless of arbiter status of lib1
    flags.push "-n "+opts.ns if opts.ns
    flags.push "-d dataKey=#{workDir}data.json" if opts.data
    flags.push "-g #{workDir}plug/" if opts.plug

    #flags.push "-l 0" ?
    flags.push "-o #{workDir}output.js"
    #flags.push "-z"

    if opts.lib1Arb and opts.lib2Arb
      flags.push "-a lib1&lib2=libTest2"
    else if opts.lib1Arb
      flags.push "-a lib1"
    else if opts.lib2Arb
      flags.push "-a lib2=libTest2"

    callCLI(flags.join(' '))

    ns = opts.ns or 'M8'

    browser = new zombie.Browser()
    browser.visit 'file:///'+dir+"/empty.html", (err, browser, status) ->
      throw err if err
      mainCode = compile(workDir+'output.js')
      libs1 = compile(workDir+'libs/lib1.js')
      libs2 = compile(workDir+'libs/lib2.js')

      browser.evaluate libs1
      browser.evaluate libs2

      count = 4

      if opts.lib1Arb
        assert.isUndefined(browser.evaluate "window.lib1", "lib1 globals exist")
        count += 1
      else
        assert.isDefined(browser.evaluate "window.lib1", "lib1 global has been removed")
        assert.type(browser.evaluate("window.lib1"), "function", "lib1 is a function")
        count += 2

      assert.isUndefined(browser.evaluate(mainCode), ".compile() result evaluates successfully") # will throw if it fails
      assert.isDefined(browser.evaluate(ns), "namespace exists")
      assert.isDefined(browser.evaluate(ns+".require"), "require fn exists")
      assert.isDefined(browser.evaluate(ns+".require('./entry')"), "can require entry point run #{k}")

      if opts.lib1Arb
        assert.isDefined(browser.evaluate ns+".require('lib1')", "lib1 is arbitered")
        count += 1
      if opts.lib2Arb
        assert.isDefined(browser.evaluate ns+".require('lib2')", "lib2 is arbitered correctly")
        count += 1

      if opts.data
        assert.isDefined(browser.evaluate ns+".require('data::dataKey')", "can require dataKey")
        assert.isDefined(browser.evaluate ns+".require('./entry').data", "data was also required via entry")
        count += 2

      if opts.dom
        assert.isDefined(browser.evaluate ns+".require('dom::')", "domain can be required")
        assert.isDefined(browser.evaluate ns+".require('./entry').domain", "domain was successfully required from entry too")
        count += 2

      testsDone(count)
    null

