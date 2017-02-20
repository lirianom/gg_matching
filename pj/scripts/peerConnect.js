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

// Maybe setting functions can be done with the abstract game
var handleData = function () { throw new Error("handleData(data) is not defined use defineHandleData(func)"); } 
function defineHandleData(func) {
	if (func !== 'undefined' && typeof func === 'function') {
		handleData = func;
	}
	else {
		throw new Error("defineHandleData(func) takes a function as a parameter not " + typeof func);
	}
}

var countdownComplete = function () { throw new Error("countdownComplete() is not defined use defineCountdownComplete(func)"); }
function defineCountdownComplete(func) {
	if (func !== 'undefined' && typeof func === 'function') {
        countdownComplete = func;
    }
	else {
		throw new Error("defineCountdownComplete(func) takes a function as a parameter not " + typeof func);
	}
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

function startGame(readyList) {
    if (readyList.length == 2) {
        globalGame = new Game(readyList);
        game();
    }
}

function getGame() {
	if (globalGame == undefined) { throw new Error("Game has not been defined yet. Game gets created when both players readyUp.");  }
	return globalGame;
}

function setupConnection(c) {
	$('#rid').val(c.peer);
	connectedPeers[c.peer] = 1;
    setTimeout(function() { peer.disconnect(); }, 100);
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

function getAllConnections(res) {
	var listOfUsers = [];
	for (var i = 0, ii = res.length; i < ii; i += 1) {
        if (res[i] != peer.id && getPeerIdSubset(peer.id) == getPeerIdSubset(res[i])) {
			listOfUsers.push(res[i]); 
        }
    } 
	return listOfUsers;
}

function attemptConnection() {
        // Async Call
        peer.listAllPeers( function(res) {
				var listOfUsers = getAllConnections(res);
				tryConnection(listOfUsers);
        });
}

function tryConnection(listOfUsers) {
	var maximum = listOfUsers.length;
	var minimum = 0;
	var randomPeer = Math.floor(Math.random() * (maximum - minimum)) + minimum;
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
