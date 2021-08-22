const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

const controls = new THREE.OrbitControls( camera, renderer.domElement );

document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

const objects = createTestMesh();

camera.position.z = 5;
controls.update();

function animate() {
  requestAnimationFrame( animate );

  controls.update();

  renderer.render( scene, camera );
}

function onWindowResize() {
  const rects = document.body.getClientRects();
  if (rects.length) {
    width = rects[0].width;
    height = rects[0].height;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
 }

window.addEventListener( 'resize', onWindowResize, false );

animate();
