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

// Authorizes users with Twitter
function loginViaTwitter() {
  login("twitter");
}

// Authorizes users with GitHub
function loginViaGitHub() {
  login("github");
}

// Authorizes users with Google
function loginViaGoogle() {
  login("google");
}

// Authorizes users with Facebook
function loginViaFacebook() {
  login("facebook");
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
  }, {
    remember: "sessionOnly"
  });
}

// Logs out the user
function logout() {
  rootRef.unauth();
}

function getAuth() {
  var authData = rootRef.getAuth();
  if (authData) {
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    console.log("User is logged out");
  }
  return authData;
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

    manageConnection(authData.uid);
  } else {
    console.log("User is logged out");
  }
}

// Manages the connection status
function manageConnection(uid) {
  // since I can connect from multiple devices or browser tabs, we store each connection instance separately
  // any time that connectionsRef's value is null (i.e. has no children) I am offline
  var myConnectionsRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/users/' + uid + '/connections');
  var onlineRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/online/' + uid);
  // stores the timestamp of my last disconnect (the last time I was seen online)
  var lastOnlineRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/users/' + uid + '/lastOnline');
  var connectedRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/.info/connected');
  connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
      // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
      // add this device to my connections list
      // this value could contain info about the device or a timestamp too
      var con = myConnectionsRef.push(true);
      var online = onlineRef.push(true);
      // when I disconnect, remove this device
      con.onDisconnect().remove();
      online.onDisconnect().remove();
      // when I disconnect, update the last time I was seen online
      lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
    }
  });
}