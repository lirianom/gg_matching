const BLOCKSPEED = 10;
const MOVESPEED = 50;
const AREAW = 500;
const AREAH = 700;
const AVATARW = 50;
const AVATARH = 50;
const COLLENGTH = 10;
const WALLW = 20;

$(document).ready(function() {
    myAvatar = new component(AVATARW, AVATARH, "red", 225, 570);
    leftBound = new component(WALLW, AREAH, "purple", 0, 0);
    rightBound = new component(WALLW, AREAH, "purple", 480, 0);
    floorBound = new component(AREAW, WALLW, "purple", 0, 550);  
    myGameArea.start();
});

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = AREAW;
        this.canvas.height = AREAH;
        this.context = this.canvas.getContext("2d");
        $("body").append(this.canvas);
        this.interval = setInterval(updateGameArea, 20);
        /*
        window.addEventListener("keydown", function(e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
        */
        $(document).keydown(function(e) {
            var keyCode = e.keyCode;
            if (keyCode == 37) {
                myAvatar.x -= 50;
            }
            if (keyCode == 39) {
                myAvatar.x += 50;
            }
        })

    },
    clear : function () {
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
    this.crashWith = function(barrier) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var bleft = barrier.x;
        var bright = barrier.x + (barrier.width);
        var btop = barrier.y;
        var bbottom = barrier.y + (barrier.height);
        var crash = false;
        if ((mybottom < btop) ||
            (mytop > bbottom) ||
            (myright < bleft) ||
            (myleft > bright)) {
            crash = true;
        }
        return crash;
    }
}

function updateGameArea() {
    myGameArea.clear();
    myAvatar.update();
    leftBound.update();
    rightBound.update();
    floorBound.update();
    

    myAvatar.newPos();
    myAvatar.update();
}
