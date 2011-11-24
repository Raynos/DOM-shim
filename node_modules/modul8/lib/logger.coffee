# Logger
# Adapted from socket.io-node's logger

# arguments helper
toArray = (enu) ->
  e for e in enu

# Log levels
levels = [
  'error'
  'warn'
  'info'
  'debug'
]

# Colors for log levels
colors = [
  31
  33
  36
  90
]

# Count from levels
max = Math.max.apply({}, levels.map((l) -> l.length))
num = levels.length

# Pads the nice output to the longest log level
pad = (str) ->
  return str + new Array(max - str.length + 1).join(' ') if str.length < max
  str

# Public API

# Logger Class (used to be exports)
module.exports = Logger = (@colors=true) ->

# Log method
Logger::log = (type) ->
  index = levels.indexOf(type)
  return @ if index >= num

  console.log.apply console, [
      if @colors
        '   \033[' + colors[index] + 'm' + pad(type) + ' -\033[39m'
      else
        type + ':'
    ].concat(toArray(arguments)[1...])
  @

# Generate methods
levels.forEach (name) ->
  Logger::[name] = ->
    @log.apply(@, [name].concat(toArray(arguments)))

# Quick test
if module is require.main
  log = new Logger({colors:true})
  log.warn('this could be bad').info('wee').error('this bad.').debug('irrelephant')
