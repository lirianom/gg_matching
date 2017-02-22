var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) {
    console.log("");
    res.sendFile('/home/guigouma/capstone/split_match/project/index.html');
});

app.get('/rps', function(req, res, next) {
    console.log("rps");
    res.sendFile('/home/guigouma/capstone/split_match/project/games/rps/rps.html');
});

app.get('/oldttt', function(req, res, next) {
    console.log("oldttt");
    res.sendFile('/home/guigouma/capstone/split_match/project/games/oldttt/oldttt.html');
});

app.get('/ttt', function(req, res, next) {
    console.log("ttt");
    res.sendFile('/home/guigouma/capstone/split_match/project/games/ttt/ttt.html');
});

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/project", express.static(__dirname + '/project'));

server.on('connection', function(id) {
    //console.log(id)
    //console.log(server._clients)
});

server.on('disconnect', function(id) {
    console.log(id + "deconnected")
});
