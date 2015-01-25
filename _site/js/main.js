$(function () {
    function HackboxViewModel() {
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

        self.getIndexForUser = function (user) {
        	for (var i = 0; i < self.users().length; i++) {
                if (self.users()[i]['box_id'] === user.key()) {
                    return i;
                }
            }
        }

        // callback function to detect new user connected to the network
        self.hackBoxConnectedCallback = function (user) {
            var box = user.val();
            box['box_id'] = user.key();
            box['connected'] = false;
            self.users.push(box);
        }

        // callback function to detect disconnection of a user
        self.hackBoxDisconnectedCallback = function (user) {
            // find the box with the correct id and remove id from the array
        	var index = self.getIndexForUser(user);
        	if (index) {
        		self.users.splice(index, 1);	
        	};
        }

		// callback function to detect changes of a user
		self.hackBoxChangedCallback = function (user) {
			var index = self.getIndexForUser(user);
        	if (index) {
        		self.users()[index] = user.val();	
        	};
		}

		// callback function to detect new connection
		self.onNewConnection = function (con) {
			var index = self.getIndexForUser(con);
			if (index) {
				self.users()[index]['connected'] = true;
			};
		}

        // callback function to detect changes in exisiting connections
        self.onConnectionChanged = function (con) {
        }

		// callback function to detect connections closed
		/**
		* TODO: not working at the moment. disconnect mechanism should be implemented in firebase
		*/
		self.onConnectionClosed = function (con) {
			var index = self.getIndexForUser(con);
			if (index) {
				self.users()[index]['connected'] = false;
			};
		}

        self.connectedBoxes = ko.computed(function () {
            return ko.utils.arrayFilter(self.users(), function (item) {
                return item['connected'] == true;
            });
        });

        self.connected = new buzz.sound("sounds/connected", {
            formats: ["mp3"]
        });

        self.disconnected = new buzz.sound("sounds/disconnected", {
            formats: ["mp3"]
        });

        $('#terminal').terminal(function (command, term) {
            if (args !== '') {
                var args = command.split(' ');
                try {
                    switch (args[0]) {
                        case 'connect':
                            // connect to firebase
                            self.connected.play();
		        			term.echo("Connecting...");
							connect(function () {
                                                            
								self.isConnected(true);
								// register listeners to hackbox changes
								onHackNetChanged(self.hackBoxConnectedCallback, self.hackBoxChangedCallback, self.hackBoxDisconnectedCallback);
								onConnection(self.onNewConnection, self.onConnectionChanged, self.onConnectionClosed);
								term.echo('Connection successful!');
							}, function (error) {
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
									self.disconnected.play();
									term.echo('Disconnected');
								}
							});
							self.users([]); // clear user list if current user is disconnected
							self.isConnected(false);
		        			break;
		        		case 'hack':
		        			term.echo("Initiating...");
		        			var box = undefined;
		        			for (var i = 0; i < self.users().length; i++) {
				                if (self.users()[i]['ip'] === args[1]) {
				                    box = self.users()[i];
				                }
				            }
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
                                            case 'crack':
                                                var box = undefined;
                                                for (var i = 0; i < self.users().length; i++) {
                                                    if (self.users()[i]['ip'] === args[1]) {
                                                        box = self.users()[i];
                                                    }
                                                }
                                                if (box) {
                                                    // initiate a connection with a box
                                                    crackPasscode(args[2], box.box_id, function () {
                                                        term.echo(args[1] + " is successfully cracked.");
                                                    }, function (info) {
                                                        term.echo(info);
                                                    }, function (error) {
                                                        term.error(error);
                                                    });
                                                } else {
                                                    term.error("IP " + args[1] + " not found");
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
