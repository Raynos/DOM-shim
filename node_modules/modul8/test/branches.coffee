zombie    = require 'zombie'
assert    = require 'assert'
fs        = require 'fs'
rimraf    = require 'rimraf'
detective = require 'detective'
utils     = require './../lib/utils'    # hook in to this
analysis  = require './../lib/analysis' # hook in to this
resolver  = require './../lib/resolver' # hook in to this
modul8    = require './../index.js' # public interface
dir       = __dirname

{isLegalRequire, Resolver} = resolver


makeBranch = (num, domain, folder, same=[], cross=[]) ->
  for i in [0...num]
    l = []
    l.push "var a = b = c = d = e = {chain:true};" # initalize safes in case we do not use them

    l.push "a = require('./#{i+1}');" if i < num-1  # a checks the basic chain up to num

    # mixin sub-branches from other folders to spice things up a bit (see the dependency tree)

    # b, c are basic mixins
    l.push "b = require('./#{same[0]}#{i}.js');" if same[0]? and i is 3
    l.push "c = require('./#{same[1]}#{i}.js');" if same[1]? and i is 2

    # d, e are cross domain mixins
    l.push "d = require('#{cross[0].dom}::#{cross[0].branch}#{i}');" if cross[0]? and i is 3
    l.push "e = require('#{cross[1].dom}::#{cross[1].branch}#{i}');" if cross[1]? and i is 2

    l.push "exports.chain = a.chain && b.chain && c.chain && d.chain && e.chain;" # everything this module requires must resolve!
    fs.writeFileSync(dir+'/input/'+domain+'/'+folder+i+'.js', l.join('\n'))


options =
  domains:
    'app'       : dir+'/input/app/'
    'internal'  : dir+'/input/internal/'
    'shared'    : dir+'/input/shared/'
    'crazy'     : dir+'/input/crazy/'

  chains :
    'app' : [
      { folder: 'branch1/' }#, cross: [{dom:'shared', branch:''}] }
      { folder: 'branch2/', mix: ['../branch1/', '../branch1/'] }
    ]
    'shared' : [
      { folder: '', mix: ['branch1/'] } # shared::k <- shared::branch1::k for some k
      { folder: 'branch1/'}
    ]
    'internal' : [
      { folder: ''}#, mix: ['']} # mixin of self is circular and does throw
      { folder: 'control/', mix: ['../']}
    ]
    'crazy'   : [
      {folder: 'waa/', cross: [{dom:'shared', branch: 'branch1/'}, {dom:'internal', branch:''}] }
      {folder: ''}
    ]
  size : 6

hasRun = false
generateApp = -> # dont call this with size < 4 otherwise we wont get the mixins
  return if hasRun
  hasRun = true
  l = [] # generate an entry point simultaneously with module generation

  # clean out old directory
  try rimraf.sync(dir+'/input')
  catch e
  fs.mkdirSync(dir+'/input', 0755)
  size = options.size
  for domain, domChains of options.chains
    fs.mkdirSync(dir+'/input/'+domain, 0755)
    prefix = if domain is 'app' then '' else domain+'::'
    for chain in domChains
      fs.mkdirSync(dir+'/input/'+domain+'/'+chain.folder, 0755) if chain.folder # only truth test this (do not want to create dir with empty name)
      makeBranch(size, domain, chain.folder, chain.mix, chain.cross)
      l.push "exports.#{domain}_#{chain.folder[0...-1]} = require('#{prefix}#{chain.folder}0');" #exports name slices away the trailing slash from folder if it exists

  fs.writeFileSync(dir+'/input/app/entry.js', l.join('\n')) # write entry point

  modul8(dir+'/input/app/entry.js')
    .set('force', true)
    #.analysis(console.log)
    .domains()
      .add('internal', dir+'/input/internal/')
      .add('shared', dir+'/input/shared/')
      .add('crazy', dir+'/input/crazy/')
    .compile(dir+'/output/output.js')


exports["test require#branches"] = ->
  generateApp()
  num = options.size

  compile = utils.makeCompiler()

  browser = new zombie.Browser()
  browser.visit 'file:///'+dir+"/empty.html", (err, browser, status) ->
    throw err if err
    mainCode = compile(dir+'/output/output.js')

    assert.isUndefined(browser.evaluate(mainCode), ".compile() result evaluates successfully") # will throw if it fails
    assert.isDefined(browser.evaluate("M8"), "global namespace is defined")
    assert.isDefined(browser.evaluate("M8.require"), "require is globally accessible")
    assert.type(browser.evaluate("M8.require"), 'function', "require is a function")
    assert.ok(browser.evaluate("M8.require('entry')"), 'require resolves entrypoint')
    testCount = 5

    for domain, domChains of options.chains
      assert.includes(browser.evaluate("M8.domains()"), domain, "domains() contain #{domain}")
      testCount++
      prefix = if domain is 'app' then '' else domain+'::'

      for chain in domChains
        for i in [0...num]
          assert.isDefined(browser.evaluate("M8.require('#{domain}::#{chain.folder}#{i}.js')"), "require('#{domain}::#{chain.folder}#{i}.js') is defined with full specifier")
          assert.isDefined(browser.evaluate("M8.require('#{domain}::#{chain.folder}#{i}')"), "require('#{domain}::#{chain.folder}#{i}') is defined with full specifier no ext")
          assert.isDefined(browser.evaluate("M8.require('#{prefix}#{chain.folder}#{i}.js')"), "require('#{prefix}#{chain.folder}#{i}.js') is defined without domain specifier (when applicable)")
          assert.isDefined(browser.evaluate("M8.require('#{prefix}#{chain.folder}#{i}')"), "require('#{prefix}#{chain.folder}#{i}') is defined without ext and domain specifier (when applicable)")
          testCount+=4

        assert.ok(browser.evaluate("M8.require('entry').#{domain}_#{chain.folder[0...-1]}"), "require entrys domain_chain: #{domain}_#{chain.folder[0...-1]} works")
        testCount++
    console.log 'require#branches - completed:', testCount
  return

exports["test analyzer#order"] = ->
  generateApp()
  exts = ['','.js','.coffee']
  resolver = new Resolver(options.domains, {}, exts) # no arbiters
  compile = utils.makeCompiler()
  ca = analysis
    entryPoint : 'entry.js'
    domains    : options.domains
    before     : (a) -> a
    arbiters   : {}
    ignoreDoms : []
    exts       : exts
    compile # argument 2
  order = ca.sorted()

  assert.ok(order.length, "order is a non-empty array") # we are testing the giant app
  testCount = 1

  included = []
  for [domain, name] in order
    assert.ok(domain, "domain found for #{name}")
    assert.ok(utils.exists(options.domains[domain]+name), "file #{domain}::#{name} resolves on #{options.domains[domain]}")
    testCount+=2

    # now detective directly and hook into resolver to see if requirements have been included previously!
    subFolders = name.split('/')[0...-1]
    code = compile(options.domains[domain]+name)
    deps = (resolver.locate(dep, subFolders, domain) for dep in detective(code) when isLegalRequire(dep)) # should trivially resolve because we know full string and domain

    for [n,d,fake] in deps when !fake
      assert.includes(included, d+'::'+n, "#{domain}::#{name} requires #{d}::#{n}, which should have been included before")
      testCount+=1

    included.push domain+'::'+name

  console.log "analyzer#order - completed:", testCount
