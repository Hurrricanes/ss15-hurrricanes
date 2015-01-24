var rootRef;

$(document).ready(function() {
  // making a rootReference to the firebase
  rootRef = new Firebase("https://ss15-hurrricanes.firebaseio.com");

  // Register the callback to be fired every time auth state changes
  rootRef.onAuth(authenticationCallback);
});

/** Authentication **/

// Registers a callback function to authentication changes
function onAuth(onAuthCallback) {
  rootRef.onAuth(onAuthCallback);
}

function loginViaTwitter() {
  login("github");
}

// Authorizes users with GitHub
function loginViaGitHub() {
  login("github");
}

// Authorizes users with the given provider
function login(provider) {
  rootRef.authWithOAuthPopup(provider, function(error, authData) {
    if (error) {
      console.log("Login Failed via popup!", error);
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        // fall-back to browser redirects, and pick up the session
        // automatically when we come back to the origin page
        console.log("Trying login via redirect!");
        rootRef.authWithOAuthRedirect(provider, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
            return null;
          } else {
            console.log("Authenticated successfully with payload:", authData);
            return authData;
          }
        });
      }
    } else {
      console.log("Authenticated successfully with payload:", authData);
      return authData;
    }
  });
}

// Logs out the user
function logout() {
  rootRef.unauth();
}

// Create a callback which logs the current auth state
function authenticationCallback(authData) {
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);

    // Check whether the user exixsts.
    rootRef.child("users").child(authData.uid).once("value", function(snapshot) {
      if (snapshot.exists()) {
        // If the user exists we update the data.
        rootRef.child("users").child(authData.uid).update(authData);
      } else {
        // otherwise we add a new user
        rootRef.child("users").child(authData.uid).set(authData);
        rootRef.child("users").child(authData.uid).child("gamedata/coins").set(1000);
      }
    });
  } else {
    console.log("User is logged out");
  }
}