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
exports.createUser = function(obj){
  var newUser = new User(obj);
  newUser.save(function(error){
    if(!error){
      console.log("New User added to database");
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given JSON object
exports.createFlat = function(obj){
  var newFlat = new Flat(obj);
  newFlat.save(function(error) {
    if (!error) {
      console.log("New Flat added to database")
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given JSON object
exports.addUserToFlat = function(username, flatId){
  
}
// =============================================================================
