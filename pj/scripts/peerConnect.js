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
	PeerJS required connection code
*/

var peer = new Peer({
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
  }
});

var connectedPeers = {};
var connected = false;
peer.on('open', function(id){
  $('#pid').val(id);
  $('#pid').text(id);
});

// Await connections from others
peer.on('connection', connect);
peer.on('error', function(err) {
  console.log(err);
})

function connect(c) {
    $('#rid').val(c.peer);
    connected = true;
    c.on('data', function(data) {
       	$(".active").prepend(data + c.label + "<br>");
	handleData(data);
   });
   connectedPeers[c.peer] = 1;
   //peer.disconnect(); // Still connected to its peer just cant accpet any other requets
   // Can use reconnect to connect it back to the server allowing new connections.
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

function createConnection(labelVal) {
	var requestedPeer = $("#rid").val();
	if (!connectedPeers[requestedPeer]) {
		var conn = peer.connect(requestedPeer, {label: labelVal});
		conn.on('open', function() {
			connected = true;
			connect(conn);
			peer.disconnect(); // Still connected to its peer just cant accept any other requests
		});
		conn.on('error', function(err) { alert(err); });
	}
	connectedPeers[requestedPeer] = 1;
}

function autoConnection(res) {	
	for (var i = 0, ii = res.length; i < ii; i += 1) {
		console.log(res[i]);
		if (res[i] != $("#pid").val()) {
			$("#rid").val(res[i]);
			createConnection("autoConnection");
			return true;
		}
	}
	return false;
}

function attemptConnection() {
        // Async Call
        // possible solution http://stackoverflow.com/questions/20775958/broadcast-or-peer-discovery-with-peerjs
        peer.listAllPeers( function(res) {
                autoConnection(res);
        });
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
            w = new Worker("/scripts/counter.js");
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
