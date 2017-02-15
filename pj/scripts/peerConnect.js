/*
	Ready

	Required to define own handleData(data) function to interact with data
	If using countdown you need to define countdownComplete();
*/

$(document).ready(function() {
    $('#connect').click(function() {
    	createConnection("manualConnection");
    });
    $('#autoConnect').click(function() {
    	attemptConnection();
    });
});

/*
	Generate PeerID Helper Methods
*/

gameList = {
			"http://adb07.cs.appstate.edu:9000/ttt":"t",
			"http://adb07.cs.appstate.edu:9000/rps":"r",
			"http://adb07.cs.appstate.edu:9000/":"x"
			};

function createPeerID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 14; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
	s[15] = "-" + gameList[window.location.href];
    var peerID = s.join("");
	console.log(peerID);
    return peerID;
}

function getPeerIDSubset(peerID) {
	return peerID.split("-")[1];
}

/*
    PeerJS required connection code
*/

var peer = new Peer(createPeerID() ,{	
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
		if (data.hasOwnProperty('waitForTurn') && data.waitForTurn) {
			handleTurnData(data);
		}
		else {
			handleData(data);
		}
   	});
}

function handleTurnData(data) {
	if (!myTurn) {
		myTurn = true;
		console.log("MyTurn");
		handleData(data);	
	}
}

function initializeTurnGame(readyList) {
	pidTurn = readyList[0];
    if (peer.id == pidTurn) myTurn = true;
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

function getAllConnections(res, listOfUsers) {
	for (var i = 0, ii = res.length; i < ii; i += 1) {
        if (res[i] != peer.id && getPeerIDSubset(peer.id) == getPeerIDSubset(res[i])) {
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
	console.log(listOfUsers);
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
