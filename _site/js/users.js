$(function () {

    function loginModel() {
        var self = this;
        onAuth(authDataCallback);
        self.loginGithub = function () {
            loginViaGitHub(function () {}, function () {});
        }
        self.loginTwitter = function () {
            loginViaTwitter(function () {}, function () {});
        }
        self.loginGoogle = function () {
            loginViaGoogle();
        }
        self.loginFb = function () {
            loginViaFacebook(function () {}, function () {});
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

