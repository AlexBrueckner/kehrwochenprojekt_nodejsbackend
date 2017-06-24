var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
  userName: String,
  password: String,
  foreName: String,
  surName: String,
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]
});
module.exports = mongoose.model('User', userSchema);
