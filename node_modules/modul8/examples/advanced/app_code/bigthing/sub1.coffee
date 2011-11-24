sub2 = require('./sub2') # relative require

# we export a doComplex property for main
exports.doComplex = (str) -> # sub1 is an arbiter for sub2
  sub2(str+' (sub1 added this, passing to sub2)')
