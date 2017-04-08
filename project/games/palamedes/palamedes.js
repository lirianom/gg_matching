const BLOCKSPEED = 10;
const MOVESPEED = 50;
const AREAW = 500;
const AREAH = 700;
const AVATARW = 40;
const AVATARH = 40;
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
//var queue;
var min;
var max;
var p1;
var p2;
var position;
var shotLibrary = new Array(6);
shotLibrary[0] = "blue";
shotLibrary[1] = "green";
shotLibrary[2] = "orange";
shotLibrary[3] = "pink";
shotLibrary[4] = "yellow";
shotLibrary[5] = "brown";
shotLibrary[6] = "grey";
var shot = shotLibrary[0];
var sampleBr;
var sampleY;
var sampleP;
var sampleO;
var sampleBl;
var sampleG;
var shotFlag;

//var rowWorker = new Worker('workRow.js');

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
    //myAvatar = new component(AVATARW, AVATARH, "red", 225, 570);
    //leftBound = new component(WALLW, AREAH, "purple", 0, 0);
    //rightBound = new component(WALLW, AREAH, "purple", 480, 0);
    //floorBound = new component(AREAW, WALLW, "purple", 0, 550);
    //Framework.readyUp();
    Framework.defineHandleData(recieveData);
    Framework.defineGame(gameStart);
    Framework.defineInitialState(function(){});
});
function gameStart() {  
    p1 = myGameArea(readInput, initializeQueue, rows, true);
    p1.start();
    p2 = myGameArea(updateOpponentPosition, function(){}, function(){}, false);
    p2.start();
}

function myGameArea(ri, iq, r, temp)  {
    var instance = {
	isP1 : temp,
    canvas : document.createElement("canvas"),
	clearAva : function() {
		this.context.clearRect(0, 550, 500, this.canvas.height);
	},
    clear : function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    start : function() {
        instance.myAvatar = new component(AVATARW, AVATARH, "red", 225, 570, this);
        var leftBound = new component(WALLW, AREAH, "purple", 0, 0, this);
        var rightBound = new component(WALLW, AREAH, "purple", 480, 0, this);
        var floorBound = new component(AREAW, WALLW, "purple", 0, 550, this);
		instance.blank = new component(AVATARW, AVATARH, "grey", 25, 620, this);
		instance.loadedShot = new component(AVATARW, AVATARH, shot, 225, 500, this);
		shotFlag = 0;
		/*
		instance.spaces = new Array(11);
		for (var i = 0; i < 11; i++) {
			instance.spaces[i] = new Array(9);
		}
		//console.log(instance.spaces);
		for (var i = 0; i < 11; i++) {
			for (var j = 0; j < 9; j++) {
				instance.spaces[i][j] = new component(AVATARW, AVATARH, "grey", 10000, 10000, this);
				//instance.spaces[i][j] = 1;
			}
		}
		*/  
        //array = new int[][];
        min = Math.ceil(CEIL);
        max = Math.floor(FLOOR);
        this.canvas.width = AREAW;
        this.canvas.height = AREAH;
        this.context = this.canvas.getContext("2d");
        $("body").append(this.canvas);
        var queue = new Queue();
        queue = iq(queue);
        //for (var i = 0; i < QUEUELENGTH; i++) {
        //     queue.enqueue(makeRow(min, max));
        //
        this.interval1 = setInterval(function() {
	    $(instance.canvas).stop(true,true);
            updateGameArea(instance.myAvatar, leftBound, rightBound, floorBound, instance, queue, r);
        }, 20);
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
		
		var ctx = this.canvas.getContext("2d");
		ctx.fillStyle = "brown";
		ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleBr = ctx.getImageData(25, 570, AVATARW, AVATARH);
	    ctx.fillStyle = "yellow";
        ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleY = ctx.getImageData(25, 570, AVATARW, AVATARH);
        ctx.fillStyle = "blue";
        ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleBl = ctx.getImageData(25, 570, AVATARW, AVATARH);
		ctx.fillStyle = "pink";
        ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleP = ctx.getImageData(25, 570, AVATARW, AVATARH);
		ctx.fillStyle = "orange";
        ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleO = ctx.getImageData(25, 570, AVATARW, AVATARH);
		ctx.fillStyle = "green";
        ctx.fillRect(25, 570, AVATARW, AVATARH);
        sampleG = ctx.getImageData(25, 570, AVATARW, AVATARH);			
		
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
        /*
        queue = new Queue(); 
        for (var i = 0; i < QUEUELENGTH; i++) {
             queue.enqueue(makeRow(min, max));
        }
        */ 
   
            /*
            var keyCode = e.keyCode;
            if (keyCode == 37) {
                instance.myAvatar.x -= 50;
            }
            if (keyCode == 39) {
                instance.myAvatar.x += 50;
            }
            */
        ri(instance);   
        //})
        

    }
    //clear : function () {
    //    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //}
    }
    return instance;
}

function readInput(instance) {
    $(document).keydown(function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 37) {
        instance.myAvatar.x -= 50;
		instance.loadedShot.x -= 50;
    }
    if (keyCode == 39) {
        instance.myAvatar.x += 50;
		instance.loadedShot.x += 50;
    }
    if (keyCode == 38) {
		//shootProjectile(instance);
		shotFlag = 1;
    }
    if (keyCode == 40) {
	swapShot(instance);
    }
    });

}

function shootProjectile(instance) {
				        
}

function swapShot(instance) {
	switch(shot) {
        case shotLibrary[0] :
            shot = shotLibrary[1];
            break;
        case shotLibrary[1] :
            shot = shotLibrary[2];
            break;
        case shotLibrary[2] :
            shot = shotLibrary[3];
            break;
        case shotLibrary[3] :
            shot = shotLibrary[4];
            break;
        case shotLibrary[4] :
            shot = shotLibrary[5];
            break;
        case shotLibrary[5] :
            shot = shotLibrary[0];
            break;
        default :
            break;
    }
	instance.loadedShot.color = shot;
}

function initializeQueue(queue) {
    for (var i = 0; i < QUEUELENGTH; i++) {
             queue.enqueue(makeRow(min, max));
    }
    return queue;    
}

function component(width, height, color, x, y, p) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
	this.color = color;
    this.x = x;
    this.y = y;
	this.crashFlag = true;
    this.update = function() {
        ctx = p.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function(otherobj) {
		if (this.crashFlag) {
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
	this.remove = function() {
		ctx = p.context;
		ctx.clearRect(this.x, this.y, this.width, this.height);
		this.crashFlag = false;		
	}
	this.change = function(color, x, y) {
    	this.color = color;
		this.x = x;
		this.y = y;				
	}
}

function updateGameArea(myAvatar, leftBound, rightBound, floorBound, p, queue, rows) {
    if (p.isP1) p.clear();
	else {
		p.clearAva();
		p.loadedShot.update();
	}
    myAvatar.update();
    leftBound.update();
    rightBound.update();
    floorBound.update();
	p.blank.update();
	if (shotFlag == 1 && p.isP1) {
		p.loadedShot.y -= 3;
	}	
	p.loadedShot.update();
	/*
	for (var i = 0; i < 11; i++) {
		for (var j = 0; j < 9; j++) {
			p.spaces[i][j].update();
		}
	}
	*/
    if (myAvatar.x < 25) {
        myAvatar.x = 25;
		p.loadedShot.x = 25;
    }
    if (myAvatar.x > 425) {
        myAvatar.x = 425;
		p.loadedShot.x = 425;
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
	checkMatch(p);
    rows(p, queue);
    /*
    drawRow(row1, 0, p);
    drawRow(row2, 50, p);
    drawRow(row3, 100, p);
    drawRow(row4, 150, p);
    drawRow(row5, 200, p);
    drawRow(row6, 250, p);
    drawRow(row7, 300, p);
    drawRow(row8, 350, p);
    drawRow(row9, 400, p);
    drawRow(row10, 450, p);
    drawRow(row11, 500, p);
    while (queue.size < 10) {
        queue.enqueue(makeRow(min, max));
    }
    myAvatar.newPos();
    myAvatar.update();
    count += 1;
    if (count == 50) {
        insertRow(queue);
        count = 0;
    }
    */
    var j = p1.myAvatar.x;
	
    Framework.sendData({
	"type":"palamedes",
	"row1":row1,
	"row2":row2,
	"row3":row3,
	"row4":row4,
	"row5":row5,
	"row6":row6,
	"row7":row7,
	"row8":row8,
	"row9":row9,
	"row10":row10,
	"row11":row11,
	"ap":j
    });
}

function recieveData(data) {

	if(data.type == "palamedes") {
        drawRow(data.row1, 0, p2);
        drawRow(data.row2, 50, p2);
        drawRow(data.row3, 100, p2);
        drawRow(data.row4, 150, p2);
        drawRow(data.row5, 200, p2);
        drawRow(data.row6, 250, p2);
        drawRow(data.row7, 300, p2);
        drawRow(data.row8, 350, p2);
        drawRow(data.row9, 400, p2);
        drawRow(data.row10, 450, p2);
        drawRow(data.row11, 500, p2);
		//console.log(data.ap);
		p2.myAvatar.x = data.ap;
    }
}

function updateOpponentPosition(p) {
    //p.myAvatar.x = position;    
}


function rows(p, queue) {
    drawRow(row1, 0, p);
    drawRow(row2, 50, p);
    drawRow(row3, 100, p);
    drawRow(row4, 150, p);
    drawRow(row5, 200, p);
    drawRow(row6, 250, p);
    drawRow(row7, 300, p);
    drawRow(row8, 350, p);
    drawRow(row9, 400, p);
    drawRow(row10, 450, p);
    drawRow(row11, 500, p);
    while (queue.size < 10) {
        queue.enqueue(makeRow(min, max));
    }
    //myAvatar.newPos();
    //myAvatar.update();
    count += 1;
    if (count == 500) {
        insertRow(queue);
		//checkMatch(p);
        count = 0; 
    }

}

function checkMatch(p) {
	//var ctx = p.canvas.getContext("2d");
	//var matcher = ctx.rect(p.loadedShot.x, p.loadedShot.y + 50, 50, 50);
	//if (matcher.getContext()) {
	//	console.log("yeh");
	//}
    	
	var ctx = p.canvas.getContext("2d");
	var shotData = ctx.getImageData(p.loadedShot.x, p.loadedShot.y, AVATARW, AVATARH);
	//console.log(shotData);
	var checkData = ctx.getImageData(p.loadedShot.x, p.loadedShot.y - 50, AVATARW, AVATARH);
	//console.log(compareImages(shotData, checkData));
	if(compareImages(shotData, checkData)) {
		ctx.clearRect(p.loadedShot.x, p.loadedShot.y + 50, AVATARW, AVATARH);
		
	} 
	
}

function compareImages(img1, img2) {
	if(img1.data.length != img2.data.length)
		return false;
	for(var i = 0; i < img1.data.length; ++i){
		if(img1.data[i] != img2.data[i])
			return false;
	}
    return true;	
}

function makeRow(min, max) {
    var a = new Array(ROWLENGTH);
    for (var i = 0; i < ROWLENGTH; i++) {
        a[i] = Math.floor((Math.random() * (max - min + 1))) + min; 
    }

    return a;
}

function insertRow(queue) {
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

//var leftBound = new component(WALLW, AREAH, "purple", 0, 0, this);

function drawRow(row, y, p) {

    var x = 25;
    var ctx = p.context;
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
        ctx.fillRect(x, y, AVATARW, AVATARH);
        }
        x += 50;

    }

/*
	//console.log(p);
	//console.log(p.spaces);
    var x = 25;
	var rowIndex = 0;
	var color;
    for (var i = 0; i < ROWLENGTH; i++) {
       
		switch(row[i]) {
			case 0:
				color = "grey";
				//p.spaces[i][rowIndex].remove = false;
			case 1:
				color = "blue";
				break;
			case 2: 
				color = "brown";
				break;
		    case 3:
                color = "yellow";
                break;
			case 4:
                color = "pink";
                break;
			case 5:
                color = "orange";
                break;
			case 6:
                color = "green";
                break;
			default:
                break;
		}
		
		//p.spaces[i][rowIndex].remove;

		//console.log(p.spaces);
		//p.spaces[i][rowIndex].change(color, x, y);
		x += 50;
		rowIndex++;
	       
    }

*/
}


function endGame() {

}
