/**
 *  PeerJS specific setup code
 */

// New Peer Object
function PeerInstance(configs, rating) {
"use strict";
var instance = {};
var connectedPeers = {};

// Generates a 14 hex digits followed by a -# of the unique game id
instance.createPeerId = function(gameList,rating) {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 14; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
	
    s[15] = "-" + gameList[window.location.href];
	s[16] = "-" + rating; // getRating might need to be like singleton pattern
    var peerId = s.join("");
	console.log(rating);
    console.log(peerId);
    return peerId;
}

instance.createPeer = function(configs, rating) {
    var peer = new Peer(
        this.createPeerId(configs, rating),
        {
            host : '/',
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

    // Show peer id on webpage
    peer.on('open', function(id){
        $('#pid').val(id);
        $('#pid').text(id);
    });

    // Await connections from others
    peer.on('connection', function(c) {
        instance.connect(c);
    });

    // Log Errors
    peer.on('error', function(err) {
        console.log(err);
    });

    return peer;
}

instance.peer = instance.createPeer(configs, rating);

// Returns a list of all the peers connected to the PeerJS server
instance.getAllConnections = function(res) {
	var listOfUsers = [];
	for (var i = 0, ii = res.length; i < ii; i += 1) {
        if (res[i] != instance.peer.id && instance.getPeerIdSubset(instance.peer.id) == instance.getPeerIdSubset(res[i])) {
			listOfUsers.push(res[i]); 
        }
    } 
	//console.log(listOfUsers);
	return listOfUsers;
}

// Returns the game's unique id
instance.getPeerIdSubset = function(peerId) {
    return peerId.split("-")[1];
}

// Might be more efficient to add rating on to unique id
// expensive to check all users
// trying to add to peerid so that dont hve to query every1 in queue
instance.tryRankedConnection = function(listOfUsers) {
    console.log(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token);	
}


// Randomly connect to a valid peer
// Might want to change this to tryRandomConnection
instance.tryRandomConnection = function(listOfUsers) {
	var maximum = listOfUsers.length;
	var minimum = 0;
	var randomPeer = Math.floor(Math.random() * (maximum - minimum)) + minimum;
	// Handle this better in the future
	if (listOfUsers.length == 0 ) console.log("Nothing to connect to.");
	else instance.createConnection("randomAutoConnection", listOfUsers[randomPeer]);
}


// Displays the peer that you connect to, add them to the connectedPeers list and disconnect from the PeerJS server
instance.setupConnection = function(c) {
	$('#rid').val(c.peer);
	connectedPeers[c.peer] = 1;
    setTimeout(function() { instance.peer.disconnect(); }, 100);
}

// Connects to the specified peer and then disconnects from PeerJS server
instance.createConnection = function(labelVal, requestedPeer) {
	if (!connectedPeers[requestedPeer]) {
		var conn = instance.peer.connect(requestedPeer, {label: labelVal});
		conn.on('open', function() {
			instance.connect(conn);
			instance.peer.disconnect(); // Still connected to its peer just cant accept any other requests
		});
		conn.on('error', function(err) { alert(err); });
	}
	connectedPeers[requestedPeer] = 1;
}

// Not being used right now - replaced by getAllConnections
instance.autoConnection = function(res) {	
	for (var i = 0, ii = res.length; i < ii; i += 1) {
		console.log(res[i]);
		if (res[i] != this.peer.id) {
			$("#rid").val(res[i]);
			this.createConnection("autoConnection");
			return true;
		}
	}
	return false;
}

// Try to find a valid peer to connect to and connect
instance.attemptConnection = function() {
    // Async Call
    this.peer.listAllPeers( function(res) {
        var listOfUsers = instance.getAllConnections(res);
        instance.tryRandomConnection(listOfUsers);
    });
}

// Return PeerId for a client that is connected or disconnected from the Express Server
instance.getPeerId = function() {
    if (this.peer.open)
        return this.peer.id;
    else
        return this.peer._lastServerId;
}

// When connecting setupConnection and set the on data function
instance.connect = function(c) {
	instance.setupConnection(c);
    c.on('data', function(data) {
		instance.onData(c,data);
   	});
}

// onData reads the data object and handles it appropriatly
// if it is a FrameworkInfo, gameInfo, or specific to the implemented game call
// the appropriate functions
instance.onData = function(c,data) {
        $("#active").append(data + c.label + "<br>");
        // Potentially combine with waitForTurn
		if (data.type == "FrameworkInfo") {
			this.handleFrameworkInfo(data);
		}
		else if (data.type == "gameInfo") {
			this.handleGameInfo(data);
		}
        else {
			this.handleData(data);
		}
}

// Define function to handle framework info that gets created in framework
instance.defineHandleFrameworkInfo = function(func) {
	instance.handleFrameworkInfo = func;
}

// Define function to handle game info that gets created in framework
instance.defineHandleGameInfo = function(func) {
	instance.handleGameInfo = func;
}

// Define handle data that gets created by the game
instance.handleData = function () { throw new Error("handleData(data) is not defined use defineHandleData(func)"); }
instance.defineHandleData = function(func) {
	//console.log(func);
    if (func !== 'undefined' && typeof func === 'function') {
        instance.handleData = func;
    }
    else {
        throw new Error("defineHandleData(func) takes a function as a parameter not " + typeof func);
    }
}

// Handle turn based data - deprecated 
instance.handleTurnData = function(data) {
	instance.handleData(data);	
}

// Loops through each active connection - currently limited to 1
instance.eachActiveConnection = function(fn) {
	var checkedIds = {};
    for (var peerId in connectedPeers) {
    	if (!checkedIds[peerId]) {
        	var conns = instance.peer.connections[peerId];
            for (var i = 0, ii = conns.length; i < ii; i += 1) {
                var conn = conns[i];
                fn(conn, $(this));
            }
        }
        checkedIds[peerId] = 1;
    }
}

// Ask wait for both players to agree to command
instance.askForPeersToAgree = function(command) {
	Framework.sendData({"type":"FrameworkInfo","agreeTo":command});
}

// Returns true if the peer is connected to another peer
instance.isConnected = function() {
	// Might fail on disconnecting and reconnecting peers
	return !($.isEmptyObject(connectedPeers));
}
// When page is closed remove clear up peer objects
window.onunload = window.onbeforeunload = function(e) {
    if (!!instance.peer && !instance.peer.destroyed) {
    	instance.peer.destroy();
	}
};

return instance;

}

