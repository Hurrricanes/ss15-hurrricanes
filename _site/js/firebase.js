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
//  var myConnectionsRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/users/' + uid + '/connections');
  var onlineRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/online/' + uid);
  // stores the timestamp of my last disconnect (the last time I was seen online)
  var lastOnlineRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/users/' + uid + '/lastOnline');
  var connectedRef = new Firebase('https://ss15-hurrricanes.firebaseio.com/.info/connected');
  connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
      // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
      // add this device to my connections list
      // this value could contain info about the device or a timestamp too
//      var con = myConnectionsRef.push(true);
      var online = onlineRef.push(true);
      // when I disconnect, remove this device
//      con.onDisconnect().remove();
      online.onDisconnect().remove();
      // when I disconnect, update the last time I was seen online
      lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
    }
  });
}

/** End of Authentication **/

/** HackNet **/

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
      if (userSnapshot.val() !== null) {
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
      } else {
        failureCallback("Cannot find the user!");
      }
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
 * References to HackBox connections
 */
var hackBoxConnectedRef = null;
var hackBoxChangedRef = null;
var hackBoxDisconnectedRef = null;
/**
 * References to HackBox connection callback functions
 */
var hackBoxConnectedCallbackRef = null;
var hackBoxChangedCallbackRef = null;
var hackBoxDisconnectedCallbackRef = null;

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
 * Removes all listeners from HackNetChange.
 */
function offHackNetChanged() {
  offHackBoxConnected();
  offHackBoxChanged();
  offHackBoxDisconnected();
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
  hackBoxConnectedRef = rootRef.child("connected");
  hackBoxConnectedRef.on("child_added", callback, cancelCallback);
  hackBoxConnectedCallbackRef = callback;
}

/**
 * Callsback when a hackbox is changed. This is important to identify the coin
 * changes.
 * @returns {undefined}
 */
function onHackBoxChanged(callback, cancelCallback) {
  hackBoxChangedRef = rootRef.child("connected");
  hackBoxChangedRef.on("child_changed", callback, cancelCallback);
  hackBoxChangedCallbackRef = callback;
}

/**
 * Callsback when a hackbox is removed.
 * @returns {undefined}
 */
function onHackBoxDisconnected(callback, cancelCallback) {
  hackBoxDisconnectedRef = rootRef.child("connected");
  hackBoxDisconnectedRef.on("child_removed", callback, cancelCallback);
  hackBoxDisconnectedCallbackRef = callback;
}

/**
 * Removes the callback on HackBox connections.
 */
function offHackBoxConnected() {
  if (hackBoxConnectedRef !== null) {
    hackBoxConnectedRef.off("child_added", hackBoxConnectedCallbackRef);
  }
  hackBoxConnectedRef = null;
}

/**
 * Removes the callback on connected HackBox changes.
 */
function offHackBoxChanged() {
  if (hackBoxChangedRef !== null) {
    hackBoxChangedRef.off("child_changed", hackBoxChangedCallbackRef);
  }
  hackBoxChangedRef = null;
}

/**
 * Removes the callback from HackBox disconnections.
 */
function offHackBoxDisconnected() {
  if (hackBoxDisconnectedRef !== null) {
    hackBoxDisconnectedRef.off("child_removed", hackBoxDisconnectedCallbackRef);
  }
  hackBoxDisconnectedRef = null;
}

/** End of HackNet **/

/** Hack **/

/**
 * Connects this HackBox to the HackBox related to the given uid. If the connection
 * succeed, successCallback will be called passing a reference to the current
 * connection which is named a hack. If the connection fails, failureCallback will
 * be called with an error.
 * @param {type} hackedUid user id of the HackBox which is hacked
 * @param {type} successCallback
 * @param {type} failureCallback
 * @returns {undefined}
 */
function connectToHackBox(hackedUid, successCallback, failureCallback) {
  var user = getAuth();
  if (user.uid == hackedUid) {
    failureCallback("You cannot hack yourself!");
    return;
  }
  rootRef.child("connected").child(user.uid).once("value", function(userSnapshot) {
    if (userSnapshot !== null) {
      var hackRef = rootRef.child("users").child(hackedUid).child("hacks").child(user.uid);
      hackRef.onDisconnect().remove();
      hackRef.once("value", function(hackSnapshot) {
        if (hackSnapshot.val() === null) {
          hackRef.set({
            passcode: Math.round(Math.random() * userSnapshot.val().coins),
            attempts: 10
          }, function(error) {
            if (error === null) {
              var connectionRef = rootRef.child("users").child(user.uid).child("connections").child(hackedUid);
              connectionRef.onDisconnect().remove();
              connectionRef.set({
                hacked: hackedUid
              });
              successCallback();
            } else {
              failureCallback(error);
            }
          });
        }
      }, function(error) {
        failureCallback(error);
      });
    } else {
      failureCallback("This HackBox is not connected to the HackNet");
    }
  }, function(error) {
    failureCallback(error);
  });
}

/**
 * Rejisters a listener to callback when a another HackBox is connected.
 * @param {type} onNewHackCallBack is called when a new Hack is initiated
 * @param {type} onHackChangeCallBack is called when a hack changed
 * @param {type} onHackStoppedCallBack is called when a hack stopped
 */
function onHack(onNewHackCallBack, onHackChangeCallBack, onHackStoppedCallBack) {
  var user = getAuth();
  if (onNewHackCallBack !== null) {
    rootRef.child("users").child(user.uid).child("hacks").on("child_added", onNewHackCallBack);
  }
  if (onHackChangeCallBack !== null) {
    rootRef.child("users").child(user.uid).child("hacks").on("child_changed", onHackChangeCallBack);
  }
  if (onHackStoppedCallBack !== null) {
    rootRef.child("users").child(user.uid).child("hacks").on("child_removed", onHackStoppedCallBack);
  }
}

/**
 * Gives a callback when a connection made from this HackBox to another.
 */
function onConnection(onNewConnection, onConnectionChanged, onConnectionClosed) {
  var user = getAuth();
  if (onNewConnection !== null) {
    rootRef.child("users").child(user.uid).child("connections").on("child_added", onNewConnection);
  }
  if (onConnectionChanged !== null) {
    rootRef.child("users").child(user.uid).child("connections").on("child_changed", onConnectionChanged);
  }
  if (onConnectionClosed !== null) {
    rootRef.child("users").child(user.uid).child("connections").on("child_removed", onConnectionClosed);
  }
}

/**
 * Cracks a passcode of a connected HackBox
 */
function crackPasscode(passcode, hackedUid, successCallback, failureCallback) {
  var user = getAuth();
  var hackRef = rootRef.child("users").child(hackedUid).child("hacks").child(user.uid);
  hackRef.once("value", function(hackSnapshot) {
    var hack = hackSnapshot.val();
    if (user.uid == hackRef.key()) {
      if (passcode == hack.passcode) {
        // reduce money of hacked
        var coinDiff = 0;
        rootRef.child("connected").child(hackedUid).child("coins").transaction(function(currentCoins) {
          coinDiff = Math.round(currentCoins * hack.attempts / 100);
          return currentCoins - coinDiff;
        }, function(error, commited, coins) {
          // Update the users branch as well
          rootRef.child("users").child(hackedUid).update({coins: coins.val()});
          hackedCoins = coins;
          // increase money of hacker
          rootRef.child("connected").child(user.uid).child("coins").transaction(function(currentCoins) {
            return currentCoins + coinDiff;
          }, function(error, commited, coins) {
            rootRef.child("users").child(user.uid).update({coins: coins.val()});
            if (error) {
              failureCallback(error);
            } else {
              successCallback();
            }
          });
        });
        // remove hack
        hackRef.remove();
        // remove connection
        rootRef.child("users").child(user.uid).child("connections").child(hackedUid).removed();
      } else if (hack.attempts == 1) {
        hackRef.remove();
        rootRef.child("users").child(user.uid).child("connections").child(hackedUid).remove();
        failureCallback("You attemped max number of time!");
      } else {
        hackRef.child("attempts").transaction(function(currentAttempts) {
          if (currentAttempts == 1) {
            hackRef.remove();
            rootRef.child("users").child(user.uid).child("connections").child(hackedUid).remove();
            failureCallback("You attemped max number of time!");
            return;
          } else {
            return currentAttempts - 1;
          }
        }, function(error, commited, attempts) {
          if (commited) { // If the hack is not removed due to no attempts
            if (hack.passcode < passcode) {
              failureCallback("Passcode is less than " + passcode + ".");
            } else {
              failureCallback("Passcode is greater than " + passcode + ".");
            }
          }
        });
      }
    } else {
      failureCallback("You are not the owner of this hack!");
    }
  });
}