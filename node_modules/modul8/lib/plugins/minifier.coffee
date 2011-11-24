# modul8 post-processing middleware - applied only after bundling

# minifies javascript using UglifyJS


{uglify, parser} = require 'uglify-js'

module.exports = (code) ->
  uglify.gen_code(uglify.ast_squeeze(uglify.ast_mangle(parser.parse(code))))

