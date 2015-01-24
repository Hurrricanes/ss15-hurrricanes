$(function () {
	function HackboxViewModel () {
		var self = this;
		self.isLoggedIn = ko.observable(false);
		self.isConnected = ko.observable(false);

		// Register the callback to be fired every time auth state changes
		var user = getAuth();

		if (user == undefined || user == null) {
			window.location.replace("login.html");
			self.isLoggedIn(false);
		} else {
			self.isLoggedIn(true);
		}

		// signout user and redirect to the login page
		self.signout = function () {
			logout();
			window.location.replace("login.html");
		}

		// connect user to the network
		self.connect = function() {
			connect(); // connect to firebase
			self.isConnected(true);
		}

		// disconnect user from the network
		self.disconnect = function() {
			disconnect(); // disconnect from firebase
			self.isConnected(false);
		}
	}
	ko.applyBindings(new HackboxViewModel());
	
});