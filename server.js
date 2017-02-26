var fs = require('fs');
var gameConfig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

// Requires slashes be at end of path and no slash on name
gameConfig.games.forEach(function (val) {
	console.log("Loaded: /" + val.name);
	app.get('/' + val.name, function(req, res, next) {
		console.log("/" + val.name );
		res.sendFile(val.path + "/" + val.file, { root: __dirname } );
	});

});

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/" + gameConfig.main_directory, express.static(__dirname + '/' + gameConfig.main_directory));


server.on('connection', function(id) {
});

server.on('disconnect', function(id) {
	console.log(id);
});

server.on('close', function(id) {
});

