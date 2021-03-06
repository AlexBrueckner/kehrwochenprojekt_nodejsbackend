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
exports.user = mongoose.model('User', userSchema);

var taskSchema = new mongoose.Schema({
  name: String,
  creationDate: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  state: {
    type: String,
    enum: ['RED', 'YELLOW', 'GREEN'],
    default: 'RED'
  },
  images: [String],
  comments: [String],
  guideline: String
});
exports.task = mongoose.model('Task', taskSchema);

var flatSchema = new mongoose.Schema({
  name: String,
  residents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  penalty: String
});
exports.flat = mongoose.model('Flat', flatSchema);
