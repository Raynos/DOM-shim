var modul8  = require('../../')
  , fs      = require('fs');


modul8('./app_code/main.coffee')
  .before(modul8.testcutter)
  .libraries()
    .list(['monolith.js'])
    .path('./libraries/')
    .target('./outputlibs.js')
  .arbiters()
    .add('monolith')
  .domains()
    .add('shared', './shared_code/')
  .analysis()
    .output(console.log)
    .prefix(false)
  .data()
    .add('test', fs.readFileSync('./data.json', 'utf8'))
  .set('namespace', 'QQ')
  .set('force', true)
  .compile('./output.js');

// Alternatively use the CLI (for the app code):
// $ modul8 app_code/main.coffee -p shared=shared_code/ -a monolith -tn QQ -d test=data.json > output.js

// and same call with replacing '> output.js' with '-z' to get the analysis

