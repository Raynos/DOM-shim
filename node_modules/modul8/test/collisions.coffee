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

{isLegalRequire, Resolver} = resolver


options =
  domains :
    'app'    : dir+'/collisions/app/'
    'shared' : dir+'/collisions/shared/'

  exts : [
    '.js'
    '.coffee'
    '.coco'
  ]

makeFiles = (domain, name, num) ->
  sc = if num > 0 then '' else ';' # must be coffee-script compliant

  ext1 = if name is 'clash' then options.exts[0] else options.exts[num] # clash fixes outer extension to js
  ext2 = if name is 'revclsh' then options.exts[0] else options.exts[num] #revclash fixes inner extension to js

  if name isnt 'safe'
    fs.writeFileSync(dir+'/collisions/'+domain+'/'+name+num + ext1, "exports.outside = true"+sc)

  fs.writeFileSync(dir+'/collisions/'+domain+'/'+name+num+'/index'+ext2, "exports.inside = true"+sc)

generateApp = ->

  l = [] # generate an entry point simultaneously with module generation

  # clean out old directory
  try rimraf.sync(dir+'/collisions')
  catch e
  fs.mkdirSync(dir+'/collisions', 0755)
  for domain of options.domains
    fs.mkdirSync(dir+'/collisions/'+domain, 0755)
    prefix = if domain is 'app' then '' else domain+'::'
    for i in [0...options.exts.length]
      fs.mkdirSync(dir+'/collisions/'+domain+'/safe'+i, 0755)
      makeFiles(domain, 'safe', i) # create a non-clashing index file under /safe+i

      # require both variants
      l.push "exports.#{domain}_safe#{i}slash = require('#{prefix}safe#{i}/');"
      l.push "exports.#{domain}_safe#{i} = require('#{prefix}safe#{i}');"

      fs.mkdirSync(dir+'/collisions/'+domain+'/unsafe'+i, 0755)
      makeFiles(domain, 'unsafe', i) # create clashing index file under /unsafe+i (clashes with unsafe+i.js in root)

      # require both variants (distinct files here)
      l.push "exports.#{domain}_unsafe#{i}slash = require('#{prefix}unsafe#{i}/');"
      l.push "exports.#{domain}_unsafe#{i} = require('#{prefix}unsafe#{i}');" # should find file rather than /index


      fs.mkdirSync(dir+'/collisions/'+domain+'/clash'+i, 0755)
      makeFiles(domain, 'clash', i) # unsafe, fixing outer ext to .js

      # require both variants
      l.push "exports.#{domain}_clash#{i}slash = require('#{prefix}clash#{i}/');"
      l.push "exports.#{domain}_clash#{i} = require('#{prefix}clash#{i}');"


      fs.mkdirSync(dir+'/collisions/'+domain+'/revclash'+i, 0755)
      makeFiles(domain, 'revclash', i) # unsafe, fixing inner ext to .js

      # require both variants
      l.push "exports.#{domain}_revclash#{i}slash = require('#{prefix}revclash#{i}/');"
      l.push "exports.#{domain}_revclash#{i} = require('#{prefix}revclash#{i}');"


  fs.writeFileSync(dir+'/collisions/app/entry.js', l.join('\n')) # write entry point

  usedDoms = {}
  usedDoms[key] = val for key, val of options.domains when key isnt 'app'

  modul8(options.domains.app+'entry.js')
    #.analysis(console.log).suffix(true)
    .domains(usedDoms)
    .set('force', true)
    .register('.coco', (code) -> coffee.compile(code, {bare:true})) #alias coco as this compiler for simplicity
    .compile(dir+'/output/outc.js')



exports["test require#collisions"] = ->
  generateApp()
  compile = utils.makeCompiler()

  browser = new zombie.Browser()
  browser.visit 'file:///'+dir+"/empty.html", (err, browser, status) ->
    throw err if err
    mainCode = compile(dir+'/output/outc.js')

    assert.isUndefined(browser.evaluate(mainCode), ".compile() result evaluates successfully") # will throw if it fails
    assert.isDefined(browser.evaluate("M8"), "global namespace is defined")
    testCount = 2


    for dom of options.domains
      for i in [0...options.exts.length]
        assert.ok(browser.evaluate("M8.require('entry').#{dom}_safe#{i}slash.inside"), "#{dom}_safe#{i}slash is defined and is inside")
        assert.ok(browser.evaluate("M8.require('entry').#{dom}_safe#{i}.inside"), "#{dom}_safe#{i} is defined and is inside")

        assert.ok(browser.evaluate("M8.require('entry').#{dom}_unsafe#{i}slash.inside"), "#{dom}_unsafe#{i}slash is defined and is inside")
        assert.ok(browser.evaluate("M8.require('entry').#{dom}_unsafe#{i}.outside"), "#{dom}_undsafe#{i} is defined and is outside")

        assert.ok(browser.evaluate("M8.require('entry').#{dom}_clash#{i}slash.inside"), "#{dom}_clash#{i}slash is defined and is inside")
        assert.ok(browser.evaluate("M8.require('entry').#{dom}_clash#{i}.outside"), "#{dom}_clash#{i} is defined and is outside")

        assert.ok(browser.evaluate("M8.require('entry').#{dom}_revclash#{i}slash.inside"), "#{dom}_revclash#{i}slash is defined and is inside")
        assert.ok(browser.evaluate("M8.require('entry').#{dom}_revclash#{i}.outside"), "#{dom}_revclash#{i} is defined and is outside")
        testCount += 8


    console.log 'require#collisions - completed:', testCount
  return
