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
		sendData({"type":"readyUp"});
		game();
	});

});

/*
	Required functions for peerConnections.js
*/

function handleData(data) {
    if (data.type == "rps") {
        oppChoice = data.choice;
    }
    if (data.type == "readyUp") {
        rid = $("#rid").val();
        readyList.push(rid);
        readyList = $.unique(readyList);
        game();
    }
}

function countdownComplete() {
    $("#oppChoice").html(oppChoice);
    determineVictory();
    allowMoves = false;
}

/*
	Game specific functions
*/

function game() {
	console.log(readyList);
	if (readyList.length == 2) {
		allowMoves = true;
		moves();
		countdown();
	}
}

function determineVictory() {
	
	if (myMove == oppChoice) { $("#result").html("T"); }
	else if (myMove == "Paper" && oppChoice == "Rock") $("#result").html("W");
	else if (myMove == "Paper" && oppChoice == "Scissors") $("#result").html("L");
	else if (myMove == "Rock" && oppChoice == "Paper") $("#result").html("L");
   	else if (myMove == "Rock" && oppChoice == "Scissors") $("#result").html("W");
   	else if (myMove == "Scissors" && oppChoice == "Rock") $("#result").html("L");
    else if (myMove == "Scissors" && oppChoice == "Paper") $("#result").html("W");




}

function moves() {
	
	$("#rock").on("click", function() {
		if (allowMoves) {
			sendData({"type":"rps","choice":"Rock"});
			myMove = "Rock";
			$("#myChoice").html("Rock");
		}
	});

	$("#paper").on("click", function() {
		if (allowMoves) {
			sendData({"type":"rps","choice":"Paper"});
			myMove = "Paper";
			$("#myChoice").html("Paper");
		}
	});

	$("#scissors").on("click", function() {
		if (allowMoves) {
			sendData({"type":"rps","choice":"Scissors"});
			myMove = "Scissors";
			$("#myChoice").html("Scissors")
		}
	});

}

