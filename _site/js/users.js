$(function () {

    function loginModel() {
        var self = this;
        onAuth(authDataCallback);
        self.loginGithub = function () {
            loginViaGitHub();
        }
        self.loginTwitter = function () {
            loginViaTwitter();
        }
        self.loginGoogle = function () {
            loginViaGoogle();
        }
        self.loginFb = function () {
            loginViaFacebook();
        }


        function authDataCallback(authData) {
            if (authData) {
                var url = "../_site/";
                window.location.replace(url);

            }
        }

    }
    ko.applyBindings(new loginModel());
});

