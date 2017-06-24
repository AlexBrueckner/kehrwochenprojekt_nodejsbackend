var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var flatSchema = new mongoose.Schema({
  name: String,
  creator: String,
  residents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  penalty: String
});
module.export = mongoose.model('Flat', flatSchema);
