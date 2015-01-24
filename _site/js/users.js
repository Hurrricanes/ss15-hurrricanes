$(document).ready(function() {
  $("#login").click(function() {
    loginViaGitHub();
  });

  $("#logout").click(function() {
    logout();
  });

  // Register the callback to be fired every time auth state changes
  onAuth(authDataCallback);
});

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
    $("#login").hide();
    $("#logout").show();
  } else {
    $("#login").show();
    $("#logout").hide();
  }
}