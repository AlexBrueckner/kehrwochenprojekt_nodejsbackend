//dbfunctions.js
var mongoose = require('mongoose');
var User = require('./scheme').user;
var Flat = require('./scheme').flat;
var Task = require('./scheme').task;
// =============================================================================
// Database connection
mongoose.connect('mongodb://root:toor@ds123662.mlab.com:23662/mc_database');
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Database connection succeeded.");
});
// =============================================================================

// =============================================================================
// db function to create a new User with given JSON object
exports.createUser = function(obj) {
  var newUser = new User(obj);
  newUser.save(function(error) {
    if (!error) {
      console.log("New User added to database");
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given JSON object
exports.createFlat = function(obj) {
  var newFlat = new Flat(obj);
  newFlat.save(function(error) {
    if (!error) {
      console.log("New Flat added to database")
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given username and flatid
exports.addUserToFlat = function(userName, flatId) {
  User.findOne({
    'userName': userName
  }, function(err, user) {
    if (!err && user) {
      Flat.findOne({
        '_id': flatId
      }, function(err, flat) {
        if (!err && flat) {
        if (!flat.residents.some(function(resident) {
            return resident.equals(user.id);
          })) {
          flat.residents.push(user);
          flat.save();
        }
      }});
  }});
}
// =============================================================================
// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteFlat = function(flatId) {
  Flat.findOneAndRemove({"_id":flatId}, function(err){
    console.log("Flat with ID: " + flatId + " successfuly removed");
  });
}
// =============================================================================
// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteUser = function(userName) {
  User.findOneAndRemove({"userName":userName}, function(err){
    console.log("User with name: " + userName + " successfuly removed");
  });
}
// =============================================================================
// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteUserFromFlat = function(userName, flatId) {
  User.findOneAndRemove({"userName":userName}, function(err, user){
    if(!err){
    console.log("User with name: " + userName + " successfuly removed");
    Flat.findOneAndRemove({"residents.user._id":user._id}, function(err){
      if (!err) {
        console.log("User with name:" + userName + " successfuly removed from FLAT");
      }
    });
  }
  });
}
// =============================================================================
