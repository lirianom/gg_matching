
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
			}
			else { 
				setUsername(id_token, profile);
			}
		}
	});
};

function signOut() {
   	var auth2 = gapi.auth2.getAuthInstance();
	$("#display_name").remove();
	$("#gameLinks").html("");
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
			displayUsername(data);
		}
	});

}

function displayUsername(username) {
    if (username != undefined)
    {
		if ($("#display_name").length != 1) {
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
