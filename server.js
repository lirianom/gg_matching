var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) {
    console.log("")
    res.sendFile('/home/guigouma/capstone/myapp/pj/index.html');
});

var server = app.listen(9000);
var options = { debug : true, allow_discovery : true , proxied:true};

app.use('/', ExpressPeerServer(server,options));
app.use("/scripts", express.static(__dirname + '/pj/scripts'));


server.on('connection', function(id) {
    console.log(id)
    console.log(server._clients)
});

server.on('disconnect', function(id) {
    console.log(id + "deconnected")
});
