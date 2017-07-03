// server.js
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var dbfunc = require('./dbfunctions');




//increase bodyparse capacity limit so pictures can be sent
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var port = 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// =============================================================================
// /app/user
router.get('/user', function(req,res){
  dbfunc.getUserById(res, req.query);
});
router.post('/user', function(req, res) {
  dbfunc.createUser(res, req.body);
});
router.put('/user', function(req, res) {
  dbfunc.checkUserAuth(res, req.body);
});
router.delete('/user', function(req, res) {
  dbfunc.deleteUser(res, req.body.userName);
});
// =============================================================================

// =============================================================================
// /app/group
router.get('/group', function(req, res) {
  dbfunc.getFlatByUserName(res, req.query);
});
router.post('/group', function(req, res) {
  dbfunc.createFlat(res, req.body);
});
router.put('/group', function(req, res) {
  dbfunc.addUserToFlat(res, req.body.userName, req.body.flatId);
});
router.patch('/group', function(req, res) {
  dbfunc.updateFlat(res, req.body);
});
router.delete('/group', function(req, res) {
  dbfunc.deleteFlat(res, req.body.flatId);
});
// =============================================================================

// =============================================================================
// /app/group/user
router.get('/group/user', function(req, res) {
  dbfunc.getUsersByFlatId(res, req.query);
});
router.delete('/group/user', function(req, res) {
  dbfunc.deleteUserFromFlat(res, req.body.userName, req.body.flatId);
});
// =============================================================================

// =============================================================================
// /app/group/task
router.get('/group/task', function(req, res) {
  dbfunc.getTasksByFlatId(res, req.query);
});
// =============================================================================

// =============================================================================
// /app/task
router.get('/task', function(req, res) {
  dbfunc.getTaskByTaskId(res, req.query);
});
router.post('/task', function(req, res) {
  dbfunc.createTask(res, req.body);
});
router.put('/task', function(req, res) {
  dbfunc.changeTaskState(res, req.body);
});
router.patch('/task', function(req, res) {
  dbfunc.updateTask(res, req.body);
});
router.delete('/task', function(req, res) {
  dbfunc.deleteTask(res, req.body);
});
// =============================================================================

// =============================================================================
// /app/task/images
router.post('/task/image', function(req, res) {
  dbfunc.addImageToTask(res, req.body);
});
// =============================================================================

// =============================================================================
// /app/task/images
router.post('/task/comment', function(req, res) {
  dbfunc.addCommentToTask(res, req.body);
});
// =============================================================================

// =============================================================================
// /app/task/user
router.get('/task/user', function(req, res) {
  dbfunc.getTasksByUserName(res, req.query);
});
router.post('/task/user', function(req, res) {
  dbfunc.assignTaskToNextUser(res, req.body);
});
// =============================================================================


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /app
app.use('/app', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
