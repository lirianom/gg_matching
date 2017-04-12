/*
	READY
*/
var myMove;

$(document).ready(function() {
	Framework.defineHandleData(handleData);
	Framework.defineGame(game);
	Framework.defineEndGameCleanUp(gameComplete);
	Framework.defineInitialState(initial); // only used for rematch as of now
});

/*
	Required functions for peerConnections.js
*/

function handleData(data) {
    if (data.type == "banana") {

    }
}

function countdownComplete() {
	Framework.getGame().setGameOver();
}

function initial() {

}

/*
	Game specific functions
*/

function game() {
	Framework.getGame().setAllowMoves(true);
	moves();
	Framework.countdown();
}

function determineVictory() {	

}

function moves() {	

}


function gameComplete() {
    var result = determineVictory() 
	if ( result == 1) {
		console.log("Win");
		Framework.getGame().setWinner(Framework.getPeerId());
	}
	else if ( result == .5) {
		console.log("Tie");
		Framework.getGame().setWinner(0);
	}
	else {
		console.log("Loss");
	}
	
	$("#rock").off();
	$("#paper").off();
	$("#scissors").off();
}

