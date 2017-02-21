allowMoves = false;

/*
	READY
*/

$(document).ready(function() {
	Framework.readyUp(); // to set Ready up button not sure best location fro this yet
	Framework.defineHandleData(recieveData);
	Framework.defineGame(game);
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
		Framework.getGame().endTurn();
    }
}

function game() {	
	Framework.getGame().initializeTurnGame();
	moves();

}

/*
	Game Specific functions
*/


function determineVictory() {

}


function moves() {
	count = 0;
	$(document).on("click", function() {
		if (Framework.getGame().currentTurn == Framework.getPeerId()) {
			Framework.getGame().endTurn();					
			Framework.sendData({"type":"oldttt","waitForTurn":true,"turnComplete":true});
		}
	});
}

