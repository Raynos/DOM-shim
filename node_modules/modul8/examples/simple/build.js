var modul8 = require('../../');

modul8('./app_code/app.js')
  .arbiters({jQuery:['jQuery','$'])
  .analysis(console.log)
  .set('domloader', 'jQuery')
  .compile('./output.js');

// alternatively use the CLI:
// $ modul8 app/app.js -a jQuery=jQuery,$ -w jQuery > output.js
