allowMoves = false;
readyList = [];

/*
	READY
*/

$(document).ready(function() {
	$("#readyUp").on("click", function() {
		pid = $("#pid").val();
		readyList.push(pid);
		readyList = $.unique(readyList);
		sendData({"type":"readyUp"});//,"waitForTurn":true});
		game();
	});

});

/*
	Required functions for peerConnections.js
*/
count = 0;
function handleData(data) {	
    if (data.type == "ttt") {
		console.log("Turn: " + count);
		count += 1;
    }
    if (data.type == "readyUp") {
        rid = $("#rid").val();
        readyList.push(rid);
        readyList = $.unique(readyList);
        game();
    }
}

/*
	Game specific functions
*/

var pidTurn;
myTurn = false;
function game() {
	console.log(readyList);
	if (readyList.length == 2) {
		//pidTurn = readyList[0];
		//if ($("#pid").val() == pidTurn)	{
		//	allowMoves = true;
		//}
		//else allowMoves = false;
		pidTurn = readyList[0];
		if ($("#pid").val() == pidTurn) myTurn = true;
		console.log("ready");
		moves();
		//countdown();
	}
}

function determineVictory() {

}



function moves() {
	count = 0;
	$(document).on("click", function() {
		//if (allowMoves)  { 
			//console.log("My turn: " + count);
			//count += 1;
			//allowMoves = !allowMoves;	
			if (myTurn) {
			myTurn = false;						
			sendData({"type":"ttt","waitForTurn":true,"turnComplete":true});
			}
//			sendData({"waitForTurn":true,"turnComplete":true});
		//}
		
	});
}

