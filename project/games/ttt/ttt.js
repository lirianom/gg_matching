$(document).ready(function() {
	init();

});

var i = setInterval(updateWinner, 34);
var didMove = false;

function init() {
    Framework.readyUp();
	
    Framework.defineHandleData(receiveData);
    Framework.defineGame(game);
	Framework.defineInitialState(function() {} );
}

var count = 0;
function receiveData(data) {
    if (data.type == "ttt") {
        console.log("Turn: " + count);
	count += 1;
	var c = document.getElementById(data.changedSqr).getContext("2d");
	c.font = "70px Georgia";
	c.fillText(data.changedSign, 100, 100);
        sqr1.style.pointerEvents = "auto";
        sqr2.style.pointerEvents = "auto";
        sqr3.style.pointerEvents = "auto";
        sqr4.style.pointerEvents = "auto";
        sqr5.style.pointerEvents = "auto";
        sqr6.style.pointerEvents = "auto";
        sqr7.style.pointerEvents = "auto";
        sqr8.style.pointerEvents = "auto";
        sqr9.style.pointerEvents = "auto";

    }
}

function game() {
    Framework.getGame().initializeTurnGame();
    ttt();
}

function ttt() {
    var sqr1 = document.getElementById("sqr1");
    var sqr2 = document.getElementById("sqr2");
    var sqr3 = document.getElementById("sqr3");
    var sqr4 = document.getElementById("sqr4");
    var sqr5 = document.getElementById("sqr5");
    var sqr6 = document.getElementById("sqr6");
    var sqr7 = document.getElementById("sqr7");
    var sqr8 = document.getElementById("sqr8");
    var sqr9 = document.getElementById("sqr9");
    
    var player;

    player = Framework.getGame().getPlayer1();

    sqr1.addEventListener('click', function() {
        if (sqr1.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr1);
            player = Framework.getGame().nextPlayer();
	    Framework.getGame().endTurn();
        }

    }, false);

    sqr2.addEventListener('click', function() {
        if (sqr2.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr2);
	    player = Framework.getGame().nextPlayer();	 
            Framework.getGame().endTurn();
        }
    }, false);

    sqr3.addEventListener('click', function() {
        if (sqr3.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr3);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }

    }, false);

    sqr4.addEventListener('click', function() {
        if (sqr4.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr4);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }
    }, false);

    sqr5.addEventListener('click', function() {
        if (sqr5.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr5);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }
    }, false);

    sqr6.addEventListener('click', function() {
        if (sqr6.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr6);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }
    }, false);

    sqr7.addEventListener('click', function() {
        if (sqr7.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr7);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }

    }, false);

    sqr8.addEventListener('click', function() {
        if (sqr8.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr8);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }
    }, false);

    sqr9.addEventListener('click', function() {
        if (sqr9.toDataURL() == document.getElementById("blank").toDataURL()) {
            mark(player, sqr9);
            player = Framework.getGame().nextPlayer();
            Framework.getGame().endTurn();
        }
    }, false);
         
}

var changedSqr = null;
var changedSign = null;

function mark(player, sqr) {
    changedSqr = sqr.getAttribute('id');
    var ctx = sqr.getContext("2d");
    ctx.font = "70px Georgia";
    if (Framework.getGame().currentTurn() == Framework.getPeerId()) {
        ctx.fillText("X", 100 , 100);
	changedSign = "X";    
    } else {
        ctx.fillText("O", 100, 100);
	changedSign = "O";
    }
    didMove = true;
     
}

function updateWinner(player) {
    if (didMove) {
        Framework.sendData({
		"type":"ttt",
		"waitForTurn":true,
		"turnComplete":true,
		"changedSqr":changedSqr,
		"changedSign":changedSign,
	});
        didMove = false;
        sqr1.style.pointerEvents = "none";
        sqr2.style.pointerEvents = "none";
        sqr3.style.pointerEvents = "none";
        sqr4.style.pointerEvents = "none";
        sqr5.style.pointerEvents = "none";
        sqr6.style.pointerEvents = "none";
    sqr7.style.pointerEvents = "none";
    sqr8.style.pointerEvents = "none";
    sqr9.style.pointerEvents = "none";

	Framework.getGame().endTurn();
    }
    if (sqr1.toDataURL() == sqr2.toDataURL() && sqr1.toDataURL() == sqr3.toDataURL()
        && sqr1.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr4.toDataURL() == sqr5.toDataURL() && sqr4.toDataURL() == sqr6.toDataURL()
        && sqr4.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr7.toDataURL() == sqr8.toDataURL() && sqr7.toDataURL() == sqr9.toDataURL()
        && sqr7.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr1.toDataURL() == sqr4.toDataURL() && sqr1.toDataURL() == sqr7.toDataURL()
        && sqr1.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr2.toDataURL() == sqr5.toDataURL() && sqr2.toDataURL() == sqr8.toDataURL()
        && sqr2.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr3.toDataURL() == sqr6.toDataURL() && sqr3.toDataURL() == sqr9.toDataURL()
        && sqr3.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr1.toDataURL() == sqr5.toDataURL() && sqr1.toDataURL() == sqr9.toDataURL()
        && sqr1.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }
    if (sqr3.toDataURL() == sqr5.toDataURL() && sqr3.toDataURL() == sqr7.toDataURL()
        && sqr3.toDataURL() != document.getElementById("blank").toDataURL()) {
        endGame(player);
    }

}

function endGame(player) {
    clearInterval(i);
	    
    sqr1.style.pointerEvents = "none";
    sqr2.style.pointerEvents = "none";
    sqr3.style.pointerEvents = "none";
    sqr4.style.pointerEvents = "none";
    sqr5.style.pointerEvents = "none";
    sqr6.style.pointerEvents = "none";
    sqr7.style.pointerEvents = "none";
    sqr8.style.pointerEvents = "none";
    sqr9.style.pointerEvents = "none";         
}


