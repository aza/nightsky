if( !window.nightsky ) window.nightsky = {}

;(function(nightsky){

	var windowHalfX = window.innerWidth / 2,
  		windowHalfY = window.innerHeight / 2

	nightsky.controls = {
		mouse: {x: undefined, y: undefined},

		onKeyDown: function(){
			console.log('key' + event.keyCode);

	    switch (event.keyCode) {
	      case 79: // O
	        SKY.oculus = (SKY.oculus) ? false : true;
	        onWindowResize();
	      break;
	    }
		},

		onWindowResize: function(){
	    nightsky.camera.aspect = window.innerWidth / window.innerHeight;
	    nightsky.camera.updateProjectionMatrix();

	    nightsky.renderer.setSize( window.innerWidth, window.innerHeight );			
		},

		onDocumentMouseMove: function(event){
			nightsky.controls.mouse.x = event.clientX - windowHalfX;
			nightsky.controls.mouse.y = event.clientY - windowHalfY;
		}
	}

})(window.nightsky)