var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
module.export = mongoose.model('Task', taskSchema);
