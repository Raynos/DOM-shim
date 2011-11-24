helper = require('./helper')
# relative require looks only in this domain

helper('hello from app via helper')

b = require('bigthing/sub1')

b.doComplex('app calls up to sub1')


v = require('validation.coffee')
# wont be found on clients require path
# but will be found on the shared path

console.log('2004 isLeapYear?', v.isLeapYear(2004))


#!!window.monolith; # -> false
#monolith uses an arbiter so only require can access it
m = require('monolith')
console.log("monolith:"+m)


#injected data
test = require('data::test')
console.log 'injected data:', test
