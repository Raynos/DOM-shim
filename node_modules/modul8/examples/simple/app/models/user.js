var validation = require('utils/validation.js');

var User = {
  records : ['jack', 'jill'],

  fetch : function(){
    return this.records.filter(this.validate);
  },

  validate : function(user) {
    return validation.nameOk(user);
  }
};

module.exports = User;
