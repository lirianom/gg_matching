const BLOCKSPEED = 10;
const MOVESPEED = 50;
const AREAW = 500;
const AREAH = 700;
const AVATARW = 50;
const AVATARH = 50;
const COLLENGTH = 10;
const WALLW = 20;
const ROWLENGTH = 9;
const QUEUELENGTH = 10;
const CEIL = 1;
const FLOOR = 6;

var row1 = [ROWLENGTH];
var row2 = [ROWLENGTH];
var row3 = [ROWLENGTH];
var row4 = [ROWLENGTH];
var row5 = [ROWLENGTH];
var row6 = [ROWLENGTH];
var row7 = [ROWLENGTH];
var row8 = [ROWLENGTH];
var row9 = [ROWLENGTH];
var row10 = [ROWLENGTH];
var row11 = [ROWLENGTH];

var count = 0;
var queue;
var min;
var max;
var p1;
var p2;

function Queue() {
    this.oldestIndex = 1;
    this.newestIndex = 1;
    this.storage = {};
}

Queue.prototype.size = function() {
    return this.newestIndex - this.oldestIndex;
};

Queue.prototype.enqueue = function(data) {
    this.storage[this.newestIndex] = data;
    this.newestIndex++;
};

Queue.prototype.dequeue = function() {
    var oldestIndex = this.oldestIndex,
        newestIndex = this.newestIndex,
        deletedData;

    if (oldestIndex !== newestIndex) {
        deletedData = this.storage[oldestIndex];
        delete this.storage[oldestIndex];
        this.oldestIndex++;

        return deletedData;
    }
};


$(document).ready(function() {
    myAvatar = new component(AVATARW, AVATARH, "red", 225, 570);
    leftBound = new component(WALLW, AREAH, "purple", 0, 0);
    rightBound = new component(WALLW, AREAH, "purple", 480, 0);
    floorBound = new component(AREAW, WALLW, "purple", 0, 550);  
    p1 = myGameArea();
    p1.start();
});

function myGameArea()  {
    var instance = {
    canvas : document.createElement("canvas"),
    start : function() {
        //array = new int[][];
        min = Math.ceil(CEIL);
        max = Math.floor(FLOOR);
        this.canvas.width = AREAW;
        this.canvas.height = AREAH;
        this.context = this.canvas.getContext("2d");
        $("body").append(this.canvas);
        this.interval1 = setInterval(updateGameArea, 20);
        for (var i = 0; i < ROWLENGTH; i++) {
            row1[i] = 0;
            row2[i] = 0;
            row3[i] = 0;
            row4[i] = 0;
            row5[i] = 0;
            row6[i] = 0;
            row7[i] = 0;
            row8[i] = 0;
            row9[i] = 0;
            row10[i] = 0;
            row11[i] = 0;
        }
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
        for (int i = 0; i < QUEUELENGTH; i++) {
            for (int j = 0; j < ROWLENGTH; j++) {
                array[i][j] = Math.floor(Math.random() * ((max+1)-min)) + min;    
            }
        }
        */
        queue = new Queue(); 
        for (var i = 0; i < QUEUELENGTH; i++) {
             queue.enqueue(makeRow(min, max));
        }
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
    return instance;
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = p1.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = false;
        if ((mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)) {
            crash = true;
        }

        return crash;

    }
}

function updateGameArea() {
    p1.clear();
    //myAvatar.update();
    leftBound.update();
    rightBound.update();
    floorBound.update();
    if (myAvatar.x < 25) {
        myAvatar.x = 25;
    }
    if (myAvatar.x > 425) {
        myAvatar.x = 425;
    }
    /*
    if (myAvatar.crashWith(leftBound)) {
         myAvatar.x = 50;
    }
    else if (myAvatar.crashWith(rightBound)) {
        myAvatar.x = 225;
    }
    else {
        myAvatar.update()
    }
    */
    drawRow(row1, 0);
    drawRow(row2, 50);
    drawRow(row3, 100);
    drawRow(row4, 150);
    drawRow(row5, 200);
    drawRow(row6, 250);
    drawRow(row7, 300);
    drawRow(row8, 350);
    drawRow(row9, 400);
    drawRow(row10, 450);
    drawRow(row11, 500);
    while (queue.size < 10) {
        queue.enqueue(makeRow(min, max));
    }
    myAvatar.newPos();
    myAvatar.update();
    count += 1;
    if (count == 50) {
        insertRow();
        count = 0;
    }
}


function makeRow(min, max) {
    var a = new Array(ROWLENGTH);
    for (var i = 0; i < ROWLENGTH; i++) {
        a[i] = Math.floor((Math.random() * (max - min + 1))) + min; 
    }

    return a;
}

function insertRow() {
    var d = queue.dequeue();
    for (var i = 0; i < ROWLENGTH; i++) {
        //if (row11[i] != 0) {
        //    endGame();
        //}
        //else {
        //use storage to get all the keys
            row11[i] = row10[i];
            row10[i] = row9[i];
            row9[i] = row8[i];
            row8[i] = row7[i];
            row7[i] = row6[i];
            row6[i] = row5[i];
            row5[i] = row4[i];
            row4[i] = row3[i];
            row3[i] = row2[i];
            row2[i] = row1[i];
            row1[i] = d[i];
        //}
    }
    queue.enqueue(makeRow(min, max));
}

function drawRow(row, y) {
    var x = 25;
    ctx = p1.context;
    for (var i = 0; i < ROWLENGTH; i++) {
        if (row[i] != 0) {
        if (row[i] == 1) {
            ctx.fillStyle = "blue";
        } else if (row[i] == 2) {
            ctx.fillStyle = "brown";
        } else if (row[i] == 3) {
            ctx.fillStyle = "yellow";
        } else if (row[i] == 4) {
            ctx.fillStyle = "pink";
        } else if (row[i] == 5) {
            ctx.fillStyle = "orange";
        } else if (row[i] == 6) {
            ctx.fillStyle = "green";
        }
        ctx.fillRect(x, y, 50, 50);
        }
        x += 50;

    }
}

function endGame() {
}
