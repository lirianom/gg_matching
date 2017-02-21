function Game(readyList) { // Constructor
    var player1;
    var player2;
    
	var currentTurn;

    var turnBased = false;
    var allowMoves = false;
    this.setPlayer1(readyList[0]);
    this.setPlayer2(readyList[1]);

}

Game.prototype.initializeTurnGame = function() {
    this.currentTurn = this.player1;
    this.turnBased = true;
}

Game.prototype.setPlayer1 = function(id) {
    this.player1 = id;
    console.log("Player 1 = " + this.player1);
}

Game.prototype.setPlayer2 = function(id) {
    this.player2 = id;
    console.log("Player 2 = " + id);
}

Game.prototype.getPlayer1 = function() {
    return this.player1;
}

Game.prototype.getPlayer2 = function() {
    return this.player2;
}

Game.prototype.currentTurn = function() {
    return currentTurn;
}

Game.prototype.nextPlayer = function() {
	if (this.currentTurn == this.player1) return this.player2;
	else return this.player1;
}

Game.prototype.endTurn = function() {
    if (this.currentTurn == this.player1) this.currentTurn = this.player2;
    else this.currentTurn = this.player1;
}

Game.prototype.movesAllowed = function() {
    // If turn based game allow moves?
    if (this.turnBased) {
        return this.currentTurn == getPeerId();
    }
    else {
        return this.allowMoves;
    }
}

Game.prototype.setAllowMoves = function(val) {
    if (typeof val != 'boolean') { throw new Error("setAllowMoves(boolean v) takes a boolean as a parameter not " + typeof val); }
	this.allowMoves = val;
}


