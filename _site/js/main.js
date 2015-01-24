$(function () {
	function HackboxViewModel () {
		
	}
	// Register the callback to be fired every time auth state changes
	var user = getAuth();

	if (!user) {
		window.location.replace("login.html");
	}
});