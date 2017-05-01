// Server side handle of login and database queries
var routes = require("./routes/handleEndpoints.js");

// Read in arguments for gameConfig and database creds
var fs = require('fs');
var gameConfig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var creds = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));

// Loading server related things for PeerJS
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize rethinkdb Connection
r = require("rethinkdb");
var connection = null;
r.connect( creds, function(err, conn) {
	if (err) throw err
  	connection = conn;
	// Create db and table if necessary
	r.dbCreate('GG').run(connection, function() {


	});

	r.db("GG").tableCreate("users").run(connection, function() {

	});
});

// Requires slashes be at end of path and no slash on name
gameConfig.games.forEach(function (val) {
	console.log("Loaded: /" + val.name);
	app.get('/' + val.name, function(req, res, next) {
		console.log("/" + val.name );
		res.sendFile(val.path + "/" + val.file, { root: __dirname } );
	});

});

// load homepage
app.get("/", function(req, res, next) {
    console.log("/");
    res.sendFile("project/index.html", {root : __dirname } );
});

// Open web app on port 9000 allow peer's to discover each other
var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/" + gameConfig.main_directory, express.static(__dirname + '/' + gameConfig.main_directory));


// API endpoints
app.post('/login', function(req, res, next) {
	routes.login(req,res,connection,r,0);
});

app.post('/setupUser', function(req, res, next) {
	routes.setupUser(req,res,connection,r);
});

app.post('/updateScore', function(req, res, next) {
	routes.updateScore(req,res,connection,r);
});

app.post('/getRating', function(req, res, next) {
	routes.getRating(req,res,connection,r,0);
});

app.post('/forfeitt', function(req, res, next) {
    routes.forfiet(req,res,connection,r, 0 );
});

app.post('/addFriend', function(req, res, next) {
    routes.addFriend(req,res,connection,r, 0 );
});

app.post('/deleteFriend', function(req, res, next) {
    routes.deleteFriend(req,res,connection,r, 0 );
});

app.post('/getFriends', function(req, res, next) {
    routes.getFriends(req,res,connection,r, 0 );
});

app.post('/getChatId', function(req, res, next) {
    routes.getChatId(req,res,connection,r, 0 );
});

app.post('/setChatId', function(req, res, next) {
    routes.setChatId(req,res,connection,r, 0 );
});

server.on('connection', function(id) {
});

server.on('disconnect', function(id) {
	console.log(id);
});

server.on('close', function(id) {
});

