//dbfunctions.js
var mongoose = require('mongoose');
var User = require('./scheme').user;
var Flat = require('./scheme').flat;
var Task = require('./scheme').task;
var bcrypt = require('bcryptjs');
var fs = require('fs');
var randomstring = require("randomstring");
// =============================================================================
// Database connection
mongoose.connect('mongodb://root:toor@ds119718.mlab.com:19718/bruckieshood');
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
  User.findOne({
    "userName": obj.userName
  }, function(err, user) {
    if (user == null) {
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
  User.findOne({
    'userName': obj.userName
  }, function(err, user) {
    hash = user.password;
    if (bcrypt.compareSync(obj.password, hash)) {
      res.json({
        auth: 'ok'
      });
    } else {
      res.json({
        auth: 'err'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given JSON object
exports.createFlat = function(res, obj) {
  var newFlat = new Flat(obj);
  newFlat.save(function(error, flat) {
    if (!error) {
      console.log(flat._id);
      res.json({flatId:flat._id})
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
        }
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteFlat = function(flatId) {
  Flat.findOneAndRemove({
    "_id": flatId
  }, function(err) {
    console.log("Flat with ID: " + flatId + " successfuly removed");
  });
}
// =============================================================================

// =============================================================================
// db function to delete a User with given userName
// function automatically removes user from flats
exports.deleteUser = function(userName) {
  User.findOne({
    "userName": userName
  }, function(err, user) {
    Flat.findOne({
      "residents": user._id
    }, function(err, flat) {
      console.log("FLAT:" + flat);
      flat.residents.pull({
        "_id": user._id
      });
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
  Flat.findOne({
    "_id": flatId
  }, function(err, flat) {
    if (!err) {
      User.findOne({
        "userName": userName
      }, function(err, user) {
        if (!err) {
          flat.residents.pull({
            "_id": user._id
          });
          flat.save();
        }
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to get a Flat with given userName
exports.getFlatByUserName = function(res, query) {
  User.findOne({
    "userName": query.userName
  }, function(err, user) {
    if (!err) {
      Flat.findOne({
        "residents": user._id
      }).populate("residents").exec(function(err, flat) {
        if (!err) {
          res.json(flat);
        }
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to update a Flat with given flatId
exports.updateFlat = function(obj) {
  Flat.findOne({
    "_id": obj.flatId
  }, function(err, flat) {
    if (!err) {
      if (obj.name && obj.name != flat.name) {
        flat.name = obj.name;
      } else if (obj.penalty && obj.penalty != flat.penalty) {
        flat.penalty = obj.penalty
      }
      flat.save();
    }
  });
}
// =============================================================================

// =============================================================================
// db function to get all users from a Flat with given flatId
exports.getUsersByFlatId = function(res, query) {
  Flat.findOne({
    "_id": query.flatId
  }).populate("residents").exec(function(err, flat) {
    if (!err) {
      res.json(flat.residents);
    }
  });
}
// =============================================================================

// =============================================================================
// db function to get all tasks from a Flat with given flatId
exports.getTasksByFlatId = function(res, query) {
  Flat.findOne({
    "_id": query.flatId
  }).populate("residents").exec(function(err, flat) {
    var taskArray = [];
    if (!err) {
      flat.residents.some(function(resident) {
        console.log(resident.tasks);
        taskArray.push(resident.tasks);
      });
      res.json(taskArray);
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a task with given username
exports.createTask = function(res, obj) {
  User.findOne({
    "userName": obj.userName
  }, function(err, user) {
    if (!err) {
      var newTask = new Task(obj.task);
      newTask.save(function(err) {
        if (!err) {
          user.tasks.push(newTask);
          user.save();
		  
        }
      });
	  res.json({taskId:newTask._id});
    }
  });
}
// =============================================================================

// =============================================================================
// db function to get a task with given taksID
exports.getTaskByTaskId = function(res, query) {
  Task.findOne({
    "_id": query.taskId
  }, function(err, task) {
    if (!err) {
      res.json(task);
    }
  });
}
// =============================================================================

// =============================================================================
// db function to change a tasks completion state with given taksID
exports.changeTaskState = function(obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    if (!err) {
      task.state = obj.state;
      task.save();
    }
  });
}
// =============================================================================

// =============================================================================
// db function to update a task with given taskID
exports.updateTask = function(obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    if (!err) {
      if (obj.name && obj.name != task.name) {
        task.name = obj.name;
      } else if (obj.deadline && obj.deadline != task.deadline) {
        task.deadline = obj.deadline;
      } else if (obj.guideline && obj.guideline != task.guideline) {
        task.guideline = obj.guideline;
      }
      task.save();
    }
  });
}
// =============================================================================

// =============================================================================
// db function to add an Image to a task with given taskID
// the image is stored on the server
exports.addImageToTask = function(obj) {
  console.log(obj);
  var rawImg = obj.picture,
    base64Data = rawImg.replace(/^data:image\/png;base64,/, ''),
    dirpath = config.root + '/files/img/',
    imageName = randomstring.generate(12) + '.png',
    imageLocation = dirpath + imageName;
  fs.writeFile(imageLocation, base64Data, 'base64', function(err) {
    if (!err) {
      Task.findOne({
        "_id": obj.taskId
      }, function(err, task) {
        task.images.push(imageLocation);
        task.save();
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to add a comment to a task with given taskID
exports.addCommentToTask = function(obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    console.log(task);
    if (!err) {
      task.comments.push(obj.comment);
      task.save();
    }
  });
}
// =============================================================================

// =============================================================================
// db function to get all tasks of an with given username
exports.getTasksByUserName = function(res, query) {
  User.findOne({
    "userName": query.userName
  }).populate("tasks").exec(function(err, user) {
    if (!err) {
      res.json(user.tasks);
    }
  });
}
// =============================================================================

// =============================================================================
// db function to assign a task to the next user with given taskid,
// oldUserName and newUserName
exports.assignTaskToNextUser = function(obj) {
  User.findOne({
    "userName": obj.oldUserName
  }, function(err, user) {
    if (!err) {
      user.tasks.pull({
        "_id": obj.taskId
      });
      user.save();
      User.findOne({
        "userName": obj.newUserName
      }, function(err, user) {
        if (!err) {
          user.tasks.push(obj.taskId);
          user.save();
        }
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Task with given TaskId
exports.deleteTask = function(obj) {
  User.findOne({"tasks":obj.taskId}, function(err, user){
    if(!err){
      user.tasks.pull({"_id":obj.taskId});
      user.save();
      Task.findOneAndRemove({"_id":obj.taskId}, function(err){});
    }
  });
}
// =============================================================================
