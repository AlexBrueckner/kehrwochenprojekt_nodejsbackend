var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
  _userId : Schema.Types.ObjectId,
  userName: {
    type: String,
    lowercase: true
  },
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
  _taskId: Schema.Types.ObjectId,
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
  images: [{path: String}],
  comments: [{comment: String}],
  guideline: String
});
exports.task = mongoose.model('Task', taskSchema);

var flatSchema = new mongoose.Schema({
  _flatId: Schema.Types.ObjectId,
  name: String,
  residents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  penalty: String
});
exports.flat = mongoose.model('Flat', flatSchema);
