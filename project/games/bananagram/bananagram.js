var library = [13,3,3,6,18,3,4,3,12,2,2,5,3,8,11,3,2,9,6,9,6,3,3,2,3,2];


$(document).ready(function() {
	Framework.defineHandleData(recieveData);
	Framework.defineGame(gameStart);
	Framework.defineInitialState(function(){});
});

function myGameArea() {
	start : function() {
		var d;
		for(var i = 0; i < 20; i++) {
			d = document.createElement("div");
			for (var j = 0; j < 20; j++) {
				d.style.left = '' + (i * 50) + 'px';
				d.style.top = '' + (j * 50) + 'px';
			}	
			
		}	
	}		
}

function gameStart() {
}
