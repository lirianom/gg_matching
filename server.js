var fs = require('fs');
var gameConfig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

r = require("rethinkdb");

/*var conn = r.connect({
    host: 'localhost',
    port: 28015,
    db: 'marvel'
}, function(err, conn) {
    // ...
});
*/

var connection = null;
r.connect({ host: 'localhost', port: 28015, db: 'marvel' }, function(err, conn) {
	if (err) throw err
    	connection = conn;
      	r.dbList()
        	.contains('semestres')
        	.do(function(dbExists) {
          		return r.branch(
            		dbExists,
            		{ created: 0 },
            		r.dbCreate('semestres')
          		);
        	})
        	.run(connection, function(err) {
          		if (err) throw err;
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

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/" + gameConfig.main_directory, express.static(__dirname + '/' + gameConfig.main_directory));

var datatest = "test";
app.post('/login', function(req, res, next) {
	r.db('GG').tableCreate(datatest).run(connection, function(err, result) {
    if (err) throw err;
    console.log(JSON.stringify(result, null, 2));
	})
	datatest="test2";
	res.send({response:'testingresponse'});
});

server.on('connection', function(id) {
});

server.on('disconnect', function(id) {
	console.log(id);
});

server.on('close', function(id) {
});

