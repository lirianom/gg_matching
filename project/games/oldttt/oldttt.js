/*
	READY
*/

$(document).ready(function() {
	Framework.readyUp(); // to set Ready up button not sure best location fro this yet
	Framework.defineHandleData(recieveData);
	Framework.defineGame(game);
	Framework.defineEndGameCleanUp(removeMoves);
	Framework.defineInitialState(function() {} );
});


/*
	Required functions for peerConnections.js
*/
var count = 0;
function recieveData(data) {	
	// Method is run by client that recieves the data.
    if (data.type == "oldttt") {
		console.log("Turn: " + count);
		count += 1;
		//	Framework.getGame().endTurn();
		determineVictory();
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
	if (count == 3) {
		// might want a last turn or a victor field
		console.log("You win");
		Framework.getGame().setGameOver();
	}
}


function moves() {
	count = 0;
	$(document).on("click", function() {
		if (Framework.getGame().currentTurn() == Framework.getPeerId()) {
			Framework.getGame().endTurn();
			Framework.sendData({"type":"oldttt"});
		}
	});
}

function removeMoves() {
	$(document).off();
}
