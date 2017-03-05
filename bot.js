/* 

	Requires

*/

var SteamUser = require( 'steam-user' );

/*

	Variables

*/

var client         = new SteamUser();
var readline       = require('readline');
var targetid, targetname, spamcount, spamam, spamst = null
var shouldspam     = false
var rl             = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

/*

	Functions

*/

function AskForUsr() {
	targetid, targetname = null;

	rl.question("Target username: ", function( usr ) {
		GetUsr( usr.toLocaleLowerCase() );
	});
}

function AskForSpam() {
	rl.question( "How many times should they be spammed ( 1 - 1000 )? ", function( amt ) {
		rl.question( "What should the message be? ", function( str ) {
			GetSpamString( str, amt );
		});
	});
};

function GetSteamCode( callback ) {
	rl.question( "Steam guard code is needed: ", function( code ) {
		callback( code );
	});
}

function GetUsr( usr ) {
	console.log( "Attempting to find user: "+usr.toLocaleLowerCase() );

	var ourFriends = client.myFriends;
	var newFriends = [];

	for( i in ourFriends ) {
		newFriends.push( i );
	}

	client.getPersonas( newFriends, function( personas ) {
		for( i in personas ) {
			if( personas[i].player_name.toLocaleLowerCase().includes( usr.toLocaleLowerCase() ) ) {
				targetid   = i;
				targetname = personas[i].player_name

				console.log( "Found target: "+targetname+" / "+targetid );

				AskForSpam();
				return
			}
		}

		console.log( "Unable to find target." )
		AskForUsr();
	});
};

function SpamLoop() {
	setInterval( function() {
		if( shouldspam ) {
			if( spamcount != spamamt && spamstr != null && spamamt != null && targetid != null ) {
				client.chatMessage( targetid, spamstr );
				
				spamcount++;
			}else{
				spamcount, spamstr, spamamt = null;
				shouldspam = false;

				console.log( "Finished spamming target." );

				AskForUsr();
			}
		}
	}, 300 )
}

function GetSpamString( spam, amt ) {
	if( targetid != null ) {
		if( amt > 0 && amt < 1000 ) {

			console.log( "Spamming "+targetname+" with message '"+spam+"', "+amt+" times." )
			console.log( "This will take roughly "+( amt*300 )/1000+" seconds to do." )

			spamcount  = 0
			spamstr    = spam;
			spamamt    = amt;
			shouldspam = true;

			SpamLoop()
		}else{
			console.log( "Invalid number or number is too high / low." )
			AskForSpam();
		}
	}
}

// Client options
client.setOption( "promptSteamGuardCode", false );

// Initiate Login
client.logOn({
    accountName: process.argv[2],
    password: process.argv[3]
});

//Steam guard
client.on("steamGuard", function( domain, callback ) {
	GetSteamCode( callback );
});

// What to do once we've logged in
client.on('loggedOn', () => {
	client.setPersona( 256 );
    console.log("Logged into Steam account.");
    client.gamesPlayed("ryl's spam bot");
});

// Get Steam Friends 
client.on('friendsList', () => {
	console.log("Have got accounts friendslist...")
	AskForUsr();
});

// Disconnect
client.on('disconnected', function( eresult, msg ) {
	console.log( "Disconnected from Steam." )
});
