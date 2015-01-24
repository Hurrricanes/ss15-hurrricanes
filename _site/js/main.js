$(function () {
	function HackboxViewModel () {
		var self = this;
		self.isLoggedIn = ko.observable(false);
		self.isConnected = ko.observable(false);
		self.users = ko.observableArray([]);

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
			// connect to firebase
			connect(function () {
				self.isConnected(true);
				// register listeners to hackbox changes
				onHackNetChanged(self.hackBoxConnectedCallback, self.hackBoxChangedCallback, self.hackBoxDisconnectedCallback);
			}, function () {
				self.isConnected(false);
			});
		}

		// disconnect user from the network
		self.disconnect = function() {
			disconnect(); // disconnect from firebase
			self.isConnected(false);
		}

		// callback function to detect new user connected to the network
		self.hackBoxConnectedCallback = function (user) {
			self.users.push(user.val());
		}

		// callback function to detect changes of a user
		self.hackBoxChangedCallback = function (user) {
			
		}

		// callback function to detect disconnection of a user
		self.hackBoxDisconnectedCallback = function (user) {
			
		}
	}
	ko.applyBindings(new HackboxViewModel());
	
});