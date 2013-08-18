var VISUALS_VISIBLE = true;

var SCALE_FACTOR = 1000;
var CAMERA_BOUND = 200;

var NUM_POINTS_SUBSET = 50000;
var NUM_SUBSETS       = 10;
var NUM_POINTS = NUM_POINTS_SUBSET * NUM_SUBSETS;

var NUM_LEVELS = 5;
var LEVEL_DEPTH = 800;

var DEF_BRIGHTNESS = .7;
var DEF_SATURATION = .7;

// Orbit parameters constraints
var A_MIN = -30;
var A_MAX = 30;
var B_MIN = .2;
var B_MAX = 1.8;
var C_MIN = 5;
var C_MAX = 17;
var D_MIN = 0;
var D_MAX = 10;
var E_MIN = 0;
var E_MAX = 12;

// Orbit parameters
var a, b, c, d, e;

// Orbiut data
var orbit = {
	subsets: [],
	xMin: 0,
	xMax: 0,
	yMin: 0,
	yMax: 0,
	scaleX: 0,
	scaleY: 0
}
// Initialize data points
for (var i = 0; i < NUM_SUBSETS; i++){
	var subsetPoints = [];
	for (var j = 0; j < NUM_POINTS_SUBSET; j++){
		subsetPoints[j] = {
			x: 0,
			y: 0, 
			vertex:  new THREE.Vector3(0,0,0)
		};
	}
	orbit.subsets.push(subsetPoints);
}			

var container, effect;
var camera, scene, renderer, composer, hueValues = [];

var vrstate = new vr.State();

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var speed = .2;
var rotationSpeed = .000;

vr.load(function(error){
	init();
	animate();
})

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 180, window.innerWidth / window.innerHeight, 1, 3 * SCALE_FACTOR );
	camera.position.z = SCALE_FACTOR/2;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.0011);

	generateOrbit();
	
	for (var s = 0; s < NUM_SUBSETS; s++){hueValues[s] = Math.random();}
	
	// Create particle systems
	for (var k = 0; k < NUM_LEVELS; k++){
		for (var s = 0; s < NUM_SUBSETS; s++){
			var geometry = new THREE.Geometry();
			for (var i = 0; i < NUM_POINTS_SUBSET; i++){geometry.vertices.push( orbit.subsets[s][i].vertex);}
			var materials = new THREE.ParticleBasicMaterial({
				size: (1 ),
				blending: THREE.AdditiveBlending,
				depthTest: true,
				transparent : true,
				map: THREE.ImageUtils.loadTexture( 'img/galaxy.png' )
			});
			
			materials.color.setHSL(hueValues[s], DEF_SATURATION, DEF_BRIGHTNESS);
			var particles = new THREE.ParticleSystem( geometry, materials );
			particles.myMaterial = materials;
			particles.myLevel = k;
			particles.mySubset = s;
			particles.position.x = 0;
			particles.position.y = 0;
			particles.position.z = - LEVEL_DEPTH * k - (s  * LEVEL_DEPTH / NUM_SUBSETS);
			particles.needsUpdate = 0;
			scene.add( particles );
		}
	}

	// Setup renderer and effects
	renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialiawws: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	

	container.appendChild( renderer.domElement );

	setInterval(updateOrbit, 7000);

	effect = new THREE.OculusRiftEffect( renderer );
	scene.add( camera );

	//

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'keydown', onKeyDown, false );
	

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


var vrstate = new vr.State();
function animate() {
	vr.requestAnimationFrame( animate );
	render();
}

function render() {

	var time = Date.now() * 0.001;


	var rotation = new THREE.Quaternion();
	var angles = new THREE.Euler();
	if (vrstate) {
		rotation.set(
				vrstate.hmd.rotation[0],
				vrstate.hmd.rotation[1],
				vrstate.hmd.rotation[2],
				vrstate.hmd.rotation[3]);
		angles.setFromQuaternion(rotation, 'XYZ');
		//angles.z = 0;
		rotation.setFromEuler(angles, 'XYZ');
		// velocity.applyQuaternion(rotation);
	}

	//console.log( rotation )

	//rotationSpeed = rotation.z/5

	camera.rotation.x = rotation.x//time * 0.25;
	camera.rotation.y = rotation.y//time * 0.5;
	camera.rotation.z = rotation.z//time * 0.5;




	for( i = 0; i < scene.children.length; i++ ) {
		scene.children[i].position.z +=  speed;
		scene.children[i].rotation.z += rotationSpeed// + rotation.x/10;
		//scene.children[i].rotation.z = speed/10*Math.sin(scene.children[i].position.z/1000);
		//scene.children[i].rotation.z = 2*Math.sin(scene.children[i].myLevel);
		//scene.children[i].scale.y = 1 + Math.sin(time)/2



		if (scene.children[i].position.z > camera.position.z){
			scene.children[i].position.z = - (NUM_LEVELS -1) * LEVEL_DEPTH;
			
			/*shuffleParams()
			generateOrbit()
			var geometry = new THREE.Geometry();
			for (var j = 0; j < NUM_POINTS_SUBSET; j++){geometry.vertices.push( orbit.subsets[1][j].vertex);}*/

			if (scene.children[i].needsUpdate == 1){
				scene.children[i].geometry.__dirtyVertices = true;	
				scene.children[i].myMaterial.color.setHSL( hueValues[scene.children[i].mySubset], DEF_SATURATION, DEF_BRIGHTNESS);
				//scene.children[i].geometry = geometry
				scene.children[i].needsUpdate = 0;
				scene.children[i].rotation.z += 20
				

				var geometry = new THREE.Geometry();
				for (var j = 0; j < NUM_POINTS_SUBSET; j++){geometry.vertices.push( orbit.subsets[1][j].vertex);}

				var materials = new THREE.ParticleBasicMaterial({
					size: (1 ),
					blending: THREE.AdditiveBlending,
					depthTest: true,
					transparent : true,
					map: THREE.ImageUtils.loadTexture( 'img/galaxy.png' )
				});
			
				materials.color.setHSL(hueValues[i], DEF_SATURATION, DEF_BRIGHTNESS);
				var particles = new THREE.ParticleSystem( geometry, materials );
				particles.myMaterial = materials;
				particles.myLevel = scene.children[i].myLevel;
				particles.mySubset = scene.children[i].mySubset;
				particles.position.x = 0;
				particles.position.y = 0;
				particles.position.z = scene.children[i].position.z;
				particles.needsUpdate = 0;
				scene.remove( scene.children[i] )
				scene.add( particles );

			}
		}
	}

	camera.position.z = 0
	
	camera.position.y += camera.rotation.x * speed 
	camera.position.x -= camera.rotation.y * speed 


	

	//camera.position.z = -1000+500*Math.sin( time/100 )

	vr.pollState( vrstate )
	//console.log( vrstate )
	//controls.update( Date.now() - time, polled ? vrstate : null )
	effect.render( scene, camera );

}

///////////////////////////////////////////////
// Hopalong Orbit Generator
///////////////////////////////////////////////			
function updateOrbit(){
	generateOrbit();
	for (var s = 0; s < NUM_SUBSETS; s++){
		hueValues[s] = Math.random();
	}
	for( i = 0; i < scene.children.length; i++ ) {
		scene.children[i].needsUpdate = 1;
	}

}

function generateOrbit(){
	var x, y, z, x1;
	var idx = 0;

	prepareOrbit();
	
	// Using local vars should be faster
	var al = a;
	var bl = b;
	var cl = c;
	var dl = d;
	var el = e;
	var subsets = orbit.subsets;
	var num_points_subset_l = NUM_POINTS_SUBSET;
	var num_points_l = NUM_POINTS;
	var scale_factor_l = SCALE_FACTOR;
	
	var xMin = 0, xMax = 0, yMin = 0, yMax = 0;

	for (var s = 0; s < NUM_SUBSETS; s++){
	
		// Use a different starting point for each orbit subset
		x = s * .005 * (0.5-Math.random());
		y = s * .005 * (0.5-Math.random());
		
		var curSubset = subsets[s];
		
		for (var i = 0; i < num_points_subset_l; i++){
		
			// Iteration formula (generalization of the Barry Martin's original one)
			z = (dl + Math.sqrt(Math.abs(bl * x - cl)));
			if (x > 0) {x1 = y - z;}
			else if (x == 0) {x1 = y;}
			else {x1 = y + z;}
			y = al - x;
			x = x1 + el;		

			curSubset[i].x = x;
			curSubset[i].y = y;
			
			if (x < xMin) {xMin = x;}
			else if (x > xMax) {xMax = x;}
			if (y < yMin) {yMin = y;}
			else if (y > yMax) {yMax = y;}
			
			idx++;
		}
	}
					
	var scaleX = 2 * scale_factor_l / (xMax - xMin);
	var scaleY = 2 * scale_factor_l / (yMax - yMin);
	
	orbit.xMin = xMin;
	orbit.xMax = xMax;
	orbit.yMin = yMin;
	orbit.yMax = yMax;
	orbit.scaleX = scaleX;
	orbit.scaleY = scaleY;
	
	// Normalize and update vertex data				
	for (var s = 0; s < NUM_SUBSETS; s++){
		var curSubset = subsets[s];
		for (var i = 0; i < num_points_subset_l; i++){
			curSubset[i].vertex.x = scaleX * (curSubset[i].x - xMin) - scale_factor_l;
			curSubset[i].vertex.y = scaleY * (curSubset[i].y - yMin) - scale_factor_l;
			curSubset[i].vertex.z = 30*(Math.random())
		}
	}
}

function prepareOrbit(){
	shuffleParams();
	orbit.xMin = 0;
	orbit.xMax = 0;
	orbit.yMin = 0;
	orbit.yMax = 0;
}

function shuffleParams() {
	a = A_MIN + Math.random() * (A_MAX - A_MIN);
	b = B_MIN + Math.random() * (B_MAX - B_MIN);
	c = C_MIN + Math.random() * (C_MAX - C_MIN);
	d = D_MIN + Math.random() * (D_MAX - D_MIN);
	e = E_MIN + Math.random() * (E_MAX - E_MIN);
}


function onKeyDown(event){
	if(event.keyCode == 38 && speed < 20) speed += .5;
	else if(event.keyCode == 40 && speed > 0) speed -= .5;
	else if(event.keyCode == 37) rotationSpeed += .001;
	else if(event.keyCode == 39) rotationSpeed -= .001;
	else if(event.keyCode == 32 ) { speed = 0 };
}