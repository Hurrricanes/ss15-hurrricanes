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

		var ips = 0;
		// callback function to detect new user connected to the network
		self.hackBoxConnectedCallback = function (user) {
			var box = user.val();
			box['box_id'] = user.key();
			box['connected'] = false;
			box['ip'] = ips;
			ips++;
			self.users.push(box);
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

		// callback function to detect changes of a user
		self.hackBoxChangedCallback = function (user) {

		}

	    $('#terminal').terminal(function(command, term) {
	        if (args !== '') {
	    		var args = command.split(' ');
	        	try {
		        	switch(args[0]) {
		        		case 'connect':
		        			// connect to firebase
		        			term.echo("Connecting...");
							connect(function () {
                                                            
								self.isConnected(true);
								// register listeners to hackbox changes
								onHackNetChanged(self.hackBoxConnectedCallback, self.hackBoxChangedCallback, self.hackBoxDisconnectedCallback);
								term.echo('Connection successful!');
							}, function (error) {
								self.isConnected(false);
								if (typeof(error) == "function") {
									term.error("Connection failed!");
								} else {
									term.error(error);
								}
							});
		        			break;
		        		case 'disconnect':
		        			term.echo("Disconnecting...");
		        			offHackNetChanged();
		        			// disconnect from firebase
							disconnect(function (error) {
								if (error || error == '') {
									term.error("Disconnect failed!");
								} else {
									term.echo('Disconnected');
								}
							});
							self.users([]); // clear user list if current user is disconnected
							self.isConnected(false);
		        			break;
		        		case 'hack':
		        			term.echo("Initiating...");
		        			var box = self.users()[args[1]];
		        			if(box) {
		        				// initiate a connection with a box
			        			connectToHackBox(box.box_id, function () {
			        				box.connected = true;
			        				var users = self.users();
			        				self.users([]);
			        				self.users(users);
			        				term.echo("Connected to " + args[1]);
								}, function (error) {
									term.error(error);
								});
			        		} else {
			        			term.error("IP "+ args[1] +" not found");
			        		}
			        		break;
			        	case 'help':
			        		// show guide to Hackbox
			        		break;
		        		default:
		        			term.error("Command not found!");
		        			break;
		        	}
				} catch(e) {
					term.error("Error occurred!");
				}
			} else {
				term.echo('');
			}
	    }, {
	        greetings: 'Welcome to Hackbox.\nEnter "help" for a guide\n',
	        name: 'terminal',
	        height: 300,
	        prompt: 'HackBox~$ '
	    });
	}
	ko.applyBindings(new HackboxViewModel());
	
});