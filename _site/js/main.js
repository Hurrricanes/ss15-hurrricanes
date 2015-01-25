$(function() {
  function HackboxViewModel() {
    var self = this;
    self.isLoggedIn = ko.observable(false);
    self.isConnected = ko.observable(false);
    self.users = ko.observableArray([]);
    self.conBoxes = ko.observableArray([]);
    self.hackBoxes = ko.observableArray([]);
    // Register the callback to be fired every time auth state changes
    self.user = getAuth();

    if (self.user == undefined || self.user == null) {
      window.location.replace("login.html");
      self.isLoggedIn(false);
    } else {
      self.isLoggedIn(true);
    }

    // signout user and redirect to the login page
    self.signout = function() {
      logout();
      window.location.replace("login.html");
    }

    self.getIndexForObject = function(type, obj) {
      var arr = [];
      switch (type) {
        case 'user':
          arr = self.users();
          break;
        case 'con':
          arr = self.conBoxes();
          break;
        case 'hack':
          arr = self.hackBoxes();
          break;
      }
      for (var i = 0; i < arr.length; i++) {
        if (arr[i]['box_id'] == obj.key()) {
          return i;
        }
      }
      return undefined;
    }

    // callback function to detect new user connected to the network
    self.hackBoxConnectedCallback = function(user) {
      var box = user.val();
      box['box_id'] = user.key();
      self.users.push(box);
    }

    // callback function to detect disconnection of a user
    self.hackBoxDisconnectedCallback = function(user) {
      // find the box with the correct id and remove id from the array
      var index = self.getIndexForObject('user', user);
      if (index != undefined) {
        self.users.splice(index, 1);
      }
      ;
    }

    // callback function to detect changes of a user
    self.hackBoxChangedCallback = function(user) {
      var index = self.getIndexForObject('user', user);
      if (index != undefined) {
        var users = self.users();
        self.users([]);
        users[index] = user.val();
        users[index]['box_id'] = user.key();
        self.users(users);
      }
      ;
    }

    // callback function to detect new connection
    self.onNewConnection = function(obj) {
      var box = obj.val();
      box['box_id'] = obj.key();
      self.conBoxes.push(box);
    }

    // callback function to detect changes in exisiting connections
    self.onConnectionChanged = function(obj) {
      var index = self.getIndexForObject('con', obj);
      if (index != undefined) {
        self.conBoxes.splice(index, 1);
        var box = obj.val();
        box['box_id'] = obj.key();
        self.conBoxes.push(box);
      }
      ;
    }

    // callback function to detect connections closed
    self.onConnectionClosed = function(obj) {
      var index = self.getIndexForObject('con', obj);
      if (index != undefined) {
        self.conBoxes.splice(index, 1);
      }
      ;
    }

    // callback function to detect new hack
    self.onNewHackCallBack = function(obj) {
      var box = obj.val();
      box['box_id'] = obj.key();
      self.hackBoxes.push(box);
    }

    // callback function to detect changes in exisiting hacks
    self.onHackChangeCallBack = function(obj) {
      var index = self.getIndexForObject('hack', obj);
      if (index != undefined) {
        self.hackBoxes.splice(index, 1);
        var box = obj.val();
        box['box_id'] = obj.key();
        self.hackBoxes.push(box);
      }
      ;
    }

    // callback function to detect hacks closed
    self.onHackStoppedCallBack = function(obj) {
      var index = self.getIndexForObject('hack', obj);
      if (index != undefined) {
        self.hackBoxes.splice(index, 1);
      }
      ;
    }

    self.connected = new buzz.sound("sounds/connected", {
      formats: ["mp3"]
    });

    self.disconnected = new buzz.sound("sounds/disconnected", {
      formats: ["mp3"]
    });

    $('#terminal').terminal(function(command, term) {
      if (args !== '') {
        var args = command.split(' ');
        try {
          switch (args[0]) {
            case 'connect':
              // connect to firebase
              self.connected.play();
              term.echo("Connecting...");
              connect(function() {

                self.isConnected(true);
                // register listeners to hackbox changes
                onHackNetChanged(self.hackBoxConnectedCallback, self.hackBoxChangedCallback, self.hackBoxDisconnectedCallback);
                onConnection(self.onNewConnection, self.onConnectionChanged, self.onConnectionClosed);
                onHack(self.onNewHackCallBack, self.onHackChangeCallBack, self.onHackStoppedCallBack);
                term.echo('Connection successful!');
              }, function(error) {
                if (typeof (error) == "function") {
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
              disconnect(function(error) {
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
              if (box) {
                // initiate a connection with a box
                connectToHackBox(box.box_id, function() {
                  term.echo("Connected to " + args[1]);
                }, function(error) {
                  term.error(error);
                });
              } else {
                term.error("IP " + args[1] + " not found");
              }
              break;
            case 'crack':
              var box = undefined;
              for (var i = 0; i < self.conBoxes().length; i++) {
                if (self.conBoxes()[i]['ip'] === args[1]) {
                  box = self.conBoxes()[i];
                }
              }
              if (box) {
                // initiate a connection with a box
                crackPasscode(args[2], box.box_id, function() {
                  term.echo(args[1] + " is successfully cracked.");
                }, function(info) {
                  term.echo(info);
                }, function(error) {
                  term.error(error);
                });
              } else {
                term.error("IP " + args[1] + " not found");
              }
              break;
            case 'defend':
              var box = undefined;
              for (var i = 0; i < self.hackBoxes().length; i++) {
                if (self.hackBoxes()[i]['ip'] === args[1]) {
                  box = self.hackBoxes()[i];
                }
              }
              if (box) {
                // initiate a connection with a box
                defend(args[2], box.box_id, function() {
                  term.echo(args[1] + " is successfully defended.");
                }, function(info) {
                  term.echo(info);
                }, function(error) {
                  term.error(error);
                });
              } else {
                term.error("IP " + args[1] + " not found");
              }
              break;
            case 'help':
              jQuery.get('text/readme.txt', function(data) {
                term.echo(data);
              });
              // show guide to Hackbox
              break;
            default:
              term.error("Command not found!");
              break;
          }
        } catch (e) {
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
