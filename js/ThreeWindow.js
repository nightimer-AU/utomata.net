// import * as THREE from 'https://unpkg.com/three/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

function ThreeWindow(_containerId){

  var _this = this;
  var canvas;
  var container, stats;
  var scene, camera, renderer, geometry, texture;
  var particleUniforms;
  var containerId;
  var controls;
  var particles;
  var positions;
  var WIDTH = 64;
  var HEIGHT = 64;
  var PARTICLES = WIDTH*HEIGHT;
  var params = {x: "V.x", y:"V.y", z: "V.z", r: "V.r", g:"V.g", b:"V.b", w: "5.0", i: "64.0", j: "64.0"};


  this.setParams = function(r,g,b,x,y,z,w, i, j){
    params.r = r;
    params.g = g;
    params.b = b;
    params.x = x;
    params.y = y;
    params.z = z;
    params.w = w;
    params.i = i;
    params.j = j;
    _this.reset(i, j);
  }


  this.reset = function(w, h){

    while(scene.children.length > 0){
      scene.remove(scene.children[0]);
    }

    WIDTH = w;
    HEIGHT = h;
    PARTICLES = w*h;

    positions = new Float32Array( PARTICLES * 3 );
    var p = 0;

    for ( var i = 0; i < PARTICLES; i ++ ) {

      positions[ p ++ ] = ( Math.random() * 2 - 1 ) * 10.0;
      positions[ p ++ ] = 0; //( Math.random() * 2 - 1 ) * 10.0;
      positions[ p ++ ] = ( Math.random() * 2 - 1 ) * 10.0;

    }

    var uvs = new Float32Array( PARTICLES * 2 );
    p = 0;

    for ( var j = 0; j < WIDTH; j ++ ) {

      for ( var i = 0; i < WIDTH; i ++ ) {

        uvs[ p ++ ] = i / ( WIDTH - 1 );
        uvs[ p ++ ] = j / ( WIDTH - 1 );

      }

    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    particleUniforms = {
      "texturePosition": { value: null },
      "textureVelocity": { value: null },
      "cameraConstant": { value: getCameraConstant( camera ) },
      "density": { value: 0.0 }
    };

    // ShaderMaterial
    var material = new THREE.ShaderMaterial( {
      uniforms: particleUniforms,

      // vertexShader: document.getElementById( 'particleVertexShader' ).textContent,
      // fragmentShader: document.getElementById( 'particleFragmentShader' ).textContent
      vertexShader: getVertShader(),
      fragmentShader: getFragShader()
    } );

    material.drawBuffers = true;

    particles = new THREE.Points( geometry, material );
    particles.matrixAutoUpdate = false;
    particles.updateMatrix();

    scene.add( particles );
  }

  this.init = function(_containerId) {

    containerId = _containerId;
    // container = document.createElement( 'div' );
    container = document.getElementById(containerId);

    camera = new THREE.PerspectiveCamera( 75, container.innerWidth / container.innerHeight, 5, 15000 );
    // camera = new THREE.OrthographicCamera( 500 / - 2, 500 / 2, 500 / 2, 500 / - 2, 1, 1000 );
    camera.position.y = 0;
    camera.position.z = 200;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.innerWidth, container.innerHeight );
    container.appendChild( renderer.domElement );
    // scene.background = new THREE.Color( 0xDADAD4 );
    scene.background = new THREE.Color( 0x111111 );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableKeys = false;

    // TODO: this is terrible!
    $("#threeWindow").resize(function(){_this.onWindowResize()});

    // CANVAS
    canvas = document.getElementById('mainCanvas');
    texture = new THREE.Texture(canvas);

    geometry = new THREE.BufferGeometry();

    // scene.add(
    //   new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ),
    //   new THREE.MeshBasicMaterial( {color: 0xffffff} ) )
    // );

    const _geometry = new THREE.BoxGeometry( 100, 100, 100 );
    const _material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const _cube = new THREE.Mesh( _geometry, _material );
    scene.add( _cube );

    _this.reset(WIDTH, WIDTH);

    animate();
  }

  function animate(){
    requestAnimationFrame( animate );
    render();
  }

  function render() {

    texture.needsUpdate = true;

    particleUniforms[ "texturePosition" ].value = texture;
    //particleUniforms[ "textureVelocity" ].value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;

    renderer.render( scene, camera );
  }


  this.onWindowResize = function() {

    var w = $(container).innerWidth();
    var h = $(container).innerHeight();
    camera.aspect = w /h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
    particleUniforms[ "cameraConstant" ].value = getCameraConstant( camera );
  }

  function getCameraConstant( camera ) {
    return $(container).innerHeight() / ( Math.tan( THREE.Math.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );
  }


  function getFragShader(){
    return `
    varying vec4 vColor;
    void main() {
      float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
      if ( f > 0.5 ) {
        discard;
      }
      gl_FragColor = vColor * (1.0 - f);
    }
    `;
  }

  function getVertShader(){
    return `
    #include <common>
    uniform sampler2D texturePosition;
    uniform float cameraConstant;
    varying vec4 vColor;

    void main() {

      vec4 V = texture2D( texturePosition, uv );
      vec2 cell = uv;

      vColor = vec4( `+params.r+`, `+params.g+`, `+params.b+`, 1.0 );

      gl_PointSize = `+params.w+`;

      vec4 mvPosition = vec4( (`+params.x+`)*100.0 - 50.0, (`+params.y+`)*100.0 - 50.0, (`+params.z+`)*100.0 - 50.0, 1.0 );

      gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
    }
    `
  }






}
