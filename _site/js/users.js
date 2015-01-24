/**
 * Manges the things of users like authentication.
 * Login and logout buttons/links/whatever must have the id "login" and "logout"
 * to function it correctly.
 * JQuery and Firebase js' should be added.
 */

var ref;

$(document).ready(function() {
  // making a reference to the firebase
  ref = new Firebase("https://ss15-hurrricanes.firebaseio.com");

  // Register the callback to be fired every time auth state changes
  ref.onAuth(authDataCallback);

  $("#login").click(function() {
    login();
  });

  $("#logout").click(function() {
    logout();
  });
});

// Authorizes users with GitHub authentication
function login() {
  ref.authWithOAuthPopup("github", function(error, authData) {
    if (error) {
      console.log("Login Failed via popup!", error);
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        // fall-back to browser redirects, and pick up the session
        // automatically when we come back to the origin page
        console.log("Trying login via redirect!");
        ref.authWithOAuthRedirect("github", function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
          }
        });
      }
    } else {
      console.log("Authenticated successfully with payload:", authData);
    }
  });
}

// Logs out the user
function logout() {
  ref.unauth();
}

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
    
    // Check whether the user exixsts.
    ref.child("users").child(authData.uid).once("value", function (snapshot) {
      if (snapshot.exists()) {
        // If the user exists we update the data.
        ref.child("users").child(authData.uid).update(authData);
      } else {
        // otherwise we add a new user
        ref.child("users").child(authData.uid).set(authData);
        ref.child("users").child(authData.uid).child("gamedata/coins").set(1000);
      }
    });
    
    $("#login").hide();
    $("#logout").show();
  } else {
    console.log("User is logged out");
    $("#login").show();
    $("#logout").hide();
  }
}
