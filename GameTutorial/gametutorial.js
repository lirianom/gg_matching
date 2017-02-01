

window.onload = startGame;

var myGamePiece;
var myObstacle;
const SPEED = 3;

function startGame() {
    myGamePiece = new component(30, 30, "red", 10, 120);
    myObstacle = new component(10, 200, "green", 300, 120);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    
    this.crashWith = function (otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = false;
        }

        return crash;

    }
}

function updateGameArea() {
    myGameArea.clear();
    myObstacle.update();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    if (myGameArea.keys && myGameArea.keys[87]) {myGamePiece.speedY = -1 * SPEED;}
    if (myGameArea.keys && myGameArea.keys[65]) {myGamePiece.speedX = -1 * SPEED;}
    if (myGameArea.keys && myGameArea.keys[83]) {myGamePiece.speedY = SPEED;}
    if (myGameArea.keys && myGameArea.keys[68]) {myGamePiece.speedX = SPEED;}
    if (!(myGamePiece.crashWith(myObstacle))) {
        myGamePiece.newPos();    
    } else {
        if (myGamePiece.speedX != 0) {
            myGamePiece.speedX *= -1;
        } else {

        }
        if (myGamePiece.speedY != 0) {
            myGamePiece.speedY *= -1;
        }
        myGamePiece.newPos();
    }
    myGamePiece.update();
}

function stopMove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}
