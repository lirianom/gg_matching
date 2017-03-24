var fs = require('fs');
var gameConfig = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

r = require("rethinkdb");
var connection = null;
r.connect({ host: 'localhost', port: 28015, db: 'GG' }, function(err, conn) {
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

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/" + gameConfig.main_directory, express.static(__dirname + '/' + gameConfig.main_directory));

app.post('/login', function(req, res, next) {
	var token = req.body.id;
	//	http://stackoverflow.com/questions/34833820/do-we-need-to-hide-the-google-oauth-client-id
	var CLIENT_ID = "585757099412-82kcg563ohunnb0t4kmq8el85ak8n3rp.apps.googleusercontent.com";
	var GoogleAuth = require('google-auth-library');
	var auth = new GoogleAuth;
	var client = new auth.OAuth2(CLIENT_ID, '', '');
	client.verifyIdToken(
    	token,
    	CLIENT_ID,
    	// Or, if multiple clients access the backend:
    	//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
    	function(e, login) {
		
      		var payload = login.getPayload();
      		var userid = payload['sub'];
			// check if valid 
			var confirmed_id = payload.sub;
			r.table('users').filter({"id":confirmed_id}).run(connection,
			function(err, cursor) {
				if (err) throw err;
				cursor.toArray(function(err, result) {
					if (err) throw err;
					console.log(JSON.stringify(result, null, 2));	
					if (result.length == 0) {
						r.table('users').insert([{"id":confirmed_id}]).run(connection, function(err, result) {
                			if (err) throw err;
            		    	console.log(JSON.stringify(result, null, 2));
			            })
	
					}
				});
			}
			);
			//https://developers.google.com/identity/sign-in/web/backend-auth
      		//If request specified a G Suite domain:
      		//var domain = payload['hd'];
    	});	
		
});

server.on('connection', function(id) {
});

server.on('disconnect', function(id) {
	console.log(id);
});

server.on('close', function(id) {
});

