NAME
    connect -- connect to the hacking network

SYNOPSIS
    connect

DESCRIPTION
    In order to play this hacking game, first you need to connect to the hacking network (network of online hackers). This `connect` command will connects you to that hacking network.



NAME
    hack -- initiate hack on another user

SYNOPSIS
    hack [Victim's IP Address]

EXAMPLE
	hack 192.168.50.250

DESCRIPTION
    Once you joined the hacking network, you will be displayed with the list of available users on the hacking network. From there, you can select a user (identified by their IP address) as the victim and initiate the hack using `hack` command.



NAME
    crack -- try to crack target's passcode with

SYNOPSIS
    crack [Target IP Address] [Guessed Passcode]

EXAMPLE
	crack 192.168.50.250 55

DESCRIPTION
	Once you initiated the hack on a selected victim, you can start guessing victim's passcode in order to steal coins from their accounts. This passcode is a positive integer between 0 and the amount of coins in victim's account (if the victim has 255 coins in their account, the passcode is a number between 0 - 255).

	You will be given only 10 attempts to guess the victim's passcode. If you guess the passcode correctly, you will be able to steal a portion of coins from victim's account. That amount will be depend on the number of attempts it took for you to correctly guess the victim's passcode. 

	Correct guess at 1st attempt  : 10% of coins from victim's account.
	Correct guess at 2nd attempt  :  9% of coins from victim's account.
	Correct guess at 3rd attempt  :  8% of coins from victim's account.
	Correct guess at 4th attempt  :  7% of coins from victim's account.
	Correct guess at 5th attempt  :  6% of coins from victim's account.
	Correct guess at 6th attempt  :  5% of coins from victim's account.
	Correct guess at 7th attempt  :  4% of coins from victim's account.
	Correct guess at 8th attempt  :  3% of coins from victim's account.
	Correct guess at 9th attempt  :  2% of coins from victim's account.
	Correct guess at 10th attempt :  1% of coins from victim's account.



NAME
    defend -- defend your account from other hackers

SYNOPSIS
    defend [Attackers IP Address] [Guessed Passcode]

EXAMPLE
	defend 122.133.20.180 370

DESCRIPTION
	Once you connected to the hacking network, other users can also initiate hack on your account. If someone else initiate a hack on your account, you will be notified on your dashboard. Then you can start defending your account against the attacker. In order to defend your account, you have to guess attackers passcode before the attacker correctly guesses your passcode. Unlike in `crack` command, here you will have unlimited attempts to guess passcode of the attacker and defend your account.



NAME
	disconnect -- disconnect from hacking network   

SYNOPSIS
    disconnect

DESCRIPTION
	You can use `disconnect` command to exit out of the hacking network. Once you disconnected from the hacking network, other users cannot initiate hack on your account. But if someone has already initiated a hack and went halfway through the passcode cracking, (s)he will still be able to continue hacking until they reach their maximum attempts to crack the passcode.
	
