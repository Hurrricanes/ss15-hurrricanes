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
function loginViaTwitter(successCallback, failureCallback) {
  login("twitter", successCallback, failureCallback);
}

// Authorizes users with GitHub
function loginViaGitHub(successCallback, failureCallback) {
  login("github", successCallback, failureCallback);
}

// Authorizes users with Google
function loginViaGoogle(successCallback, failureCallback) {
  login("google", successCallback, failureCallback);
}

// Authorizes users with Facebook
function loginViaFacebook(successCallback, failureCallback) {
  login("facebook", successCallback, failureCallback);
}

// Authorizes users with the given provider
function login(provider, successCallback, failureCallback) {
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
            failureCallback(error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
            successCallback(authData);
          }
        });
      }
    } else {
      console.log("Authenticated successfully with payload:", authData);
      successCallback(authData);
    }
  }, {
    remember: "sessionOnly"
  });
}

// Logs out the user
function logout() {
  disconnect();
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
      if (snapshot.val() === null) {
        // If the user exists we update the data.
        rootRef.child("users").child(authData.uid).update({
          provider: authData.provider,
          displayName: authData[authData.provider].displayName
        });
      } else {
        // otherwise we add a new user
        rootRef.child("users").child(authData.uid).set({
          provider: authData.provider,
          displayName: authData[authData.provider].displayName,
          coins: 1000
        });
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

/** End of Authentication **/

/** Game **/

/**
 * Connects the user to HackNet
 * @param {type} successCallback
 * @param {type} failureCallback
 * @returns {undefined}
 */
function connect(successCallback, failureCallback) {
  var authData = getAuth();
  if (authData !== null) {
    rootRef.child("users").child(authData.uid).once("value", function(userSnapshot) {
      var connectedRef = rootRef.child("connected").child(authData.uid);
      var data = {};
      data["coins"] = userSnapshot.val()["coins"];
      if (typeof authData[authData.provider].displayName != "undefined") {
        data["displayName"] = authData[authData.provider].displayName;
      }
      if (typeof authData[authData.provider].username != "undefined") {
        data["username"] = authData[authData.provider].username;
      }
      connectedRef.set(data);
      connectedRef.onDisconnect().remove();
      successCallback();
    }, function(error) {
      failureCallback(error);
    });
  } else {
    failureCallback("Authentication failed!");
  }
}

/**
 * Disconnects the user from HackNet
 * @returns {undefined}
 */
function disconnect(callback) {
  var user = getAuth();
  if (user !== null) {
    var connectedRef = rootRef.child("connected");
    connectedRef.child(user.uid).remove(callback);
  }
}

/**
 * Callsback when the HackNet changes: a HackBox connected, HackBox changed (eg: coins),
 * HackBox disconnected.
 * @param {type} hackBoxConnectedCallback will be called when a HackBox is connected to the HackNet
 * @param {type} hackBoxChangedCallback will be called when a HackBox which is connected to the HackNet is changed
 * @param {type} hackBoxDisconnectedCallback will be called when a HackBox is disconnected to the HackNet
 * @param {type} hackBoxConnectedCancelCallback will be called when the registration for the hackBoxConnected event is failed
 * @param {type} hackBoxChangedCancelCallback will be called when the registration for the hackBoxChanged event is failed
 * @param {type} hackBoxDisconnectedCancelCallback will be called when the registration for the hackBoxDisconnected event is failed
 * @returns {undefined}
 */
function onHackNetChanged(hackBoxConnectedCallback, hackBoxChangedCallback, hackBoxDisconnectedCallback,
  hackBoxConnectedCancelCallback, hackBoxChangedCancelCallback, hackBoxDisconnectedCancelCallback) {
  onHackBoxConnected(hackBoxConnectedCallback, hackBoxConnectedCancelCallback);
  onHackBoxChanged(hackBoxChangedCallback, hackBoxChangedCancelCallback);
  onHackBoxDisconnected(hackBoxDisconnectedCallback, hackBoxDisconnectedCancelCallback);
}

/**
 * Callsback when a new HackBox is connected to the network. When the
 * registering happens the first time, it will return all the HackBoxes one by
 * one.
 * @param {type} callback
 * @param {type} cancelCallback is called if the registration is cancelled
 * @returns {undefined}
 */
function onHackBoxConnected(callback, cancelCallback) {
  rootRef.child("connected").on("child_added", callback, cancelCallback);
}

/**
 * Callsback when a hackbox is changed. This is important to identify the coin
 * changes.
 * @returns {undefined}
 */
function onHackBoxChanged(callback, cancelCallback) {
  rootRef.child("connected").on("child_changed", callback, cancelCallback);
}

/**
 * Callsback when a hackbox is removed.
 * @returns {undefined}
 */
function onHackBoxDisconnected(callback, cancelCallback) {
  rootRef.child("connected").on("child_removed", callback, cancelCallback);
}