var modul8 = require('../../');

modul8('./app/app.js')
  .domains({shared: './shared/'})
  .compile('./output.js');

// alternatively use the CLI:
// $ modul8 app/app.js > output.js
