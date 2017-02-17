/*
	Ready

	Required to define own handleData(data) function to interact with data
	If using countdown you need to define countdownComplete();
*/

var readyList = []; // Might want to remove
var globalGame; 

$(document).ready(function() {
    $('#connect').click(function() {
    	createConnection("manualConnection");
    });
    $('#autoConnect').click(function() {
    	attemptConnection();
    });
});

/*
	Generate PeerId Helper Methods
*/

gameList = {
			"http://adb07.cs.appstate.edu:9000/oldttt":"ot",
			"http://adb07.cs.appstate.edu:9000/rps":"r",
			"http://adb07.cs.appstate.edu:9000/":"x",
			"http://adb07.cs.appstate.edu:9000/ttt":"t"
			};

// When a peer disconnects their peer.id goes to the _lastServerId
function getPeerId() {
	if (peer.open) 
		return peer.id;
	else
		return peer._lastServerId;
}

function createPeerId() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 14; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
	s[15] = "-" + gameList[window.location.href];
    var peerId = s.join("");
	console.log(peerId);
    return peerId;
}

function getPeerIdSubset(peerId) {
	return peerId.split("-")[1];
}

/*
    PeerJS required connection code
*/

var peer = new Peer(createPeerId() ,{	
	host : 'adb07.cs.appstate.edu',
  	port : 9000,
	path : '/',
  	debug: 3,
 	allow_discovery : true, //https://github.com/sheab/senet/issues/1
  	config: {'iceServers': [
  		{ urls: 'stun:stun1.l.google.com:19302' },
  		{ urls: 'turn:numb.viagenie.ca',
    		credential: 'muazkh', username: 'webrtc@live.com' }
  	]}, 
  	logFunction: function() {
  		var copy = Array.prototype.slice.call(arguments).join(' ');
    		$('.log').append(copy + '<br>');
  	},
});

var connectedPeers = {};

peer.on('open', function(id){
  	$('#pid').val(id);
  	$('#pid').text(id);
});

// Await connections from others
peer.on('connection', function(c) { 
	connect(c);
});

peer.on('error', function(err) {
  	console.log(err);
});

function connect(c) {
	setupConnection(c);
    c.on('data', function(data) {
		console.log(data);
   	   	$(".active").prepend(data + c.label + "<br>");
		// Potentially combine with waitForTurn
		if (data.hasOwnProperty('type') && data.type === "readyUp") {
			var rid = $("#rid").val(); // Might want to change to get value not from page
			readyList.push(rid);
			readyList = $.unique(readyList);		
			startGame(readyList);
		}
		if (data.hasOwnProperty('waitForTurn') && data.waitForTurn) {
			handleTurnData(data);
		}
		else {
			handleData(data);
		}
   	});
}


function handleTurnData(data) {
	//if (!myTurn) {
		console.log("MyTurn");
		handleData(data);	
	//}
}

function readyUp() {
	$("#readyUp").on("click", function() {
        pid = getPeerId();
        readyList.push(pid);
        readyList = $.unique(readyList);
        sendData({"type":"readyUp"});//,"waitForTurn":true});
		startGame(readyList);
	});

}

function Game(readyList) { // Constructor
    var player1;
	var player2;
	// for turn based 
	var currentTurn;

	var turnBased = false;
	var allowMoves = false;
	this.setPlayer1(readyList[0]);
	this.setPlayer2(readyList[1]);

	this.initializeTurnGame(null); //eventually random pick first player
}

Game.prototype.test = function() {
	console.log("test");
}

Game.prototype.initializeTurnGame = function(readyList) {
	this.currentTurn = this.player1;
	this.turnBased = true;
}

Game.prototype.setPlayer1 = function(id) {
	this.player1 = id;
	console.log("Player 1 = " + this.player1);
}

Game.prototype.setPlayer2 = function(id) {
	this.player2 = id;
	console.log("Player 2 = " + id);
}

Game.prototype.getPlayer1 = function() {
	return this.player1;
}

Game.prototype.getPlayer2 = function() {
	return this.player2;
}

Game.prototype.currentTurn = function() {
	return currentTurn; 
}

Game.prototype.endTurn = function() {
	if (this.currentTurn == this.player1) this.currentTurn = this.player2;
	else this.currentTurn = this.player1;
}

Game.prototpe.movesAllowed = function() {
	// If turn based game allow moves?
	if (this.turnBased) {
		return this.currentTurn() == getPeerId();  
	}
	else {
		return this.allowMoves;
	}
}

Game.prototype.setAllowMoves = function(val) {
	this.allowMoves = val;
}

function startGame(readyList) {
    if (readyList.length == 2) {
        globalGame = new Game(readyList);
		game();
    }
}

function getGame() {
	if (globalGame == undefined) alert("Game Undefined");
	return globalGame;
}

function setupConnection(c) {
	$('#rid').val(c.peer);
	connectedPeers[c.peer] = 1;
    //setTimeout(function() { peer.disconnect(); }, 100);
}

function eachActiveConnection(fn) {
	var checkedIds = {};
    for (var peerId in connectedPeers) {
    	if (!checkedIds[peerId]) {
        	var conns = peer.connections[peerId];
            for (var i = 0, ii = conns.length; i < ii; i += 1) {
                var conn = conns[i];
                fn(conn, $(this));
            }
        }
        checkedIds[peerId] = 1;
    }
}


window.onunload = window.onbeforeunload = function(e) {
	if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

/*
	My helper functions for creating the connection.
*/

function createConnection(labelVal, requestedPeer) {
	if (!connectedPeers[requestedPeer]) {
		var conn = peer.connect(requestedPeer, {label: labelVal});
		conn.on('open', function() {
			connect(conn);
			peer.disconnect(); // Still connected to its peer just cant accept any other requests
		});
		conn.on('error', function(err) { alert(err); });
	}
	
	connectedPeers[requestedPeer] = 1;
}

// Not being used right now - replaced by getAllConnections
function autoConnection(res) {	
	for (var i = 0, ii = res.length; i < ii; i += 1) {
		console.log(res[i]);
		if (res[i] != peer.id) {
			$("#rid").val(res[i]);
			createConnection("autoConnection");
			return true;
		}
	}
	return false;
}

function getAllConnections(res, listOfUsers) {
	for (var i = 0, ii = res.length; i < ii; i += 1) {
        if (res[i] != peer.id && getPeerIdSubset(peer.id) == getPeerIdSubset(res[i])) {
            //$("#rid").val(res[i]);
            //createConnection("autoConnection");
			listOfUsers.push(res[i]); 
        }
    }  
}

function attemptConnection() {
        // Async Call
        // possible solution http://stackoverflow.com/questions/20775958/broadcast-or-peer-discovery-with-peerjs
	// redo List all the peers everytime?
		listOfUsers = [];
        peer.listAllPeers( function(res) {
                //autoConnection(res);
				getAllConnections(res, listOfUsers);
				tryConnection(listOfUsers);
        });
		//wont work cause list all peers is async tryConnection(listOfUsers); 
}

function tryConnection(listOfUsers) {
	var maximum = listOfUsers.length;
	var minimum = 0;
	var randomPeer = Math.floor(Math.random() * (maximum - minimum)) + minimum;
	// need to pass as param
	//console.log(listOfUsers);
	$("#rid").val(listOfUsers[randomPeer]);
	// Handle this better in the future
	if (listOfUsers.length == 0 ) console.log("Nothing to connect to.");
	else createConnection("randomAutoConnection", listOfUsers[randomPeer]);
}

function isConnectionValid(connectionSource) {
	console.log(connectionSource);
	console.log(window.location.href);
	
	return connectionSource == window.location.href;
}

function isConnected() {
	// Might fail on disconnecting and reconnecting peers
	return !($.isEmptyObject(connectedPeers));
}

/*
	Miscellaneous helper functions.
*/

$(document).keypress(function ( e) {
    eachActiveConnection(function(c,$c) {
        c.send(e.keyCode);
    });
});

function sendData(data) {
    eachActiveConnection(function(c,$c) {
        c.send(data);
    });
}

function sleep(delay) {
	var start = new Date().getTime();
	while (new Date().getTime() < start + delay);
}

function countdown() {
    var w;
    if (typeof(Worker) !== "undefined") {
        if (typeof(w) == "undefined") {
            w = new Worker("pj/scripts/counter.js");
        }
        w.onmessage = function(event) {
            $("#countdown").html(event.data);
            if (event.data == 0) {
                stopWorker(w);
                countdownComplete();
            }
        };

    }
    else {
        $("#countdown").html("WW Error");
    }

}

function stopWorker(w) {
    w.terminate();
    w = undefined;
}
