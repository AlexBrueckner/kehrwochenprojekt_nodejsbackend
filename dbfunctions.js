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
mongoose.connect('mongodb://root:toor@ds123662.mlab.com:23662/mc_database');
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Database connection succeeded.");
});
// =============================================================================

// =============================================================================
// db function to create a new User with given JSON object
exports.createUser = function(res, obj) {
  obj.password = bcrypt.hashSync(obj.password, 8);
  var newUser = new User(obj);
  User.findOne({
    "userName": obj.userName
  }, function(err, user) {
    if (user == null) {
      newUser.save(function(err) {
        if (!err) {
          res.json({
            ok: 'user added to database'
          });
          console.log("New User added to database");
        }
      });
    } else {
      res.json({
        errpr: 'user does already exist'
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
    if (user && !err) {
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
    } else {
      res.json({
        err: 'user not found'
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
      res.json({
        flatId: flat._id
      })
      console.log("New Flat added to database")
    } else {
      res.json({
        error: 'error while saving flat'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to create a new Flat with given username and flatid
exports.addUserToFlat = function(res, userName, flatId) {
  User.findOne({
    'userName': userName
  }, function(err, user) {
    if (!err && user) {
      Flat.findOne({
        '_id': flatId
      }, function(err, flat) {
        if (!err && flat) {
          if (!flat.residents.some(function(resident) {
              return resident.equals(user.id); //check if user is already in the flat
            })) {
            flat.residents.push(user);
            flat.save();
            res.json({
              ok: 'user added successfuly'
            });
          } else {
            res.json({
              error: 'user already in flat'
            });
          }
        } else {
          res.json({
            error: 'flat not found'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteFlat = function(res, flatId) {
  Flat.findOneAndRemove({
    "_id": flatId
  }, function(err) {
    if (!err) {
      res.json({
        ok: 'flat with id removed successfuly'
      })
    } else {
      res.json({
        error: 'err occured while removing the flat'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a User with given userName
// function automatically removes user from flats
exports.deleteUser = function(res, userName) {
  User.findOne({
    "userName": userName
  }, function(err, user) {
    if (!err && user) {
      Flat.findOne({
        "residents": user._id
      }, function(err, flat) {
        if (!err && flat) {
          console.log("FLAT:" + flat);
          flat.residents.pull({
            "_id": user._id
          });
          flat.save();
          user.remove();
          user.save();
          res.json({
            ok: 'user successfuly removed'
          });
        } else {
          res.json({
            error: 'user not found'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Flat with given flatid
exports.deleteUserFromFlat = function deleteUserFromFlat(res, userName, flatId) {
  Flat.findOne({
    "_id": flatId
  }, function(err, flat) {
    if (!err && flat) {
      User.findOne({
        "userName": userName
      }, function(err, user) {
        if (!err && user) {
          flat.residents.pull({
            "_id": user._id
          });
          flat.save();
          res.json({
            ok: 'user successfuly removed from flat'
          });
        } else {
          res.json({
            error: 'user not found'
          });
        }
      });
    } else {
      res.json({
        error: 'flat not found'
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
    if (!err && user) {
      Flat.findOne({
        "residents": user._id
      }).populate("residents").exec(function(err, flat) {
        if (!err && user) {
          res.json(flat);
        } else {
          res.json({
            error: 'user not found'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to update a Flat with given flatId
exports.updateFlat = function(res, obj) {
  Flat.findOne({
    "_id": obj.flatId
  }, function(err, flat) {
    if (!err && flat) {
      if (obj.name && obj.name != flat.name) {
        flat.name = obj.name;
      } else if (obj.penalty && obj.penalty != flat.penalty) {
        flat.penalty = obj.penalty
      }
      flat.save();
      res.json({
        ok: 'flat not found'
      });
    } else {
      res.json({
        error: 'flat not found'
      });
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
    if (!err && flat) {
      res.json(flat.residents);
    } else {
      res.json({
        error: 'user not found'
      });
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
    if (!err && flat) {
      flat.residents.some(function(resident) {
        taskArray.push(resident.tasks);
      });
      res.json(taskArray);
    } else {
      res.json({
        error: 'flat not found'
      });
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
    if (!err && user) {
      var newTask = new Task(obj.task);
      newTask.save(function(err) {
        if (!err) {
          user.tasks.push(newTask);
          user.save();
          res.json({
            taskId: newTask._id
          });
        } else {
          res.json({
            error: 'error occured while saving task'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
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
    if (!err && task) {
      res.json(task);
    } else {
      res.json({
        error: 'task not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to change a tasks completion state with given taksID
exports.changeTaskState = function(res, obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    if (!err && task) {
      task.state = obj.state;
      task.save();
      res.json({
        ok: 'task state changed'
      });
    } else {
      res.json({
        error: 'task not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to update a task with given taskID
exports.updateTask = function(res, obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    if (!err && task) {
      if (obj.name && obj.name != task.name) {
        task.name = obj.name;
      } else if (obj.deadline && obj.deadline != task.deadline) {
        task.deadline = obj.deadline;
      } else if (obj.guideline && obj.guideline != task.guideline) {
        task.guideline = obj.guideline;
      }
      task.save();
      res.json({
        ok: 'task successfuly updated'
      });
    } else {
      res.json({
        error: 'task not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to add an Image to a task with given taskID
// the image is stored on the server
exports.addImageToTask = function(res, obj) {
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
        if (!err && task) {
          task.images.push(imageLocation);
          task.save();
          res.json({
            ok: 'image successfuly added to task'
          });
        } else {
          res.json({
            error: 'task not found'
          })
        }
      });
    } else {
      res.json({
        error: 'error while writing image'
      })
    }
  });
}
// =============================================================================

// =============================================================================
// db function to add a comment to a task with given taskID
exports.addCommentToTask = function(res, obj) {
  Task.findOne({
    "_id": obj.taskId
  }, function(err, task) {
    console.log(task);
    if (!err && task) {
      task.comments.push(obj.comment);
      task.save();
      res.json({
        ok: 'comment successfuly added'
      });
    } else {
      res.json({
        error: 'task not found'
      });
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
    if (!err && user) {
      res.json(user.tasks);
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to assign a task to the next user with given taskid,
// oldUserName and newUserName
exports.assignTaskToNextUser = function(res, obj) {
  User.findOne({
    "userName": obj.oldUserName
  }, function(err, user) {
    if (!err && user) {
      user.tasks.pull({
        "_id": obj.taskId
      });
      user.save();
      User.findOne({
        "userName": obj.newUserName
      }, function(err, user) {
        if (!err && user) {
          user.tasks.push(obj.taskId);
          user.save();
          res.json({
            ok: 'task succesfuly assigned to user'
          });
        } else {
          res.json({
            error: 'user not found'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Task with given TaskId
exports.deleteTask = function(res, obj) {
  User.findOne({
    "tasks": obj.taskId
  }, function(err, user) {
    if (!err && user) {
      user.tasks.pull({
        "_id": obj.taskId
      });
      user.save();
      Task.findOneAndRemove({
        "_id": obj.taskId
      }, function(err, task) {
        if (!err && task) {
          res.json({
            ok: 'task succesfuly removed'
          });
        } else {
          res.json({
            error: 'task not found'
          });
        }
      });
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================

// =============================================================================
// db function to delete a Task with given TaskId
exports.getUserById = function(res, query) {
  User.findOne({
    "userName": query.userName
  }, function(err, user) {
    if (!err && user) {
      res.json(user);
    } else {
      res.json({
        error: 'user not found'
      });
    }
  });
}
// =============================================================================
