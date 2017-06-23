//dbfunctions.js
var mongoose = require('mongoose');
var User = require('./scheme').user;
var Flat = require('./scheme').flat;
var Task = require('./scheme').task;
var bcrypt = require('bcryptjs');
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
  obj.password = bcrypt.hashSync(obj.password, 8);
  var newUser = new User(obj);
  User.findOne({"userName":obj.userName}, function(err, user){
    if(user==null){
    newUser.save(function(err) {
      if (!err) {
        console.log("New User added to database");
      }
    });
  }
  });

}
// =============================================================================

// =============================================================================
// db function to check if a User is authenticated
exports.checkUserAuth = function(res, obj) {
  User.findOne({'userName':obj.userName}, function(err, user){
    hash = user.password;
    if(bcrypt.compareSync(obj.password, hash)){
      res.json({auth:'ok'});
    }
    else{
      res.json({auth:'err'});
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
// db function to delete a User with given userName
// function automatically removes user from flats
exports.deleteUser = function(userName) {
  User.findOne({"userName":userName}, function(err, user){
    Flat.findOne({"residents":user._id}, function(err, flat){
      console.log("FLAT:" + flat);
      flat.residents.pull({"_id":user._id});
      flat.save();
      user.remove();
      user.save();
      console.log("User with name: " + userName + " successfuly removed");
    });
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteUserFromFlat = function deleteUserFromFlat(userName, flatId) {
  Flat.findOne({"_id":flatId}, function(err, flat){
    if(!err){
    User.findOne({"userName":userName}, function(err, user){
      if(!err){
      flat.residents.pull({"_id":user._id});
      flat.save();
    }
    });
  }
  });
}
// =============================================================================

// =============================================================================
// db function to get a Flat with given userName
exports.getFlatWithUserName = function(res, query) {
  User.findOne({"userName":query.userName}, function(err, user){
    if(!err){
    Flat.findOne({"residents":user._id}).populate("residents").exec(function(err, flat){
      console.log(flat);
    });

  }
  });
  res.json({messsage:"bla"});
}
// =============================================================================
