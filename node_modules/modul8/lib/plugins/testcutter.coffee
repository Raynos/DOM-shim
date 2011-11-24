# modul8 pre-processing middleware - applied before analysis and before bundling

# avoids pulling in test dependencies and test code
module.exports = (code) ->
  code.replace(/\n.*require.main[\w\W]*$/, '')
  #TODO: this can eventually use burrito if popular, but for now this is fine.
