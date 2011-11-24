module.exports = (str) ->
  console.log str


if module is require.main
  testRunner = require('testmodule') # even though this is required it wont be pulled in
  testRunner.assertEqual(2,2, "duh")
