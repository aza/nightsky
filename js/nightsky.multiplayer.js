if( !window.nightsky ) window.nightsky = {}

;(function(nightsky){

	function generateHexName() {
		return ((1<<24)*Math.random()|0).toString(16)
	}

	nightsky.bindToFirebase = function( team ) {
		nightsky.yourName = generateHexName()
		var onlineRef = new Firebase('https://rift.firebaseio.com/players/'+nightsky.yourName)
		var connectedRef = new Firebase('https://rift.firebaseio.com/.info/connected');

		connectedRef.on('value', function(snap){
			if( snap.val() === true ){
				onlineRef.onDisconnect(function(){}).set(null)

				window.updateNetworkStash = function(obj){
					onlineRef.set(obj)
				}

				onlineRef.set(true)
			}
		})

		var playersRef = new Firebase('https://rift.firebaseio.com/players')
		playersRef.on('value', function(snap){
			
			var val = snap.val()
			var players = Object.keys(val)
			for( var i=0; i<players.length; i++){
				var playerName = players[i]
				//if( player == playerName ) continue
				if( !team.getByName(playerName) ){
					// Create a tracking sphere
					team.add( playerName )

					if(playerName == nightsky.yourName) {
						team.you = team.getByName(nightsky.yourName)
					}
				}
				// Move the tracking sphere
				if( playerName != nightsky.yourName ){
					//team.getByName(playerName).rotation.z = val[playerName].y
				}
			}

		})
	}

})(window.nightsky)