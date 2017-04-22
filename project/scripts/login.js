
$(document).ready(function() {
	$("#nav").prepend('<li><button class="g-signout2" >Sign out</button></li>');	
	$(".g-signout2").on("click", signOut);
});

/**
 * Handle successful sign-ins.
 */
var onSuccess = function(user) {
    console.log('Signed in as ' + user.getBasicProfile().getName());
 };

/**
 * Handle sign-in failures.
 */
var onFailure = function(error) {
    console.log(error);
};


function onSignIn(googleUser) {
	// Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    //console.log("ID: " + profile.getId()); // Don't send this directly to your server
    console.log('Full Name: ' + profile.getName());
    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    //console.log("ID Token: " + id_token);
	$.ajax({
		type: "POST",
		url: "/login",
		data: {"id" : id_token},
		success: function(data) {
			
			if (data[0] != undefined) { 
				displayUsername(data[0].username);
				displayFriends(id_token,data[0].friends);
			}
			else { 
				setUsername(id_token, profile);
				displayFriends(id_token,data[0].friends);
			}
		}
	});
};
function clearPage() {
	$("#display_name").html("");
    $("#gameList").html("");
    $("#friendsList").html("");
    $("#gameLinks").html("");

}

function signOut() {
   	var auth2 = gapi.auth2.getAuthInstance();
	clearPage();
   	auth2.signOut().then(function () {
   		console.log('User signed out.');
   	});
	if (Framework != undefined) Framework.onLogout();	
	auth2.disconnect();
			
}


function setUsername(id_token, profile) {
	var username = prompt("Please select a username",
            profile.getName());
	$.ajax({
		type: "POST",
		url: "/setupUser",
		data: { "id": id_token, "gu" : "verify", "username" : username},
		success: function(data) {
			if (data.setUsername == true) {
				displayUsername(data.username);
				displayFriends(id_token,undefined);
			}
			else {
				setUsername(id_token, profile);
			}
		}
	});

}

function displayFriends(id_token,friends) {
	
	if ($("#friendsList").length == 1) { 
     	$("#friendsList").append($("<br>"));
		$("#friendsList").append("Friends");
		$("#friendsList").append("<br>");
		$("#friendsList").append("<input type='text' id='addFriend' placeholder='Add friend by username.'>");
		$("#addFriend").keypress(function (e) {

        	if (e.which == 13) { // error if not logged in change to only trigger a
            	var friend = $("#addFriend").val();
            	$("#addFriend").val("");

            	$.ajax({
                	type: "POST",
                	url: "/addFriend",
                	data : {"id": id_token, "friend": friend},
                	success : function(data) {
                    	console.log(data);
						if (data.addFriend == true) {
             				$("#friendsList").append($("<br>"));
							$("#friendsList").append(data.username);
						}
                	}

            	})
        	}
    	});	
		$.each(friends, function( value ) {
			$("#friendsList").append($("<br>"));
		    $("#friendsList").append(friends[value].username);
		});

		$("#friendsList").append("<input type='text' id='delFriend' placeholder='Delete friend by username.'>");
		$("#delFriend").keypress(function (e) {

            if (e.which == 13) { // error if not logged in change to only trigger a
                var friend = $("#delFriend").val();
                $("#delFriend").val("");

                $.ajax({
                    type: "POST",
                    url: "/deleteFriend",
                    data : {"id": id_token, "friend": friend},
                    success : function(data) {
                        console.log(data);
                        if (data.deleteFriend == true) {
                            $("#friendsList").append($("<br>"));
                            $("#friendsList").append("deleted " + data.username);
                        }
                    }

                })
            }
        });
	}

}

function displayUsername(username) {
    if (username != undefined)
    {
		if ($("#display_name").val() == undefined || $("#display_name").val() == 0) {
    		$("#nav").prepend("<li id='display_name' class='color_orange'>" + username + "</li>");
		}
    }
	else {
		console.log("Login Data undefined");
	}

	if (typeof(Framework) == "undefined") {
		linkGames();
	}
	if (typeof(Framework) != "undefined") {
		if (isFrameworkSetup == false) {
			FrameworkInit();
		}
	}
	
}

// Restrict so that on displays on homepage
function linkGames() {
    $.getJSON("/project/game-config.json", function(json) {
        json.games.forEach(function(val) {
			$("#gameLinks").append("<a href=\"" + val.name + "\">" + val.name + "<\a><br>");
        });
    })
}


