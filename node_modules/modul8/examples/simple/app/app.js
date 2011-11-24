var Users = require('controllers/users');
var $ = require('jQuery');

var App = {
  init: function(){
    $('#output').text( JSON.stringify(Users.init()) );
  }
}.init();
