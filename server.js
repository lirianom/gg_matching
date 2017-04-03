var routes = require("./routes/login.js");
var fs = require('fs');
var gameConfig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var creds = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


r = require("rethinkdb");
var connection = null;
r.connect(creds, function(err, conn) {
	if (err) throw err
  	connection = conn;
});

// Requires slashes be at end of path and no slash on name
gameConfig.games.forEach(function (val) {
	console.log("Loaded: /" + val.name);
	app.get('/' + val.name, function(req, res, next) {
		console.log("/" + val.name );
		res.sendFile(val.path + "/" + val.file, { root: __dirname } );
	});

});

app.get("/", function(req, res, next) {
    console.log("/");
    res.sendFile("project/index.html", {root : __dirname } );
});

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/" + gameConfig.main_directory, express.static(__dirname + '/' + gameConfig.main_directory));

app.post('/login', function(req, res, next) {
	routes.login(req,res,connection,r,0);
});

app.post('/setupUser', function(req, res, next) {
	routes.setupUser(req,res,connection,r);
});

app.post('/updatescore', function(req, res, next) {
	routes.updateScore(req,res,connection,r);
});

app.post('/getRating', function(req, res, next) {
	routes.getRating(req,res,connection,r);
});

server.on('connection', function(id) {
});

server.on('disconnect', function(id) {
	console.log(id);
});

server.on('close', function(id) {
});

