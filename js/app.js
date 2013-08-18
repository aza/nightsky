// GLOBALS

var globals = {
	vrstate: new vr.State()
}

vr.load()

init()
animate()


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
		//blending: THREE.AdditiveBlending,
		vertexColors: false
	});

	this.material.color.setHSL( .5, 1.0, 1.0 )
	
	this.particles = new THREE.ParticleSystem( this.geometry, this.material )
	this.particles.sortParticles = true;

	this.addTo = function(scene){
		scene.add( this.particles )
	}


}


function init(){
	// Make the container DIV
	var container = document.createElement( 'div' )
	document.body.appendChild( container )

	var camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 10000 );
	camera.position.z = 2000;
	var scene = new THREE.Scene()
	scene.fog = new THREE.FogExp2( 0x000000, .0005 )

	var cloud = new CreatePointCloud( "disc.png" )
	cloud.addTo( scene )

	var cloud2 = new CreatePointCloud( "ball.png" )
	cloud2.addTo( scene )

	var renderer = new THREE.WebGLRenderer( ({ clearAlpha: 1 }) )
	renderer.setSize( window.innerWidth, window.innerHeight )
	container.appendChild( renderer.domElement )
	
	var effect = new THREE.OculusRiftEffect( renderer )
	scene.add( camera )


	camera.lookAt( scene.position )

	globals.effect = effect
	globals.renderer = renderer
	globals.scene = scene
	globals.camera = camera
}


function render(){
	var time = Date.now() *.0005
	var camera = globals.camera

	globals.effect.render( globals.scene, globals.camera )
	//globals.renderer.render( globals.scene, camera )
	vr.pollState(globals.vrstate)

	camera.position.z = Math.sin( time ) * 1000
	camera.position.x = Math.cos( time + Math.sin(time/2)) * 500
	camera.position.y = Math.sin( time - Math.cos(time/2)) * 500
	camera.lookAt( globals.scene.position )

}

function animate(){
	requestAnimationFrame( animate );
	render()
}

