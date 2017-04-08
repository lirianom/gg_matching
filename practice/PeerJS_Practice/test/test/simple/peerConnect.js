var peer = new Peer({
  key: 'my94e849a01thuxr', // My Own API Key
  debug: 3,
  allow_discovery : true, //https://github.com/sheab/senet/issues/1
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
    
    //if (c.label === 'game') {
        c.on('data', function(data) {
            $(".active").prepend(data + "<br>");
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

