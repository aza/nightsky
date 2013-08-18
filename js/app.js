// GLOBALS

var globals = {
	vrstate: new vr.State()
}

vr.load()

init()
animate()


function getRiftOrientation(){
	vr.pollState( globals.vrstate )

	var rotation = new THREE.Quaternion();
	var angles = new THREE.Vector3();
	if (globals.vrstate) {
		rotation.set(
			globals.vrstate.hmd.rotation[0],
			globals.vrstate.hmd.rotation[1],
			globals.vrstate.hmd.rotation[2],
			globals.vrstate.hmd.rotation[3]
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

	var camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, .1, 10000 );
	camera.position.z = 10;
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

	// API: THREE.CylinderGeometry(bottomRadius, topRadius, height, segmentsRadius, segmentsHeight)
	var c = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 1000, 50, 50, false), new THREE.MeshNormalMaterial());
	scene.add(c)

	c.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -500, 0 ) );
	c.geometry.verticesNeedUpdate = true;

	window.c = c
	
	globals.cylinder = c
	window.camera = camera

	camera.lookAt( scene.position )

	globals.effect = effect
	globals.renderer = renderer
	globals.scene = scene
	globals.camera = camera
}


function render(){
	var time = Date.now() *.0005
	var camera = globals.camera

	//globals.effect.render( globals.scene, globals.camera )
	globals.renderer.render( globals.scene, camera )
	vr.pollState(globals.vrstate)


	setObjToRiftOrientation( globals.camera )
	c.rotation.x = Math.PI/2 + camera.rotation.x
	c.rotation.z = -camera.rotation.y
	//setObjToRiftOrientation( globals.cylinder )
	

}

function animate(){
	requestAnimationFrame( animate );
	render()
}

