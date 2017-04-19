/*
	READY
*/
var myMove;

$(document).ready(function() {
//	Framework.readyUp();
	Framework.defineHandleData(handleData);
	Framework.defineCountdownComplete(countdownComplete);
	Framework.defineGame(game);
	Framework.defineEndGameCleanUp(gameComplete);
	Framework.defineInitialState(initial); // only used for rematch as of now
});

/*
	Required functions for peerConnections.js
*/

function handleData(data) {
    if (data.type == "test") {
        oppChoice = data.choice;
		if (myMove !== undefined) {
			Framework.forceEndCountdown();
			Framework.getGame().setGameOver();
		    Framework.rematch(); // confusion with F.rematch and F.getGame.rematch
		}
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
	$("#oppChoice").html(oppChoice);
	if (myMove == oppChoice) { $("#result").html("T"); }
	else if (myMove == "Paper" && oppChoice == "Rock") $("#result").html("W");
	else if (myMove == "Paper" && oppChoice == "Scissors") $("#result").html("L");
	else if (myMove == "Rock" && oppChoice == "Paper") $("#result").html("L");
   	else if (myMove == "Rock" && oppChoice == "Scissors") $("#result").html("W");
   	else if (myMove == "Scissors" && oppChoice == "Rock") $("#result").html("L");
	else if (myMove == "Scissors" && oppChoice == "Paper") $("#result").html("W");
	// Modify so not reading from HTML
	if ($("#result").html() == "W") return 1;
	else if ($("#result").html() == "T") return .5;
	else return 0;
}

function moves() {	
	$("#rock").on("click", function() {
		if (Framework.getGame().movesAllowed()) {
			Framework.sendData({"type":"rps","choice":"Rock"});
			myMove = "Rock";
			$("#myChoice").html("Rock");
		}
	});

	$("#paper").on("click", function() {
		if (Framework.getGame().movesAllowed()) {
			Framework.sendData({"type":"rps","choice":"Paper"});
			myMove = "Paper";
			$("#myChoice").html("Paper");
		}
	});

	$("#scissors").on("click", function() {
		if (Framework.getGame().movesAllowed()) {
			Framework.sendData({"type":"rps","choice":"Scissors"});
			myMove = "Scissors";
			$("#myChoice").html("Scissors")
		}
	});

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

