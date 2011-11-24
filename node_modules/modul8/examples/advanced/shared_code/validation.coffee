{divides} = require('./calc') # CoffeeScript destructuring assignment


exports.isLeapYear = (yr) ->
  divides(yr,4) and (!divides(yr,100) or divides(yr,400))

