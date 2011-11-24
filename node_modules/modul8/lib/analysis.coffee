fs          = require 'fs'
path        = require 'path'
detective   = require 'detective'
utils       = require './utils'
{Resolver, isLegalRequire} = require './resolver'


# constructor - resolves dependency tree and stores in @tree
CodeAnalysis = ({@entryPoint, @domains, @before, @ignoreDoms, exts, arbiters}, @compile) ->
  @resolver = new Resolver(@domains, arbiters, exts)
  @buildTree()
  return

# finds all dependencies of a module based on reqStr + domain & folders array of requirees position
CodeAnalysis::resolveDependencies = (absReq, folders, dom) ->
  # get javascript
  code = @compile(@domains[dom]+absReq)

  # apply pre-processing middleware here
  code = @before(code)

  # absolutize and locate everything here so we have a unique representation of each file
  @resolver.locate(dep, folders, dom) for dep in detective(code) when isLegalRequire(dep)


# private - loads each files depedencies and recursively calls itself on each new branch
CodeAnalysis::buildTree = ->
  @tree = {name: @entryPoint, domain: 'app', folders: [], deps: {}, fake: 0, level: 0}

  circularCheck = (t, uid) -> # follows branch up to make sure it does not find itself
    chain = [uid]
    loop
      return if t.parent is undefined # branch clean
      chain.push t.domain+'::'+t.name
      t = t.parent
      if chain[chain.length-1] is chain[0]
        throw new Error("modul8::analysis revealed a circular dependency: "+chain.join(' <- '))
    return

  ((t) =>
    for [name, domain, fake] in @resolveDependencies(t.name, t.folders, t.domain)
      uid = domain+'::'+name
      folders = name.split('/')[0...-1]
      t.deps[uid] = {name, domain, fake, folders, deps:{}, parent: t, level: t.level+1}
      if !fake
        circularCheck(t, uid) # throw on circular ref
        arguments.callee.call(@, t.deps[uid]) # preserve context and recurse
    return
  )(@tree) # resolve and recurse

  return

# helpers for print
makeCounter = (ignores) ->
  (obj) ->
    i = 0
    i++ for own key of obj when !(obj[key].domain in ignores)
    i

formatName = (absReq, extSuffix, domPrefix, dom) ->
  n = if extSuffix then absReq else absReq.split('.')[0]
  # take out reduntant index specifications to make (but only if we show domains)
  n = '' if n[0...5] is 'index' and not ('/' in n) and domPrefix # arguable feature perhaps
  n = dom+'::'+n if domPrefix
  n

# public method, returns an npm like dependency tree
CodeAnalysis::printed = (extSuffix=false, domPrefix=true) ->
  lines = [formatName(@entryPoint, extSuffix, domPrefix, 'app')]
  objCount = makeCounter(ignores=@ignoreDoms)

  ((branch, level, parentAry) ->
    idx = 0
    bSize = objCount(branch.deps)
    for uid, {name, deps, domain} of branch.deps when !(domain in ignores)
      hasChildren = objCount(deps) > 0
      forkChar = if hasChildren then "┬" else "─"
      isLast = ++idx is bSize
      turnChar = if isLast then "└" else "├"
      indent = ((if parentAry[i] then " " else "│")+"  " for i in [0...level]).join('')

      displayName = formatName(name, extSuffix, domPrefix, domain)
      lines.push " "+indent+turnChar+"──"+forkChar+displayName

      if hasChildren # recurse into uid's dependency tree keeping track of parent lines
        arguments.callee(branch.deps[uid], level+1, parentAry.concat(isLast))
    return
  )(@tree, 0, [])

  lines.join('\n')


# public method, get ordered array of code to be used by the compiler
CodeAnalysis::sorted = -> # must flatten the tree, and order based on level
  obj = {}
  obj['app::'+@entryPoint] = 0
  ((t) ->
    for uid,dep of t.deps when !dep.fake # impossible to compile fake files
      obj[uid] = Math.max(dep.level, obj[uid] or 0)
      arguments.callee(dep)
    return
  )(@tree)

  ([uid,level] for uid,level of obj)  # convert obj to (sortable) array
    .sort((a,b) -> b[1] - a[1])       # sort by level descending
    .map((e) -> e[0].split('::'))     # return after mapping to pairs of form [domain, name]


# export a closure bound instance of CodeAnalysis and an object of public methods
module.exports = (obj, compile) ->
  o = new CodeAnalysis(obj, compile)
  {
    printed : -> o.printed.apply(o, arguments)   # -> dependency tree string
    sorted  : -> o.sorted.apply(o, arguments)    # -> array of [domain, name] pairs in the order they should be inserted
  }
