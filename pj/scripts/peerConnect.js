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

peer.on('open', function(id){
  $('#pid').text(id);
});

// Await connections from others
peer.on('connection', connect);
peer.on('error', function(err) {
  console.log(err);
})

function connect(c) {
    $('#rid').val(c.peer);
    c.on('data', function(data) {
        $(".active").prepend(data + c.label + "<br>");
    });
    connectedPeers[c.peer] = 1;
}

function createConnection(labelVal) {
	var requestedPeer = $("#rid").val();
	if (!connectedPeers[requestedPeer]) {
		var conn = peer.connect(requestedPeer, {label: labelVal});
		conn.on('open', function() {
			connect(conn);
		});
		conn.on('error', function(err) { alert(err); });
	}
	connectedPeers[requestedPeer] = 1;
}

function autoConnection(res) {
	for (var i = 0, ii = res.length; i < ii; i += 1) {
		$("#rid").val(res[i]);
		if (res[i] != $("#pid")) {
			createConnection("autoConnection");
			break;
		}
	}
}

$(document).ready(function() {
    $('#connect').click(function() {
 		createConnection("manualConnection"); 
	});
    $('#autoConnect').click(function() {
		peer.listAllPeers( function(res) { autoConnection(res); })
	});
});

$(document).keypress(function ( e) {
    eachActiveConnection(function(c,$c) {
        c.send(e.keyCode);
    });
});

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

