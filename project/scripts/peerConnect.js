/*
	Ready

	Required to define own handleData(data) function to interact with data
	If using countdown you need to define countdownComplete();
*/
$(document).ready(function() {
	Framework.initializeFrameworkUI();	
});

(function(window) {

'use strict';

function defineFramework() {

var Framework = {};

// Temp function to test open connection
$(document).keypress(function ( e) {
	Framework.sendData({});
});

/*
	Fields
*/
var readyList = [];
var globalGame; 
var gameList = {};
var connectedPeers = {};

/*
	Public functions can call by using Framework.XXXX
*/

// Maybe setting functions can be done with the abstract game
// When data is sent this is the function that recieves the data
var handleData = function () { throw new Error("handleData(data) is not defined use defineHandleData(func)"); }
Framework.defineHandleData = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        handleData = func;
    }
    else {
        throw new Error("defineHandleData(func) takes a function as a parameter not " + typeof func);
    }
}

// Function that runs when the Framework.countdown completes
var countdownComplete = function () { throw new Error("countdownComplete() is not defined use defineCountdownComplete(func)"); }
Framework.defineCountdownComplete = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        countdownComplete = func;
    }
    else {
        throw new Error("defineCountdownComplete(func) takes a function as a parameter not " + typeof func);
    }
}

// Function to start the game - maybe should rename to startGame?
var game = function() { throw new Error("game() is not defined use defineGame(func)"); }
Framework.defineGame = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        game = func;
    }
    else {
        throw new Error("defineGame(func) takes a function as a parameter not " + typeof func);
    }

}

// Delete created objects and remove listeners
var endGameCleanUp = function() { throw new Error("endGameCleanUp() is not defined use defineEndGameCleanUp(func)"); }
Framework.defineEndGameCleanUp = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        endGameCleanUp = func;
    }
    else {
        throw new Error("defineEndGameCleanUp(func) takes a function as a parameter not " + typeof func);
    }

}

// Initial State of Game
var initialState = function() { throw new Error("initialState() is not defined use defineInitialState(func)"); }
Framework.defineInitialState = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        initialState = func;
    }
    else {
        throw new Error("defineInitialState(func) takes a function as a parameter not " + typeof func);
    }

}

// Calls the user defined endGameCleanUp
Framework.endGameCleanUp = function() {
	endGameCleanUp();
}

// Creates a Ready Up button and sets up its on click event to start the game when both players are ready.
Framework.readyUp = function() {
	var r = $('<button>');
	r.attr("id", "readyUp");
	r.html("Ready Up");
	$("#ui").append(r);
	$("#ui").append("<hr>");

    $("#readyUp").on("click", function() {
        var pid = Framework.getPeerId();
        readyList.push(pid);
        readyList = $.unique(readyList);
        Framework.sendData({"type":"readyUp"});//,"waitForTurn":true});
        startGame(readyList);	
		$("#readyUp").off();
		$("#readyUp").remove();
    });
}

// Returns the globalGame instance 
Framework.getGame = function() {
    if (globalGame == undefined) { throw new Error("Game has not been defined yet. Game gets created when both players readyUp."); }
    return globalGame;
}

// Sets up connection buttons and text boxes aswell as logging 
Framework.initializeFrameworkUI = function() {
	initializeButtons();
	initializeLogging();
}

// Public rematch function calls the private rematch function and alerts the clients peer to call it aswell
Framework.rematch = function() {
	_rematch();
	Framework.sendData({"type":"FrameworkInfo","callFunction":"rematch"});
}

// Return the PeerId even if they are disconnected
Framework.getPeerId = function() {
	if (peer.open) 
		return peer.id;
	else
		return peer._lastServerId;
}

// Sends passed data to every connected peer
Framework.sendData = function(data) {
    eachActiveConnection(function(c,$c) {
		data.time = (new Date()).getTime();
        c.send(data);
    });
}

// Public function that sleeps for delay ms
Framework.sleep = function(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

// Public countdown function that counts down using counter.js
var countdownWorker;
Framework.countdown = function() {
    
    if (typeof(Worker) !== "undefined") {
        if (typeof(countdownWorker) == "undefined") {
            countdownWorker = new Worker("project/scripts/counter.js");
        }
        countdownWorker.onmessage = function(event) {
            $("#countdown").html(event.data);
            if (event.data == 0) {
                stopWorker(countdownWorker);
                countdownComplete();
            }
        };
    }
    else {
        $("#countdown").html("WW Error");
    }
}

// Calls the private _forceEndCountdown() function and tells the other peer to do the same
Framework.forceEndCountdown = function() {
	_forceEndCountdown();
	Framework.sendData({"type":"FrameworkInfo","callFunction":"forceEndCountdown"});
}


/*
	Private functions only can be called internally
*/

// Creates the rematch button and redoes the ReadyUp for the game
// Then calls the globalGames rematch function to restart the game
function _rematch() {
	console.log("rematch");
	$("#ui").append("<button id='rematch'>Rematch</button>");
	$("#rematch").on("click", function() {
		Framework.readyUp();
		readyList = [];
		initialState();	
		// Maybe can ditch the rematch function in abstractGame
		// Can just use startGame again and call initialState at the beginging 
		// of the startGame.
		Framework.getGame().rematch();
		$("#rematch").off();
		$("#rematch").remove();
	});
}

// Adds the html for logging at the bottom of the webpage
function initializeLogging() {
	$("body").append('<div class="active connection"></div>');
	$("body").append('<div class="log" style="color:#FF7500;text-shadow:none;padding:15px;background:#eee"><strong>Connection status</strong>:<br></div>');
}

// Adds the connection buttons and text boxes at the top of the webpage
function initializeButtons() {
	$("body").prepend("<div id='ui'></div>");
	$("#ui").append('<p>Your ID is <span id="pid"></span> <button id="copyId">Copy</button> <button id="autoConnect">Auto Connect</button></p>');
	$("#ui").append('<p>Connect to a peer:<input type="text" id="rid" placeholder="Someone else\'s id"><input class="button" type="button" value="Connect" id="connect"></p>');
	$("#ui").append("<hr>");
		
	$('#connect').click(function() {
    	createConnection("manualConnection",$("#rid").val());
    });
    $('#autoConnect').click(function() {
    	attemptConnection();
    });

}


/**
 *  Functions to generate Unique PeerId 
 */

// Generates a 14 hex digits followed by a -# of the unique game id
function createPeerId() {
	loadGameList();
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

// Reads from the game-config.json file and creates a unique number for each game
// This unique number is so that peer's cant connect across different games
function loadGameList() {
	var gameCount = 0;
	// Had to foce getJSON to not be async so that the gameList is fetched without race condition
	$.ajaxSetup({ async: false });
	// Might want to use readFileSync
    $.getJSON("/project/game-config.json", function(json) {        
        json.games.forEach(function(val) {
            var path = json.host + "/" +  val.name;
			console.log(path);
			gameList[path] = gameCount++;
        });
    });
	// Highly reccomended to not do this
	$.ajax({ async: true });
}

// Returns the game's unique id
function getPeerIdSubset(peerId) {
	return peerId.split("-")[1];
}

/**
 *  PeerJS specific setup code
 */

// New Peer Object
var peer = new Peer(createPeerId() ,{	
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
	connect(c);
});

// Log Errors
peer.on('error', function(err) {
  	console.log(err);
});

// When page is closed remove clear up peer objects
window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

// When connecting setupConnection and set the on data function
function connect(c) {
	setupConnection(c);
    c.on('data', function(data) {
	    console.log( (new Date()).getTime() - data.time );
		onData(c,data);
   	});
}


/**
 *  Functions to assist PeerJS connection
 */

// onData reads the data object and handles it appropriatly
// if it is a FrameworkInfo, gameInfo, or specific to the implemented game call
// the appropriate functions
function onData(c,data) {
        $("#active").append(data + c.label + "<br>");
        // Potentially combine with waitForTurn
		if (data.type == "FrameworkInfo") {
			handleFrameworkInfo(data);
		}
		else if (data.type == "gameInfo") {
			handleGameInfoData(data);
		}
        else if (data.hasOwnProperty('type') && data.type === "readyUp") {
            var rid = $("#rid").val(); // Might want to change to get value not from page
            readyList.push(rid);
            readyList = $.unique(readyList);
            startGame(readyList);
        }
        else {
			handleData(data);
		}
}

// Handles Framework specific data sent
function handleFrameworkInfo(data) {
	if (data.callFunction == "forceEndCountdown") {
        _forceEndCountdown();
    }
    if (data.callFunction == "rematch") {
    	_rematch();
	}
}

// Handles Game Object Info specifi data sent
// Might want to rename to something more abstract
function handleGameInfoData(data) {
	if (data.endTurn) {
		Framework.getGame()._endClientTurn();
	}
	if (data.gameOver) {
		Framework.getGame()._setClientGameOver();
	}
	if (data.rematch) {
		Framework.getGame()._rematch();
	}
}

// Handle turn based data - deprecated 
function handleTurnData(data) {
	//if (!myTurn) {
		console.log("MyTurn");
		handleData(data);	
	//}
}

// Creates a GameInstance and calls the defined game method
function startGame(readyList) {
    if (readyList.length == 2) {
		// GameInstance is singleton pattern now so it can only be used once but if something
		// makes a GameInstance before this method it will use that one.	
        globalGame = new GameInstance(readyList);
		console.log(JSON.stringify(globalGame));
        game();
    }
}

// Loops through each active connection - currently limited to 1
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

// Displays the peer that you connect to, add them to the connectedPeers list and disconnect from the PeerJS server
function setupConnection(c) {
	$('#rid').val(c.peer);
	connectedPeers[c.peer] = 1;
    setTimeout(function() { peer.disconnect(); }, 100);
}

// Connects to the specified peer and then disconnects from PeerJS server
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

// Returns a list of all the peers connected to the PeerJS server
function getAllConnections(res) {
	var listOfUsers = [];
	for (var i = 0, ii = res.length; i < ii; i += 1) {
        if (res[i] != peer.id && getPeerIdSubset(peer.id) == getPeerIdSubset(res[i])) {
			listOfUsers.push(res[i]); 
        }
    } 
	return listOfUsers;
}

// Try to find a valid peer to connect to and connect
function attemptConnection() {
    // Async Call
    peer.listAllPeers( function(res) {
		var listOfUsers = getAllConnections(res);
		tryConnection(listOfUsers);
	});
}

// Randomly connect to a valid peer
// Might want to change this to tryRandomConnection
function tryConnection(listOfUsers) {
	var maximum = listOfUsers.length;
	var minimum = 0;
	var randomPeer = Math.floor(Math.random() * (maximum - minimum)) + minimum;
	// Handle this better in the future
	if (listOfUsers.length == 0 ) console.log("Nothing to connect to.");
	else createConnection("randomAutoConnection", listOfUsers[randomPeer]);
}

// Returns true if the peer is connected to another peer
function isConnected() {
	// Might fail on disconnecting and reconnecting peers
	return !($.isEmptyObject(connectedPeers));
}

/**
 *  Private WebWorker Functions
 */

// End the specified web worker
function stopWorker(w) {
    w.terminate();
    w = undefined;
}

// Private function to force end a countdown
function _forceEndCountdown() {
    $("#countdown").html("0");
    stopWorker(countdownWorker);
}

// Not sure what this is for
function setCountdownWorker(w) {
	
}

// Framework object that can access all the public methods
return Framework;
}

// Ensure that only one Framework gets defined
if (typeof(Framework) === 'undefined') {
	window.Framework = defineFramework();
}
else {
	console.log("Framework already defined");
}

})(window);
