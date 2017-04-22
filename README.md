# gg_matching a framework for creating web based peer-to-peer games

This framework allows developers to create a web based game without worrying about managing peer-to-peer connections and user information. 

The goal of gg_matching is to take the managing of user's and their connections out of the game developing and let the developer focus on creating a fun game. 


## Installing 

```
  git clone https://github.com/Capstone2017/gg_matching.git
```

To begin with you need nodeJS and npm installed.

To ease development use nodemon to start the server https://github.com/remy/nodemon
```
  npm install nodemon
```

To setup the node.js server side you need Express and Peer
```
  npm install express
```
```
  npm install peer
```

The framework uses rethinkdb to store user information
``` 
  npm install rethinkdb
```
Follow the steps at https://rethinkdb.com/docs/install to get rethinkdb setup on your OS

The login of the framework uses Google's authentication 
```
  npm install google-auth-library
```

Finally you need to create a google developer account at https://console.developers.google.com/apis/library?project=capstone-162319&organizationId=533863865723 
Go to credentials and create credentials for a web application and copy the client-id there are two changes you have to make.
 - Replace the client-id in any html files that contain a login button. 
 - Replace the client-id in routes/handleEndpoints checkAuth function


## Using the Framework

There are a few examples included in our project/games/ directory 

ttt ( TicTacToe ) is a turn based example and rps ( RockPaperScissors ) is real time example.

A More complex example is palamedes which shows a split screen tetris like game.

### Creating a Game

#### Setting up the HTML file

The required scripts to include are shown below
You can have local copies of jquery.min.js and peer.js if you would like 
```html
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
    <script src="http://cdn.peerjs.com/0.3/peer.js"></script>

    <!-- Login -->
    <meta name="google-signin-client_id" content="INSERT_YOUR_GOOGLE_API_CLIENT_ID">
    <script src="https://apis.google.com/js/platform.js"></script> 
    <script src="project/scripts/login.js"></script>

    <!-- Game -->
    <script src="project/scripts/peerConnect.js"></script>
    <script src="project/scripts/framework.js"></script>
    <script src="project/games/YOURGAME/YOURGAME.js"></script> 
    <script src="project/scripts/abstractGame.js"></script>

    <link rel="stylesheet" type="text/css" href="project/fw.css"/>
```

The empty div tags are there for the framework to place different UI elements onto the page.
Optional tags are the chat_bar and the friendsList
```html
<body>
    <div class="login_bar">
        <h5 id="logo" class="color_orange">GG</h5>
        <ul id="nav">
            <li><div class="g-signin2" data-onsuccess="onSignIn"></div></li>
        </ul>
    </div>

    <div class="connection_bar">
        
    </div>

    <div id="YOURGAME">

    </div>

    <div class="chat_bar">
    </div>
    
    <div id="friendsList">
    </div>
</body>
```

#### Setting up the JS file

Define functions that the framework allows you to hook onto

Framework.defineHandleData (Required) : Data is sent as JSON and it is of your choice on how to organize that data

Framework.defineGame ( Required ) : Framework.defineMain game loop that defines moves

Framework.defineEndGameCleanUp ( Required ) : Display who won  and set winner the game remove moves

Framework.defineInitialState ( Required ) : Setup initial components and variables. This function is called again to start a "rematch".

Framework.defineCountDownComplete ( Optional ) : What happens in the game when Framework.countdown() is complete. 
```javascript
$(document).ready(function() {

    Framework.defineHandleData(handleData); // what to do when recieving data
    Framework.defineCountdownComplete(countdownComplete); // if game uses timer define what happens when count down over
    Framework.defineGame(game); // main game loop
    Framework.defineEndGameCleanUp(gameComplete); // what happens when game is finished
    Framework.defineInitialState(initial); // setup the initial state of the game
});
```



###Useful Framework functions

Framework.sendData({}) : pass JSON formatted data into this to send to other peer. HandleData recieves this sent data.

Framework.getGame() : gets access to game state that gets created 

Framework.getPeerId() : gets peerJS id of User

Framework.getRating() : returns rating for current user on current game

Framework.forceEndCountDown() : finishes countdown for both players


####Useful Framework.getGame() functions

Framework.getGame().initializeTurnGame() : picks a player to start as currentTurn.

Framework.getGame().currentTurn() : returns player whose turn it is. Use this to allow moves on their turn. Only use after initializeTurnGame()

Framework.getGame().setWinner(id) : define the winner of the game

Framework.getGame().setGameOver()  : ends the game updates player ratings

Framework.getGame().endTurn() : for turn based games switches currentTurn to other player

