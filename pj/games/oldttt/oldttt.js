allowMoves = false;

/*
	READY
*/

$(document).ready(function() {
	readyUp(); // to set Ready up button not sure best location fro this yet
});


/*
	Required functions for peerConnections.js
*/
count = 0;
function handleData(data) {	
	// Method is run by client that recieves the data.
    if (data.type == "oldttt") {
		console.log("Turn: " + count);
		count += 1;
		getGame().endTurn();
    }
}

/*
	Game specific functions
*/

function game() {	
	moves();
}

function determineVictory() {

}


function moves() {
	count = 0;
	console.log(getGame());
	$(document).on("click", function() {
		if (getGame().currentTurn == getPeerId()) {
			getGame().endTurn();					
			sendData({"type":"oldttt","waitForTurn":true,"turnComplete":true});
		}
	});
}

