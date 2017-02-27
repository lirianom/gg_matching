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
var handleData = function () { throw new Error("handleData(data) is not defined use defineHandleData(func)"); }
Framework.defineHandleData = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        handleData = func;
    }
    else {
        throw new Error("defineHandleData(func) takes a function as a parameter not " + typeof func);
    }
}

var countdownComplete = function () { throw new Error("countdownComplete() is not defined use defineCountdownComplete(func)"); }
Framework.defineCountdownComplete = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        countdownComplete = func;
    }
    else {
        throw new Error("defineCountdownComplete(func) takes a function as a parameter not " + typeof func);
    }
}

var game = function() { throw new Error("game() is not defined use defineGame(func)"); }
Framework.defineGame = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        game = func;
    }
    else {
        throw new Error("defineGame(func) takes a function as a parameter not " + typeof func);
    }

}

var endGameCleanUp = function() { throw new Error("endGameCleanUp() is not defined use defineEndGameCleanUp(func)"); }
Framework.defineEndGameCleanUp = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        endGameCleanUp = func;
    }
    else {
        throw new Error("defineEndGameCleanUp(func) takes a function as a parameter not " + typeof func);
    }

}

var initialState = function() { throw new Error("initialState() is not defined use defineInitialState(func)"); }
Framework.defineInitialState = function(func) {
    if (func !== 'undefined' && typeof func === 'function') {
        initialState = func;
    }
    else {
        throw new Error("defineInitialState(func) takes a function as a parameter not " + typeof func);
    }

}


Framework.endGameCleanUp = function() {
	endGameCleanUp();
}

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

Framework.getGame = function() {
    if (globalGame == undefined) { throw new Error("Game has not been defined yet. Game gets created when both players readyUp."); }
    return globalGame;
}

Framework.initializeFrameworkUI = function() {
	initializeButtons();
	initializeLogging();
		
}

Framework.rematch = function() {
	_rematch();
	Framework.sendData({"type":"FrameworkInfo","callFunction":"rematch"});
}

function _rematch() {
	console.log("rematch");
	$("#ui").append("<button id='rematch'>Rematch</button>");
	$("#rematch").on("click", function() {
		Framework.readyUp();
		readyList = [];
		initialState();	
		Framework.getGame().rematch();
		$("#rematch").off();
		$("#rematch").remove();
	});
}



function initializeLogging() {
	$("body").append('<div class="active connection"></div>');
	$("body").append('<div class="log" style="color:#FF7500;text-shadow:none;padding:15px;background:#eee"><strong>Connection status</strong>:<br></div>');
}


function initializeButtons() {
//	<p>Your ID is <span id="pid"></span> <button id="copyId">Copy</button> <button id="autoConnect">Auto Connect</button></p>
//    <p>Connect to a peer:<input type="text" id="rid" placeholder="Someone else's id"><input class="button" type="button" value="Connect" id="connect"></p>
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

Framework.getPeerId = function() {
	if (peer.open) 
		return peer.id;
	else
		return peer._lastServerId;
}

Framework.sendData = function(data) {
    eachActiveConnection(function(c,$c) {
		data.time = (new Date()).getTime();
        c.send(data);
    });
}

Framework.sleep = function(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

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

Framework.forceEndCountdown = function() {
	_forceEndCountdown();
	Framework.sendData({"type":"FrameworkInfo","callFunction":"forceEndCountdown"});
}

function _forceEndCountdown() {
	$("#countdown").html("0");
	stopWorker(countdownWorker);
}


/*
	Private functions only can be called internally
*/

function setCountdownWorker(w) {
	
}

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

function getPeerIdSubset(peerId) {
	return peerId.split("-")[1];
}


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
	    console.log( (new Date()).getTime() - data.time );
		onData(c,data);
   	});
}

function onData(c,data) {
        $("#active").append(data + c.label + "<br>");
        // Potentially combine with waitForTurn
		if (data.type == "FrameworkInfo") {
			if (data.callFunction == "forceEndCountdown") {
				_forceEndCountdown();
			}
			if (data.callFunction == "rematch") {
				_rematch();
			}
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

function handleTurnData(data) {
	//if (!myTurn) {
		console.log("MyTurn");
		handleData(data);	
	//}
}

function startGame(readyList) {
    if (readyList.length == 2) {
		// GameInstance is singleton pattern now so it can only be used once but if something
		// makes a GameInstance before this method it will use that one.	
        globalGame = new GameInstance(readyList);
		console.log(JSON.stringify(globalGame));
        game();
    }
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

/*
	Helper function for creating connection
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

function isConnected() {
	// Might fail on disconnecting and reconnecting peers
	return !($.isEmptyObject(connectedPeers));
}

// Temp function to test connection
$(document).keypress(function ( e) {
    /*eachActiveConnection(function(c,$c) {
        c.send(e.keyCode);
    });*/
	Framework.sendData({});
});

window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

function stopWorker(w) {
    w.terminate();
    w = undefined;
}

	return Framework;
}

if (typeof(Framework) === 'undefined') {
	window.Framework = defineFramework();
}
else {
	console.log("Framework already defined");
}

})(window);



