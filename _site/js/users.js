$(document).ready(function() {
  $("#loginGithub").click(function() {
    loginViaFacebook();
  });

 
  
   $("#loginTwitter").click(function() {
    loginViaTwitter();
  });
  
  $("#loginGoogle").click(function() {
    loginViaGoogle();
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
    $("#loginGithub").hide();
    $("#loginTwitter").hide();
    $("#loginGoogle").hide();
    $("#logout").show();
  } else {
    $("#loginGithub").show();
     $("#loginTwitter").show();
       $("#loginGoogle").show();
    $("#logout").hide();
  }
}
