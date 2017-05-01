// translate number into string
function getResult(gameResult) {
	var selector;
	if (gameResult == 1) {
        selector = "win";
    }
    else if (gameResult == 0) {
        selector = "loss";
    }
    else {
        selector = "tie";
    }
	return selector;	
}

// used to calculate opponent's perspective. 
function invertGameResult(gameResult) {
	var invert_gameResult;
	if (gameResult == 1) {
        invert_gameResult = 0;
    }
    else if (gameResult == 0) {
        invert_gameResult = 1;
    }
    else
        invert_gameResult = .5;
	return invert_gameResult;
}

// Modifies a user's game stats and if its their first time playing inserts the stats
// for the new game into their document.  
function updateStats(confirmed_id, gameResult, gameId, connection, r, req, res) {	
	query = "{\"" + gameId + "\":{\"win\":0,\"tie\":0,\"loss\":0,\"rating\":1000}}";	
	query = JSON.parse(query);
	r.table("users").get(confirmed_id).hasFields(gameId).run(connection,
		function(err, cursor) {
			if (err) throw err;
			if (cursor == false) { // If their first time playing they dont have a entry for wins/loss/tie/rating 
				r.table("users").get(confirmed_id).update(query).run( connection,
					function(err,cursor) {
						if(err) throw err;
						// update win/tie/loss
						incrementWTLStats(confirmed_id, gameResult, gameId, connection, r, req, res);
						updateRating(confirmed_id, gameResult, gameId, connection, r, req, res);
					}
				);
			}
			else { // not first time playing update their stats
				incrementWTLStats(confirmed_id, gameResult, gameId, connection, r, req, res);
				updateRating(confirmed_id, gameResult, gameId, connection, r, req, res);
			}
		}
	);
}

// updates win/tie/loss depending on outcome of game
function incrementWTLStats(confirmed_id, gameResult, gameId, connection, r, req, res) {
	var selector = getResult(gameResult);
	r.table('users').get(confirmed_id)(gameId)(selector).run(connection,
		function(err, cursor) {
			if (err) throw err;
			// build query to update correct value
			var query = "{\"" + gameId + "\":{\"" + selector + "\":" + parseInt(cursor + 1) + "}}";
    		query = JSON.parse(query);
			r.table('users').get(confirmed_id).update(query).run(connection,
        		function(err, cursor) {
            		if (err) throw err;
        		}
    		);
		}
	);
}

// calculates ratings for both clients and updates the current user 
// but sends rating gain/loss for both players back to the client. 
function updateRating(confirmed_id, gameResult, gameId, connection, r,req,res) {
	// current user's rating gain/loss
	var ratingGain = calculateRatingGain(req.body.myRating, req.body.theirRating, gameResult);
	var invert_gameResult = invertGameResult(gameResult);
	r.table("users").get(confirmed_id)(gameId)("rating").run(connection,
		function( err, cursor) {
			if (err) throw err;
			// update rating
			var query = "{\"" + gameId + "\":{\"rating\":" + parseInt(cursor + ratingGain) + "}}";
			query = JSON.parse(query);
			r.table('users').get(confirmed_id).update(query).run(connection,
    	    	function(err, cursor) {
        	    	if (err) throw err;
					// send back to the client the rating gain/loss for both clients.
            		var theirRatingGain = calculateRatingGain(req.body.theirRating, req.body.myRating, invert_gameResult);
            		ratingResults = ({"myRatingGain":ratingGain,"theirRatingGain":theirRatingGain, "result" : gameResult});
            		res.send(ratingResults);
        		}
    		);
		}
	);
}

// Calculates what to update rating by based on outcome of game and both players rating
//  https://github.com/moroshko/elo.js/blob/master/elo.js
function calculateRatingGain(myRating, opponentRating, myGameResult) {
    if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
      	return null;
    }
   	var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));
  	var result = Math.round(32 * (myGameResult - myChanceToWin));
	if (parseInt(myRating) + result < 1) {
		return 0;
	}
	else {
		return result;
	}
}
 
// pass info on to be updated
function calculateAccountUpdates(confirmed_id, req, res, connection, r) {
	calculateRating(confirmed_id, req, res, connection, r);
}

// take rating info and pass it onto be updated
function calculateRating(confirmed_id, req, res, connection, r) {
	var gameResult = parseFloat(req.body.result);
	var gameId = req.body.gameId;
	updateStats(confirmed_id, gameResult, gameId, connection, r, req, res);	
}

// Object that is created to allow the node.js function to call these functions
module.exports = {

// Verify that user is logged in with Google. If not logged in return null otherwise return userid.
checkAuth: function(req) {
    var token = req.body.id;
    // http://stackoverflow.com/questions/34833820/do-we-need-to-hide-the-google-oauth-client-id
	// https://developers.google.com/identity/protocols/OAuth2UserAgent
	// https://developers.google.com/identity/protocols/OAuth2
	
    var CLIENT_ID = "585757099412-82kcg563ohunnb0t4kmq8el85ak8n3rp.apps.googleusercontent.com";
    var GoogleAuth = require('google-auth-library');
    var auth = new GoogleAuth;
    var client = new auth.OAuth2(CLIENT_ID, '', '');
	var userid = null;
    client.verifyIdToken(
        token,
        CLIENT_ID,
        function(e, login) {
            var payload = login.getPayload();
            userid = payload['sub'];
            //https://developers.google.com/identity/sign-in/web/backend-auth
        }
    );
    console.log("Verify: " + userid);
	// return null if verifcation false
    return userid;
},

// If login fails due to token being null on some initial attemps reattempt.
retryLogin: function(req,res,connection,r,limit) {
	setTimeout(function() {module.exports.login(req,res,connection,r, limit); }, 100);
},

// On login return user's document 
login: function(req,res,connection,r, limit) {
	confirmed_id = module.exports.checkAuth(req);

	// if auth fails try again up to 10 times otherwise fail
	if (confirmed_id == null && limit < 10) {
		limit = limit + 1;
		module.exports.retryLogin(req,res,connection,r, limit);		
	}
	
	if (!(limit < 10)) {
		console.log("Failed to verify login on server within 10 tries.");
	}

	// If login is successful retrieve and return user's document
	if (confirmed_id != null) {
		r.table('users').filter({"id":confirmed_id}).run(connection,
           	function(err, cursor) {
               	if (err) throw err;
               	cursor.toArray(function(err, result) {
                   	if (err) throw err;
                   	if (result.length == 0) {
						var userObj = {"id":confirmed_id}
                       	r.table('users').insert([userObj]).run(connection, function(err, result) {
                           	if (err) throw err;
                           	console.log(JSON.stringify(result, null, 2));
                           	res.send( userObj );
                       	})
                   	}
                   	else {
                       	res.send(result);
                   	}
               	});
          	}
    	);
	}
},

// If add friend fails due to token being null which happens sometimes on initial attempt 
retryAddFriend: function(req,res,connection,r,limit) {
    setTimeout(function() {module.exports.addFriend(req,res,connection,r, limit); }, 100);
},

// For specified user add friend to user's document
addFriend: function(req,res,connection,r,limit) {
	var confirmed_id = module.exports.checkAuth(req);
	
	if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
	    module.exports.retryAddFriend(req,res,connection,r, limit);
	}
	if (!(limit < 10)) {
        console.log("Failed to add friend on server within 10 tries.");
    }

	// if verification is successful
	if ( confirmed_id != null) {
		r.table("users").filter({"username":req.body.friend}).run(connection,
        function(err, cursor) {
            if (err) throw err;
            cursor.toArray(function(err, result) {
                console.log(result);
                if (result.length != 0) {
		// Confirm that username is a valid username and that the user isnt currently added	
		r.table('users').get(confirmed_id)("friends").filter({"username":req.body.friend}).run(connection,
			function(err, cursor) {
				if (err) throw err;
				cursor.toArray(function(err,result) {
					if (err) throw err;
					if (result.length == 0) {
         				r.table('users').get(confirmed_id).update({"friends":r.row("friends").append({"username":req.body.friend,"chatId":"0"})}).run(connection,
            				function(err, cursor) {
                				if (err) throw err;
                				res.send({"addFriend":true, "username":req.body.friend});
            				}
         				);
					}
					else  {
						res.send({"addFriend":false, "username":req.body.friend});
					} 
				});
			}
		);
		}})});
    }
},

// if login token is null which happens on initial attempt 
retryDeleteFriend: function(req,res,connection,r,limit) {
    // Can improve this similar to enterRankedConnectionQueue
    setTimeout(function() {module.exports.deleteFriend(req,res,connection,r, limit); }, 100);
},

// remove a friend from a user's document
deleteFriend: function(req,res,connection,r,limit) {
    var confirmed_id = module.exports.checkAuth(req);

    if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retryDeleteFriend(req,res,connection,r, limit);
    }
    if (!(limit < 10)) {
        console.log("Failed to delete friend on server within 10 tries.");
    }
	
	// if verification is successful
	if ( confirmed_id != null) { // update friend document to all but the delete friend
		r.table("users").get(confirmed_id).update(function(row) {
			return {
				"friends": row("friends").filter(function(item) { return item("username").ne(req.body.friend) } )
			}
		}).run(connection, function(err, cursor) {
				if (err) throw err;
				console.log(cursor);
				res.send({"deleteFriend":true,"username":req.body.friend});
			});
	}
},

// if login token is null which happens on initial attempt
retryGetFriends: function(req,res,connection,r,limit) {
    // Can improve this similar to enterRankedConnectionQueue
    setTimeout(function() {module.exports.getFriends(req,res,connection,r, limit); }, 100);
},

// return JSON document of friends for current user
getFriends: function(req,res,connection,r,limit) {
    var confirmed_id = module.exports.checkAuth(req);

    if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retryGetFriends(req,res,connection,r, limit);
    }
    if (!(limit < 10)) {
        console.log("Failed to get friends on server within 10 tries.");
    }

	// if verification is successful
    if ( confirmed_id != null) {
        r.table('users').get(confirmed_id)('friends').run(connection,
            function(err, cursor) {
                if (err) throw err;
                res.send(cursor);
            }
         );
    }
},

// if login token is null which happens on initial attempt
retrySetChatId: function(req,res,connection,r,limit) {
    // Can improve this similar to enterRankedConnectionQueue
    setTimeout(function() {module.exports.setChatId(req,res,connection,r, limit); }, 100);
},

// when user is created a chatId it is updated in the database so that friends can chat with them
setChatId: function(req,res,connection,r,limit) {
    var confirmed_id = module.exports.checkAuth(req);
    //console.log(req.body.username);
    if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retrySetChatId(req,res,connection,r, limit);
    }
    if (!(limit < 10)) {
        console.log("Failed to get friends on server within 10 tries.");
    }

	// if verification is successful
    if ( confirmed_id != null) {
        r.table('users').get(confirmed_id).update({"chatId":req.body.chatId}).run(connection,
            function(err, cursor) {
                if (err) throw err;
                res.send({"chatId":req.body.chatId});
            }
         );
    }
},

// if login token is null which happens on initial attemp
retryGetChatId: function(req,res,connection,r,limit) {
    // Can improve this similar to enterRankedConnectionQueue
    setTimeout(function() {module.exports.getChatId(req,res,connection,r, limit); }, 100);
},

// retrieves most recent chat id for a specified username
getChatId: function(req,res,connection,r,limit) {
    var confirmed_id = module.exports.checkAuth(req);
	console.log(req.body.username);
    if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retryGetChatId(req,res,connection,r, limit);
    }
    if (!(limit < 10)) {
        console.log("Failed to get friends on server within 10 tries.");
    }

	// if verification is successful
    if ( confirmed_id != null) {
        r.table('users').filter({"username":req.body.username}).pluck('chatId').run(connection,
            function(err, cursor) {
                if (err) throw err;
                cursor.toArray(function(err, result) {
                    if (err) throw err;
					console.log(result[0]);
					res.send(result[0]);
                });
            }
         );
    }
},

// for initial login of user set their username
setupUser: function(req,res,connection,r) {
	var confirmed_id = module.exports.checkAuth(req);

	// if verification successful 
	// return JSON document indicating if username set was valid or not
	if ( confirmed_id != null) {
		r.table('users').filter({"username":req.body.username}).run(connection,
            function(err, cursor) {
                if (err) throw err;
                cursor.toArray(function(err,result) {
                    if (err) throw err;
                    if (result.length == 0) {
    					r.table('users').get(confirmed_id).update({"username":req.body.username,"friends":[]}).run(connection,
            				function(err, cursor) {
                				if (err) throw err;
                				console.log(req.body.username);
								res.send({"setUsername":true, "username":req.body.username});
							}
						);
            		}
					else res.send({"setUsername": false});			
				});
			}
		);		
	};
    console.log("New Username: " + req.body.username);
},

// updates win/loss/tie/rating for a specified user and game
updateScore: function(req,res,connection,r) {
	var confirmed_id = module.exports.checkAuth(req);
		
	if ( confirmed_id != null) {
		calculateAccountUpdates(confirmed_id, req, res,connection, r);
	}
    console.log("Updated Score for: " + confirmed_id);
},

// if login token is null which happens on initial attempt
retryGetRating: function(req,res,connection,r,limit) {
	// Can improve this similar to enterRankedConnectionQueue
    setTimeout(function() {module.exports.getRating(req,res,connection,r, limit); }, 100);
},

// returns rating of specified user 
// if first time on the current game return default rating of 1000
getRating: function(req,res,connection,r, limit) {
	var confirmed_id = module.exports.checkAuth(req);
	var gameId = req.body.gameId;	
	if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retryGetRating(req,res,connection,r, limit);
    }

    if (!(limit < 10)) {
        console.log("Failed to retrieve rating on server within 10 tries.");
    }
	// if verification is successful
	if ( confirmed_id != null) {
		r.table('users').get(confirmed_id).hasFields(gameId).run(connection,
			function(err, cursor) {
				if (err) throw err;
				if (cursor == true) {
					r.table('users').get(confirmed_id)(gameId)("rating").run(connection,
                		function(err, cursor) {
                    		if (err) throw err;
							res.send({"rating":cursor});
                		}
    				);
				}
				else res.send({"rating":1000});
			}
			);
	}
},

// if login token is null which happens on initial attempt
retryForfiet: function(req,res,connection,r,limit) {
	setTimeout(function() {module.exports.forfiet(req,res,connection,r,limit);},100);
},

// cause user to lose more points for leaving the game early
forfiet: function(req,res,connection,r,limit) {
	console.log("FORFIET");
	var confirmed_id = module.exports.checkAuth(req);
	var gameId = req.body.gameId;
	if (confirmed_id == null && limit < 10) {
        limit = limit + 1;
        module.exports.retryForfiet(req,res,connection,r, limit);
    }

    if (!(limit < 10)) {
        console.log("Failed to process forfiet on server within 10 tries.");
    }

	// if verification is successful
 	if ( confirmed_id != null) {
        r.table('users').get(confirmed_id).hasFields(gameId).run(connection,
            function(err, cursor) {
                if (err) throw err;
                if (cursor == true) {
					r.table("users").get(confirmed_id)(gameId)("rating").run(connection,
        				function( err, cursor) {
            				if (err) throw err;			
							var eloLoss = 50;		
							if (parseInt(cursor) - eloLoss < 1) {
								eloLost = parseInt(cursor);
							}
							var query = "{\"" + gameId + "\":{\"rating\":" + parseInt(cursor - eloLoss) + "}}";
							query = JSON.parse(query);
						
                    		r.table('users').get(confirmed_id).update(query).run(connection,
                        		function(err, cursor) {
                            		if (err) throw err;
                            		res.send({"rating":cursor});
                        		}
                    		);
						}
					);
                }
            }
    	);
    }
}
}
