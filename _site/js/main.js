$(function () {
	function HackboxViewModel () {
		var self = this;
		self.isLoggedIn = ko.observable(false);
		self.isConnected = ko.observable(false);
		self.users = ko.observableArray([]);
		// Register the callback to be fired every time auth state changes
		self.user = getAuth();

		if (self.user == undefined || self.user == null) {
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
			self.users([]); // clear user list if current user is disconnected
			self.isConnected(false);
		}

		// callback function to detect new user connected to the network
		self.hackBoxConnectedCallback = function (user) {
			var box = user.val();
			console.log(user);
			box['box_id'] = user.key();
			self.users.push(box);
		}

		// callback function to detect changes of a user
		self.hackBoxChangedCallback = function (user) {
			
		}

		// callback function to detect disconnection of a user
		self.hackBoxDisconnectedCallback = function (user) {
			// find the box with the correct id and remove id from the array
			for (var i = 0; i < self.users().length; i++) {
				if(self.users()[i]['box_id'] === user.key()) {
					self.users.splice(i, 1);
				}
			};
		}

		// connect to the selected hack box
		self.connectToBox = function (box) {
			console.log(box);
		}
	}
	ko.applyBindings(new HackboxViewModel());
	
});


jQuery(function($, undefined) {
    $('#term_demo').terminal(function(command, term) {
        if (command !== '') {
            try {
                var result = window.eval(command);
                if (result !== undefined) {
                    term.echo(new String(result));
                }
            } catch(e) {
                term.error(new String(e));
            }
        } else {
           term.echo('');
        }
    }, {
        greetings: 'Javascript Interpreter',
        name: 'js_demo',
        height: 200,
        prompt: 'HackBox> '});
});