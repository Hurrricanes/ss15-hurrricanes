$(document).ready(function() {
<<<<<<< HEAD
  // making a reference to the firebase
  ref = new Firebase("https://ss15-hurrricanes.firebaseio.com");

  // Register the callback to be fired every time auth state changes
  ref.onAuth(authDataCallback);

});
  $("#loginGithub").click(function() {
    login();
=======
  $("#login").click(function() {
    loginViaGitHub();
>>>>>>> cad599c1e4e019f9db4890b9c49bfcdf0ceaf097
  });

  $("#logoutGithub").click(function() {
    logout();
  });
<<<<<<< HEAD
  
    $("#loginTwitter").click(function() {
    login();
  });

  $("#logoutTwitter").click(function() {
    logout();
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
=======
>>>>>>> cad599c1e4e019f9db4890b9c49bfcdf0ceaf097

  // Register the callback to be fired every time auth state changes
  onAuth(authDataCallback);
});

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
<<<<<<< HEAD
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
    
    $("#loginGithub").hide();
    $("#logoutGithub").show();
  } else {
    console.log("User is logged out");
    $("#loginGithub").show();
    $("#logoutGithub").hide();
=======
    $("#login").hide();
    $("#logout").show();
  } else {
    $("#login").show();
    $("#logout").hide();
>>>>>>> cad599c1e4e019f9db4890b9c49bfcdf0ceaf097
  }
}
