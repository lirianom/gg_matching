const BLOCKSPEED = 10;
const MOVESPEED = 50;
const AREAW = 500;
const AREAH = 700;
const AVATARW = 50;
const AVATARH = 50;
const COLLENGTH = 10;
const WALLW = 20;

$(document).ready(function() {
	// might want to use an iframe for the "game"
    myAvatar = new component(AVATARW, AVATARH, "red", 225, 570);
    leftBound = new component(WALLW, AREAH, "purple", 0, 0);
    rightBound = new component(WALLW, AREAH, "purple", 480, 0);
    floorBound = new component(AREAW, WALLW, "purple", 0, 550);  

		
	// skipping readyup

	Framework.defineHandleData(recieveData);

	// skipping define game
    myGameArea.start();
	
	myAvatar2 = new component2(AVATARW, AVATARH, "green", 225, 570);
    leftBound2 = new component2(WALLW, AREAH, "red", 0, 0);
    rightBound2 = new component2(WALLW, AREAH, "red", 480, 0);
    floorBound2 = new component2(AREAW, WALLW, "red", 0, 550);
	myGameArea2.start();

});

function recieveData(data) {
	if (data.type == "palamedes") {
		console.log(data.move);
		if (data.move == "left") myAvatar2.x -= 50;
		else if (data.move== "right") myAvatar2.x += 50;
	}
}


var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = AREAW;
        this.canvas.height = AREAH;
        this.context = this.canvas.getContext("2d");
        $("#palamedes").append(this.canvas);
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
				Framework.sendData({"type":"palamedes","move":"left"});
            }
            if (keyCode == 39) {
                myAvatar.x += 50;
				Framework.sendData({"type":"palamedes","move":"right"});
            }
        })

    },
    clear : function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var myGameArea2 = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = AREAW;
        this.canvas.height = AREAH;
        this.context = this.canvas.getContext("2d");
        $("#palamedes2").append(this.canvas);
        this.interval = setInterval(updateGameArea2, 20);
        /*
        window.addEventListener("keydown", function(e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
        */
/*
        $(document).keydown(function(e) {
            var keyCode = e.keyCode;
            if (keyCode == 37) {
                myAvatar2.x -= 50;
                Framework.sendData({"type":"palamedes","move":"left"});
            }
            if (keyCode == 39) {
                myAvatar2.x += 50;
                Framework.sendData({"type":"palamedes","move":"right"});
            }


        })
*/

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

function component2(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea2.context;
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

function updateGameArea2() {
    myGameArea2.clear();
    myAvatar2.update();
    leftBound2.update();
    rightBound2.update();
    floorBound2.update();


    myAvatar2.newPos();
    myAvatar2.update();
}
