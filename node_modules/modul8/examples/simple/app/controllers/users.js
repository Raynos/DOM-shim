var User = require('models/user');

var Users = {
  init : function(){
    return User.fetch();
  }
};

module.exports = Users;
