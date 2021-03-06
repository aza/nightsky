window.nightsky = {}

;(function(nightsky){
	nightsky.constants = {
		SCALE_FACTOR: 1000,
		CAMERA_BOUND: 200,
		
		NUM_POINTS_SUBSET: 50000,
		NUM_SUBSETS: 10,

		NUM_LEVELS: 5,
		LEVEL_DEPTH: 800,

		DEF_BRIGHTNESS: .7,
		DEF_SATURATION: .7,

		A_MIN: -30,
		A_MAX: 30,
		B_MIN: .2,
		B_MAX: 1.8,
		C_MIN: 5,
		C_MAX: 17,
		D_MIN: 0,
		D_MAX: 10,
		E_MIN: 0,
		E_MAX: 12
	}

	nightsky.constants.NUM_POINTS = nightsky.constants.NUM_POINTS_SUBSET * nightsky.constants.NUM_SUBSETS

	nightsky.orbitParams = {}
	nightsky.orbit = {
		subsets: [],
		xMin: 0,
		xMax: 0,
		yMin: 0,
		yMax: 0,
		scaleX: 0,
		scaleY: 0
	}

	nightsky.layerSpeed = 0.2
	nightsky.layerRotationDelta = 0

	// Initialize data points
	nightsky.initDataPoints = function(){
		var C = nightsky.constants,
				i, j

		for (i = 0; i < C.NUM_SUBSETS; i++){
			var subsetPoints = [];
			for (j = 0; j < C.NUM_POINTS_SUBSET; j++){
				subsetPoints[j] = {
					x: 0,
					y: 0, 
					vertex: new THREE.Vector3(0,0,0)
				}
			}
			nightsky.orbit.subsets.push(subsetPoints);
		}
	}
				
	nightsky.initDataPoints()

	function particleMaterial(){
		return new THREE.ParticleBasicMaterial({
			size: (1),
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent : true,
			map: THREE.ImageUtils.loadTexture( 'img/galaxy.png' )
		});
	}

	var effect;
	var camera, scene, renderer, hueValues = [];

	var vrstate = new vr.State();

	vr.load(function(error){
		init();
		animate();
	})

	function init() {
		var container = document.createElement( 'div' ),
				C = nightsky.constants,
				particles
		
		document.body.appendChild( container )

		camera = new THREE.PerspectiveCamera( 180, window.innerWidth / window.innerHeight, 0, 3 * C.SCALE_FACTOR );
		camera.position.z = C.SCALE_FACTOR/2;

		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0x000000, 0.0011);

		generateOrbit();
		
		eachSubset(function(subset, s){ hueValues[s] = Math.random() })
		
		// Create particle systems
		for (var k = 0; k < C.NUM_LEVELS; k++){
			eachSubset(function(subset, s){
				var geometry = new THREE.Geometry(),
						material = particleMaterial()
				
				geometry.vertices = subset.map(function(point){
					return point.vertex
				})
			
				material.color.setHSL(hueValues[s], C.DEF_SATURATION, C.DEF_BRIGHTNESS);
				particles = new THREE.ParticleSystem( geometry, material );
				particles.myMaterial = material;
				particles.myLevel = k;
				particles.mySubset = s;
				particles.position.x = 0;
				particles.position.y = 0;
				particles.position.z = - C.LEVEL_DEPTH * k - (s  * C.LEVEL_DEPTH / C.NUM_SUBSETS);
				particles.needsUpdate = 0;
				scene.add( particles );
			})
		}

		// Setup renderer and effects
		renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialiawws: true } );
		renderer.setSize( window.innerWidth, window.innerHeight );
		

		container.appendChild( renderer.domElement );

		setInterval(updateOrbit, 7000);

		effect = new THREE.OculusRiftEffect( renderer );
		scene.add( camera );

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
		var C = nightsky.constants,
				rotation = new THREE.Quaternion(),
				angles = new THREE.Euler()

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

		camera.rotation.x = rotation.x
		camera.rotation.y = rotation.y
		camera.rotation.z = rotation.z


		scene.children.forEach(function(child, i){
			child.position.z +=  nightsky.layerSpeed;
			child.rotation.z +=  nightsky.layerRotationDelta

			if (child.position.z > camera.position.z){
				child.position.z = - (C.NUM_LEVELS -1) * C.LEVEL_DEPTH;

				if (child.needsUpdate == 1){
					child.geometry.__dirtyVertices = true;	
					child.myMaterial.color.setHSL( hueValues[child.mySubset], C.DEF_SATURATION, C.DEF_BRIGHTNESS);
					child.needsUpdate = 0;
					child.rotation.z += 20
					
					var geometry = new THREE.Geometry(),
							material = particleMaterial()
					for (var j = 0; j < C.NUM_POINTS_SUBSET; j++){geometry.vertices.push( nightsky.orbit.subsets[1][j].vertex);}
				
					material.color.setHSL(hueValues[i], C.DEF_SATURATION, C.DEF_BRIGHTNESS);
					var particles = new THREE.ParticleSystem( geometry, material );
					particles.myMaterial = material;
					particles.myLevel = child.myLevel;
					particles.mySubset = child.mySubset;
					particles.position.x = 0;
					particles.position.y = 0;
					particles.position.z = child.position.z;
					particles.needsUpdate = 0;
					scene.remove( child )
					scene.add( particles );
				}
			}
		})

		camera.position.z = 0
		camera.position.y += camera.rotation.x * nightsky.layerSpeed 
		camera.position.x -= camera.rotation.y * nightsky.layerSpeed

		vr.pollState( vrstate )
		effect.render( scene, camera );

	}

	///////////////////////////////////////////////
	// Hopalong Orbit Generator
	///////////////////////////////////////////////

	function eachSubset(iterator){
		var s = 0
		for(;s < nightsky.constants.NUM_SUBSETS; s++){
			iterator(nightsky.orbit.subsets[s], s)
		}
	}

	function updateOrbit(){
		generateOrbit();
		
		eachSubset(function(subset, index){
			hueValues[index] = Math.random();
		})
		
		scene.children.forEach(function(child){
			child.needsUpdate = 1;
		})
	}

	function generateOrbit(){
		var C = nightsky.constants

		prepareOrbit();
		
		var subsets = nightsky.orbit.subsets,		
				xMin = 0, xMax = 0, yMin = 0, yMax = 0;

		eachSubset(function(subset, index){
			// Use a different starting point for each orbit subset
			var x = index * .005 * (0.5-Math.random()), 
					y = index * .005 * (0.5-Math.random()),
					z, x1
			
			subset.forEach(function(point){
				// Iteration formula (generalization of the Barry Martin's original one)
				z = (nightsky.orbitParams.d + Math.sqrt(Math.abs(nightsky.orbitParams.b * x - nightsky.orbitParams.c)));
				if (x > 0) {x1 = y - z;}
				else if (x == 0) {x1 = y;}
				else {x1 = y + z;}
				y = nightsky.orbitParams.a - x;
				x = x1 + nightsky.orbitParams.e;		

				point.x = x;
				point.y = y;
				
				xMin = Math.min( xMin, x )
				xMax = Math.max( xMax, x )
				yMin = Math.min( yMin, y )
				yMax = Math.max( yMax, y )
			})
		})

		var scaleX = 2 * C.SCALE_FACTOR / (xMax - xMin);
		var scaleY = 2 * C.SCALE_FACTOR / (yMax - yMin);
		
		nightsky.orbit.xMin = xMin;
		nightsky.orbit.xMax = xMax;
		nightsky.orbit.yMin = yMin;
		nightsky.orbit.yMax = yMax;
		nightsky.orbit.scaleX = scaleX;
		nightsky.orbit.scaleY = scaleY;
		
		// Normalize and update vertex data				
		eachSubset(function(subset, index){
			subset.forEach(function(point){
				point.vertex.x = scaleX * (point.x - xMin) - C.SCALE_FACTOR;
				point.vertex.y = scaleY * (point.y - yMin) - C.SCALE_FACTOR;
				point.vertex.z = 30 * Math.random()
			})
		})
	}

	function prepareOrbit(){
		shuffleParams();
		nightsky.orbit.xMin = 0;
		nightsky.orbit.xMax = 0;
		nightsky.orbit.yMin = 0;
		nightsky.orbit.yMax = 0;
	}

	function shuffleParams() {
		var C = nightsky.constants
		var modulate = function(){
			//return Math.sin( Date.now()*.000005 )
			return Math.random()
		}

		nightsky.orbitParams = {
			a: C.A_MIN + modulate() * (C.A_MAX - C.A_MIN),
			b: C.B_MIN + modulate() * (C.B_MAX - C.B_MIN),
			c: C.C_MIN + modulate() * (C.C_MAX - C.C_MIN),
			d: C.D_MIN + modulate() * (C.D_MAX - C.D_MIN),
			e: C.E_MIN + modulate() * (C.E_MAX - C.E_MIN)
		}
	}

	function onKeyDown(event){
		if(event.keyCode == 38 && nightsky.layerSpeed < 40) nightsky.layerSpeed += .5;
		else if(event.keyCode == 40 && nightsky.layerSpeed > -5) nightsky.layerSpeed -= .5;
		else if(event.keyCode == 37) nightsky.layerRotationDelta += .001;
		else if(event.keyCode == 39) nightsky.layerRotationDelta -= .001;
		else if(event.keyCode == 32 ) { nightsky.layerSpeed = 0 };
		console.log( event.keyCode )
	}

})(window.nightsky)