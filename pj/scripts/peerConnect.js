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

    //if (c.label === 'game') {
        c.on('data', function(data) {
            $(".active").prepend(data + c.label + "<br>");
        });
    //}
    connectedPeers[c.peer] = 1;
}

$(document).ready(function() {
    // this is where when page is ready it links to another
    $('#connect').click(function() {
        var requestedPeer = $('#rid').val();
        if (!connectedPeers[requestedPeer]) {
            var conn = peer.connect(requestedPeer, {label: 'game'});
            conn.on('open', function() {
                connect(conn);
            });
            conn.on('error', function(err) { alert(err); });
        }
        connectedPeers[requestedPeer] = 1;
    });
    $('#autoConnect').click(function() {
		peer.listAllPeers(function(res) {
        	var diff = [];

        	for (var i = 0, ii = res.length; i < ii; i += 1) {
          		
				var id = res[i];
				if (id != $("#pid"))
				{
					//what is the if !connected peers above?
					if (!connectedPeers[id]) {
						var conn = peer.connect(id, {label : 'autoconnected'});
						
						conn.on('open', function () {
							$('#rid').val(id);
							connect(conn);
						});
						conn.on('error',function(err) { alert(err); });
					}
					connectedPeers[id] = 1;
					break;
				}


          		console.log(id);
        	}
        	});

	});
});

$(document).keypress(function ( e) {
    eachActiveConnection(function(c,$c){
        c.send(e.keyCode);
    });
});

function eachActiveConnection(fn) {
    var actives = $('#rid'); //instead of grabbing actives
    // this could be cause of single way connection
    var checkedIds = {};
    actives.each(function() {
        var peerId = $(this).val(); //$(this).attr('id');
        //alert(peerId);

        if (!checkedIds[peerId]) {
	    console.log(peer.connections[peerId][0]);
            var conns = peer.connections[peerId];
            for (var i = 0, ii = conns.length; i < ii; i += 1) {
                var conn = conns[i];
                fn(conn, $(this));
            }
        }

        checkedIds[peerId] = 1;
    });
}

window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};

