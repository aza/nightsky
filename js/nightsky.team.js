if( !window.nightsky ) window.nightsky = {}

;(function(nightsky){
	nightsky.Team = function() {
		this.playerNames = []
		this.players = {}
		this.you = undefined
	}

	nightsky.Team.prototype.add = function( playerName ) {
		var lookSpot = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshNormalMaterial());
		lookSpot.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2.0 ) )			
		//lookSpot.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -100 ) );	
		//geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -2, -length/2.0 - 3) )

		lookSpot.geometry.verticesNeedUpdate = true;
		lookSpot.name = playerName;
		lookSpot.position.z =  -100;
		this.playerNames.push( playerName )
		this.players[playerName] = lookSpot

		nightsky.scene.add( lookSpot )	
	}

	nightsky.Team.prototype.getByName = function( playerName ) {
		return this.players[playerName];
	}

	nightsky.Team.prototype.getDistanceBetweenTeam = function() {
		if (this.playerNames.length > 1) {
			var playerA = this.players[this.playerNames[0]];
			var playerB = this.players[this.playerNames[1]];
			console.log(playerA, playerB, playerA.position.distanceTo(playerB.position))
			return playerA.position.distanceTo(playerB.position);
		} 
		else {
			return 100000000000;
		}
	}

	nightsky.Team.prototype.getAngleBetweenTeam = function() {
		if (this.playerNames.length > 1) {
			var playerA = this.players[this.playerNames[0]];
			var playerB = this.players[this.playerNames[1]];
			console.log(playerA.rotation);//, playerB.rotation, (playerA.rotation.angleTo(playerB.rotation) / (2*Math.PI)) * 360)
			return playerA.rotation.angleTo(playerB.rotation);
		} 
		else {
			return 100000000000;
		}
	}




})(window.nightsky)

