$(function () {
	function HackboxViewModel () {
		var self = this;
		self.isLoggedIn = ko.observable(false);

		// Register the callback to be fired every time auth state changes
		var user = getAuth();

		if (user == undefined || user == null) {
			window.location.replace("login.html");
			self.isLoggedIn(false);
		} else {
			self.isLoggedIn(true);
		}

		self.signout = function () {
			logout();
			window.location.replace("login.html");
		}
	}
	ko.applyBindings(new HackboxViewModel());
	
});