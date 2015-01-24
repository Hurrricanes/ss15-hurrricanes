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
      console.log("Login Failed!", error);
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
    $("#login").hide();
    $("#logout").show();
  } else {
    console.log("User is logged out");
    $("#login").show();
    $("#logout").hide();
  }
}
