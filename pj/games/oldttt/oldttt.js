allowMoves = false;

/*
	READY
*/

$(document).ready(function() {
	readyUp(); // to set Ready up button not sure best location fro this yet
	defineHandleData(recieveData);
});


/*
	Required functions for peerConnections.js
*/
count = 0;
function recieveData(data) {	
	// Method is run by client that recieves the data.
    if (data.type == "oldttt") {
		console.log("Turn: " + count);
		count += 1;
		getGame().endTurn();
    }
}

function game() {	
	getGame().initializeTurnGame();
	moves();

}

/*
	Game Specific functions
*/


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

