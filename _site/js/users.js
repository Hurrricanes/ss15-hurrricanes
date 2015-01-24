$(document).ready(function() {
  $("#loginGithub").click(function() {
    loginViaGitHub();
  });

  $("#logoutGithub").click(function() {
    logout();
  });

  // Register the callback to be fired every time auth state changes
  onAuth(authDataCallback);
});

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
    $("#loginGithub").hide();
    $("#logoutGithub").show();
  } else {
    $("#loginGithub").show();
    $("#logoutGithub").hide();
  }
}
