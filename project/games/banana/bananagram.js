var library = [13,3,3,6,18,3,4,3,12,2,2,5,3,8,11,3,2,9,6,9,6,3,3,2,3,2];


$(document).ready(function() {
	Framework.defineHandleData(recieveData);
	Framework.defineGame(gameStart);
	Framework.defineInitialState(function(){});
	
});

function myGameArea() {
	var instance = {
	start : function() {
		var d;
		for(var i = 0; i < 20; i++) {
			for (var j = 0; j < 20; j++) {
				d = $('<div class="droptarget" ondrop="drop(event)" ondragover="allowDrop(event)">');
                        	d.addClass("banana");
				d.css("top", (i * 50)); // = '' + (i * 50) + 'px';
				d.css("left", (j * 50)); //= '' + (j * 50) + 'px';
				$("#game").append(d);
			}	
			
		}
		var newp = $('<p ondragstart="dragStart(event)" ondrag="dragging(event)" draggable="true" id="dragtarget">Drag me!</p>');
		$("#game").append(newp);
		var peelButton = $("<button>");
		peelButton.addClass("peel");
		var t = document.createTextNode("PEEL");
		peelButton.append(t);
		$("#game").append(peelButton);

		var bananaButton = $("<button>");
		bananaButton.addClass("banana");
		t = document.createTextNode("BANANA");
		bananaButton.append(t);
		$("#game").append(bananaButton);

		var dumpButton = $("<button>");
		dumpButton.addClass("dump");
		t = document.createTextNode("DUMP");
		dumpButton.append(t);
		$("#game").append(dumpButton);	
	}
	}
	return instance;		
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("Text");
    event.target.appendChild(document.getElementById(data));
}

function allowDrop(event) {
    event.preventDefault();
}

function dragStart(event) {
    event.dataTransfer.setData("Text", event.target.id);
}


var letters = ["E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","A","A","A","A",
               "A","A","A","A","A","A","A","A","A","I","I","I","I","I","I","I","I","I","I","I","I","O",
               "O","O","O","O","O","O","O","O","O","O","T","T","T","T","T","T","T","T","T","R","R","R",
               "R","R","R","R","R","R","N","N","N","N","N","N","N","N","D","D","D","D","D","D","S","S",
               "S","S","S","S","U","U","U","U","U","U","L","L","L","L","L","G","G","G","G","B","B","B",
               "C","C","C","F","F","F","H","H","H","M","M","M","P","P","P","V","V","V","W","W","W","Y",
               "Y","Y","J","J","K","K","Q","Q","X","X","Z","Z"]
               
//init function that sets an array of all the characters
//peel function that pics one from the pile
//dump function that puts one in the pile and takes 3



var handsize = 21;
var lastspot;
var totalTiles = 144;
var hand = [];
function initHand() {
  
  var spot;
  var temp;
  for (var i = 0; i < 21; i++) {
    hand[i] = draw();
	displayHand();
    // send saying we drew  wait for response. 
  	// make turn based
  }
}
                    
function draw() {
  var spot;
 	spot = Math.floor((Math.random() * 144));
    while (library[spot] == 0) {
      spot = Math.floor((Math.random() * 144));
    } 
      lastspot = spot;
    spot = letters[spot];
    letters[spot] = 0;
                        totalTiles--;
    return spot;
}
function peel(hand, handSize) {
    if (handsize == 0 && totalTiles == 0) alert("win");
  	hand[handsize] = draw();
	handsize++;
	displayHand();
}
    
function dump(oldletter) {
  letters[lastspot] = oldletter;
hand[handsize] = draw();
    handsize++;

	displayHand();
hand[handsize] = draw();
    handsize++;

	displayHand();
hand[handsize] = draw();
    handsize++;

	displayHand();
  
}
    
function shift() {
  for(var i = 0; i < hand.size; i ++) {
    if (hand[i] == 0) {
        for(var j = i; j < hand.size; j++) {
          hand[j] = hand[j+1];
          if (j-1 == hand.size) { hand[hand.size-1] = 0; }
        }
    }
  }
}

function displayHand(){
	console.log("wat");
  for (var i = 0; i < handsize; i++ ) {
	console.log("appended");
    var newp = $('<p ondragstart="dragStart(event)" ondrag="dragging(event)" draggable="true" id="dragtarget">'+ hand[i]+'</p>');
     $("#game").append(newp);
  }
}

function play(letter) {
	

}

function gameStart() {
	//Framework.getGame().initializeTurnGame();
	var game = myGameArea();
	game.start();
	initHand();
}

function recieveData(data) {
}
