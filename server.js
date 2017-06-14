// server.js
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var dbfunc = require('./dbfunctions');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// =============================================================================
// User routes
router.post('/user', function(req, res) {
    console.log(req.body);
    dbfunc.createUser(req.body);
});
router.delete('/user', function(req, res) {
    res.json({ message: 'delete user' });
});
// =============================================================================

// =============================================================================
//WG-Routes
router.get('/group', function(req, res) {
    res.json({ message: 'Get WG with tasks an members' });
});
router.post('/group', function(req, res) {
    console.log(req.body);
    dbfunc.createFlat(req.body); 
});
router.put('/group', function(req, res) {
    console.log(req.body);

    res.json({ message: 'Add user to WG' });
});
router.delete('/group', function(req, res) {
    res.json({ message: 'Delete WG' });
});
router.delete('/group/user', function(req, res) {
    res.json({ message: 'Rmoe User from WG' });
});
// =============================================================================

// =============================================================================
// Task routes
router.post('/group/task', function(req, res) {
    res.json({ message: 'It is <name> turn to clean' });
});
router.put('/group/task', function(req, res) {
    res.json({ message: '<name> finished his job' });
});
router.delete('/group/task', function(req, res) {
    res.json({ message: 'Delete task' });
});
// =============================================================================





// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/app', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
