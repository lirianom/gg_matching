function Game(readyList) { // Constructor
    var player1;
    var player2;
    // for turn based
    var currentTurn;

    var turnBased = false;
    var allowMoves = false;
    this.setPlayer1(readyList[0]);
    this.setPlayer2(readyList[1]);

    //this.initializeTurnGame(null); //eventually random pick first player
}

Game.prototype.test = function() {
    console.log("test");
}

Game.prototype.initializeTurnGame = function(readyList) {
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
    this.allowMoves = val;
}


