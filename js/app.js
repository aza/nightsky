window.SKY = {};

(function(SKY){
// Actual global variables
var	mouse = {x:0, y:0}
,	mouse2D = {x:0, y:0}
,	windowHalfX = window.innerWidth / 2
,	windowHalfY = window.innerHeight / 2

// UTILITY FUNCTIONS

function onKeyDown(){
	console.log('key' + event.keyCode);

    switch (event.keyCode) {
      case 79: // O
        SKY.oculus = (SKY.oculus) ? false : true;
        onWindowResize();
      break;
    }
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    SKY.camera.aspect = window.innerWidth / window.innerHeight;
    SKY.camera.updateProjectionMatrix();

    SKY.renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {

	mouse.x = event.clientX - windowHalfX;
	mouse.y = event.clientY - windowHalfY;

	mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

//////////////////////////////////////////////////////////////////////////////
//
// Players
//
//

SKY.movementSpeed = 0.5;

SKY.Players = function() {
	this.playerNames = [];
	this.players = {};
}
SKY.Players.prototype.add = function( playerName ) {
	var lookSpot = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshNormalMaterial());
	lookSpot.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2.0 ) )			
	lookSpot.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -1000 ) );	
	//geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -2, -length/2.0 - 3) )

	lookSpot.geometry.verticesNeedUpdate = true;
	lookSpot.name = playerName;
	
	this.playerNames.push( playerName )
	this.players[playerName] = lookSpot

	SKY.scene.add( lookSpot )	
}
SKY.Players.prototype.getByName = function( playerName ) {
	return this.players[playerName];
}
SKY.Players.prototype.getDistanceBetweenPlayers = function() {
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
SKY.Players.prototype.getAngleBetweenPlayers = function() {
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



function makePlayerCylinder( scene ) {

	var length = 400;
	var radius = 0.2;

	var geometry 	= new THREE.CylinderGeometry( radius, radius, length, 3, 1, true )
	,	material 	= new THREE.MeshBasicMaterial( {color: 0x00FF00, wireframe: true} )
	,	mesh 		= new THREE.Mesh( geometry, material )
	
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / 2.0 ) )			
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -2, -length/2.0 - 3) )
	geometry.verticesNeedUpdate = true

	material.visible = true

	scene.add( mesh )
	return mesh;
}

function makeCollisionPlane( scene ) {

	var size = 400;
	var segments = 100;

	var geometry 	= new THREE.PlaneGeometry( size, size, segments, segments )
	,	material 	= new THREE.MeshBasicMaterial( {color: 0x00FF00, wireframe: true} )
	,	mesh 		= new THREE.Mesh( geometry, material )
	
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -10) )
	geometry.verticesNeedUpdate = true

	material.visible = true

	scene.add( mesh )
	return mesh;
}



SKY.team = new SKY.Players()

//////////////////////////////////////////////////////////////////////////////
//
// Clouds
//
//

SKY.moveClouds = function( velocity ) {
	//console.log(velocity)

	for (var i=0; i<2; i++) {
		SKY.clouds[i].particles.position.add( new THREE.Vector3( 
			velocity.x,
			velocity.y,
			velocity.z
		));
	}

	// SKY.clouds[0].particles.position.x += velocity.x
	// SKY.clouds[1].particles.position.x += velocity.x

	// SKY.clouds[0].particles.position.y += velocity.y
	// SKY.clouds[1].particles.position.y += velocity.y

	// SKY.clouds[0].particles.position.z += velocity.z
	// SKY.clouds[1].particles.position.z += velocity.z

	if( SKY.clouds[0].particles.position.z > 5000 ) {
		SKY.clouds[1].particles.position.z = -2000
		SKY.clouds[1].particles.position.z = -2000
	}

	collisionPlane.position.add( new THREE.Vector3( 
		velocity.x / 10,
		velocity.y / 10,
		0
	));
}


// Sky
SKY.vrstate = new vr.State()
SKY.oculus = false

vr.load()
init()
animate()

//////////////////////////////////////////////////////////////////////////////
//
// FIREBASE PHWOAR MULTIPLAYA!!!!
//
//
SKY.yourName = ((1<<24)*Math.random()|0).toString(16)
console.log('SKY.playerName', SKY.playerName)
var onlineRef = new Firebase('https://rift.firebaseio.com/players/'+SKY.yourName)
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
		if( !SKY.team.getByName(playerName) ){
			// Create a tracking sphere
			SKY.team.add( playerName )
			// var lookSpot = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshNormalMaterial());
			// SKY.scene.add( lookSpot )
			// lookSpot.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -1000, 0 ) );
			// lookSpot.geometry.verticesNeedUpdate = true;

			//PLAYERS[player] = newPlayer
		}
		// Move the tracking sphere
		if( player != SKY.yourName ){
			// SKY.players[player].rotation.x = Math.PI/2 + val[player].x//camera.rotation.x
			// SKY.players[player].rotation.z = -val[player].y//camera.rotation.y
			SKY.team.getByName(playerName).rotation.x = val[playerName].x//camera.rotation.x
			SKY.team.getByName(playerName).rotation.z = val[playerName].y//camera.rotation.y			
		}
		
		//console.log( val[players[i]] )
	}

})




//////////////////////////////////////////////////////////////////////////////
//
// Oculus Utility Functions
//
//
function getRiftOrientation(){
	vr.pollState( SKY.vrstate )

	var rotation = new THREE.Quaternion();
	var angles = new THREE.Vector3();
	if (SKY.vrstate) {
		rotation.set(
			SKY.vrstate.hmd.rotation[0],
			SKY.vrstate.hmd.rotation[1],
			SKY.vrstate.hmd.rotation[2],
			SKY.vrstate.hmd.rotation[3]
		)

		angles.setEulerFromQuaternion(rotation, 'XYZ');
			//angles.z = 0;
		rotation.setFromEuler(angles, 'XYZ');
	}

	return rotation
}

function setObjToRiftOrientation(obj){
	var r = getRiftOrientation()
	obj.rotation.x = r.x
	obj.rotation.y = r.y
	obj.rotation.z = r.z
}


//////////////////////////////////////////////////////////////////////////////
//
// Factories
//
//
function CreatePointCloud(spriteName){
	var sprite = THREE.ImageUtils.loadTexture( spriteName )
	this.geometry = new THREE.Geometry()

	function rand(){ return 10000*(Math.random()-.5) }

	for( var i=0; i < 10000; i++ ){
		var vertex = new THREE.Vector3( rand(), rand(), rand() )
		this.geometry.vertices.push( vertex )
	}

	this.material = new THREE.ParticleBasicMaterial({
		size: 35,
		map: sprite,
		transparent: true,
		blending: THREE.AdditiveBlending,
		vertexColors: false
	});

	this.material.color.setHSL( .5, 1.0, 1.0 )

	this.particles = new THREE.ParticleSystem( this.geometry, this.material )
	this.particles.sortParticles = true;

	this.addTo = function(scene){
		scene.add( this.particles )
	}
}

function player ( scene ) {

}


//////////////////////////////////////////////////////////////////////////////
//
// Init & Game Loop
//
//
function init(){
	// Make the container DIV
	var container = document.createElement( 'div' )
	document.body.appendChild( container )

	var camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, .1, 10000 );
	camera.position.z = 0;
	var scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2( 0x000000, .000005 )

	var cloud = new CreatePointCloud( "disc.png" )
	cloud.addTo( scene )

	var cloud2 = new CreatePointCloud( "ball.png" )
	cloud2.addTo( scene )
	SKY.clouds = [cloud, cloud2]

	var renderer = new THREE.WebGLRenderer( ({ clearAlpha: 1 }) )
	renderer.setSize( window.innerWidth, window.innerHeight )
	container.appendChild( renderer.domElement )
	
	var effect = new THREE.OculusRiftEffect( renderer )
	scene.add( camera )

	camera.lookAt( scene.position )

	SKY.effect = effect
	SKY.renderer = renderer
	SKY.scene = scene
	SKY.camera = camera

	// Create raycaster, to use later for collision stuff
	window.projector = new THREE.Projector()
	window.ray = new THREE.Raycaster()

	// Create our 'player'
	window.playerSightCone = makePlayerCylinder( scene );
	window.collisionPlane = makeCollisionPlane( scene );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener('keydown', onKeyDown, false );
}


function render(){
	var time = Date.now() *.0005
	var camera = SKY.camera
		  //lookSpot = SKY.players.getByName(SKYplayerName)

	// Update camera from Oculus or from mouse if SKY.oculus = false
	if (SKY.oculus === true) {
		SKY.effect.render( SKY.scene, SKY.camera )
		vr.pollState(SKY.vrstate)
	    camera.rotation = getRiftOrientation();
		setObjToRiftOrientation( SKY.camera )
	} 
	else {
		SKY.renderer.render( SKY.scene, camera )
		camera.rotation.y = ( -mouse.x - camera.position.x ) / 360;
	    camera.rotation.x = ( -mouse.y ) / 360;
	}

	// Update objects
	// if( lookSpot ){
	// 	// lookSpot.rotation.x = Math.PI/2 + camera.rotation.x
	// 	// lookSpot.rotation.z = -camera.rotation.y
	// 	console.log



	// Raycaster - we'll use this later for collision stuff
	window.raycaster = projector.pickingRay( new THREE.Vector3(0,0,0).clone(), camera )
	SKY.playerLooking = raycaster.intersectObject( collisionPlane, false )[0].points;

	if (_.isUndefined(SKY.team.getByName(SKY.yourName)) === false) {
		SKY.team.getByName(SKY.yourName).rotation.x = camera.rotation.x
		SKY.team.getByName(SKY.yourName).rotation.y = camera.rotation.y

		var d = SKY.team.getAngleBetweenPlayers()
		if (d < 0.5) {
			SKY.movementSpeed = 1 + (0.5 - d) * 40;
		}
		else {
			SKY.movementSpeed = 1;
		}

		document.getElementById('debug').innerHTML = SKY.team.getByName(SKY.yourName).rotation.x;		
		SKY.moveClouds({
			x: SKY.team.getByName(SKY.yourName).rotation.y * 2 * SKY.movementSpeed, 
			y: SKY.team.getByName(SKY.yourName).rotation.x * -2 * SKY.movementSpeed, 
			z: SKY.movementSpeed
		});		
	}

	// Firebase!
	if( window.updateNetworkStash ){
		window.updateNetworkStash( {x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z} )
	}
	
	// Update player line of sight cone
	playerSightCone.position = camera.position;
	playerSightCone.rotation = camera.rotation;

}

function animate(){
	requestAnimationFrame( animate );
	render()
}

})(SKY)