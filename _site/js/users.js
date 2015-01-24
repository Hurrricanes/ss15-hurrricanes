$(document).ready(function () {
    $("#loginGithub").click(function () {
        loginViaGitHub();
    });

    $("#loginTwitter").click(function () {
        loginViaTwitter();
    });

    $("#loginGoogle").click(function () {
        loginViaGoogle();
    });
    $("#loginFb").click(function () {
        loginViaFacebook();
    });

    $("#logout").click(function () {
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
        $("#loginFb").hide();
        var url = "../_site/";    
        window.location.replace(url);
       // $("#logout").show();
    } else {
        $("#loginGithub").show();
        $("#loginTwitter").show();
        $("#loginGoogle").show();
        $("#loginFb").show();
       // $("#logout").hide();
    }
}
