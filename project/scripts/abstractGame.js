
//http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
// try using this to include game in framework
// Not sure how to include http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
var GameInstance = (function(readyList) {
"use strict";
var instance;
function Game(readyList) { // Constructor
    if (instance) return instance;
	instance = this;

	var player1;
    var player2;
    
	var playerCurrentTurn;
	var gameOver = false;
    var turnBased = false;
    var allowMoves = false;
    this.setPlayer1(readyList[0]);
    this.setPlayer2(readyList[1]);

}

Game.prototype.initializeTurnGame = function() {
	if (this.getGameOver()) { throwError("initializeTurnGame()", "cant be called when game is over"); }
    this.playerCurrentTurn = this.player1;
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

// Issue with naming 
Game.prototype.currentTurn = function() {
	if (this.getGameOver()) { throw new Error("currentTurn() cant be called when game is over"); }
    return this.playerCurrentTurn;
}

Game.prototype.nextPlayer = function() {
	if (this.getGameOver()) { throw new Error("nextPlayer() cant be called when game is over"); }
	if (this.currentTurn() == this.player1) return this.player2;
	else return this.player1;
}

// Somehow make this private
Game.prototype._endClientTurn = function() {
	if (this.getGameOver()) { throw new Error("_endClientTurn() cant be called when game is over"); }
    if (this.currentTurn() == this.player1) this.playerCurrentTurn = this.player2;
    else this.playerCurrentTurn = this.player1;
}

Game.prototype.endTurn = function() {
	if (this.getGameOver()) { throw new Error("endTurn() cant be called when game is over"); }
	this._endClientTurn();
	// Might need to hide this somehow so data cant be confused
	Framework.sendData({"type":"gameInfo", "endTurn":true});
}


Game.prototype.movesAllowed = function() {
	if (this.getGameOver()) { throw new Error("movesAllowed() cant be called when game is over"); }
    if (this.turnBased) {
        return this.currentTurn() == getPeerId();
    }
    else {
        return this.allowMoves;
    }
}

Game.prototype.setAllowMoves = function(val) {
	if (this.getGameOver()) { throw new Error("setAllowMoves(val) cant be called when game is over"); }
	if (typeof val != 'boolean') { throw new Error("setAllowMoves(boolean v) takes a boolean as a parameter not " + typeof val); }
	this.allowMoves = val;
}

// make private
Game.prototype._setClientGameOver = function() {
	this.gameOver = true;
	Framework.endGameCleanUp();	
}

Game.prototype.setGameOver = function() {
	this._setClientGameOver();
	Framework.sendData({"type":"gameInfo", "gameOver":true});
}

Game.prototype.getGameOver = function() {
	return this.gameOver;
}

function throwError(func, msg) {
	throw new Error(func + " " + msg);
}

return Game;

}());
