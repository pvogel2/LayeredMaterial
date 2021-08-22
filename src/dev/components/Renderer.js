import React, { useEffect } from 'react';

function Renderer() {
    const GRASS01_JPG = '/dev/images/grass01.jpg';
    const GRASS02_JPG = '/dev/images/grass02.jpg';
    const GRASS1BUMP_PNG = '/dev/images/grass01_bump256.png';
    const GRASS2BUMP_PNG = '/dev/images/grass02_bump256.png';
    const ROCK2BUMP_PNG = '/dev/images/rock02_bump256.png';
    
    const ROCK01_JPG = '/dev/images/rock01.jpg';
    const ROCK02_JPG = '/dev/images/rock02.jpg';
    
    function createGeometry() {
        const size = 10;
        const min = new THREE.Vector3();
        const max = new THREE.Vector3();
        const geometry  = new THREE.PlaneGeometry( 5, 5, 10 , 10 );
    
        const uv = [];
    
        for (let i = 0; i < geometry.attributes.uv.count; i++) {
          uv.push(i % (size + 1), (size - Math.floor(i / (size + 1))));
        }
    
        const position = geometry.attributes.position;
    
        for (let i = 0; i < position.count * position.itemSize; i+=3) {
          const v = new THREE.Vector3(
            position.array[i],
            position.array[i+1],
            position.array[i+2]
          );
          min.min(v);
          max.max(v);
        }
        console.log(min, max);
    
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
        geometry.computeVertexNormals();
        return geometry;
      }
    
    function createMaterial() {
      const layers = [
        new MaterialLayer({
          id: 'grass',
          range: [-2.5, 0],
          rangeTrns: [0, 0.5],
          //slope:[0.0, 0.2],
          slope:[0, 1],
          slopeTransition: 0.0,
          map: [GRASS01_JPG, GRASS02_JPG],
          bumpMap: [GRASS1BUMP_PNG, GRASS2BUMP_PNG],
          bumpScale: 0.04,
        }),
        new MaterialLayer({
          id: 'rock',
          range:[0, 2.0],
          rangeTrns: [0.5, 0.5],
          slope:[0, 1],
          map: [ROCK01_JPG, ROCK02_JPG],
          bumpMap: [ROCK2BUMP_PNG],
          bumpScale: 0.08,
        }),
      ];
    
      return new MeshLayeredMaterial({ layers, side: THREE.DoubleSide, wireframe: false, bumpScale: 1 });
    }
    
    function createTestMesh(scene) {
      const geometry = createGeometry();
      const material = createMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.receiveShadow = true;
      // mesh.rotateY(-3.14 * 0.5);
      const sunLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      sunLight.castShadow = true;
      sunLight.position.set(-10, 10, 10);
      const sunHelper = new THREE.DirectionalLightHelper( sunLight, 5 );
    
      scene.add( mesh );
      scene.add( sunLight );
      scene.add( sunHelper );
    
      return { mesh, sunLight, sunHelper };
    }

    useEffect(() => { 
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        
        const controls = new THREE.OrbitControls( camera, renderer.domElement );
        
        document.body.appendChild( renderer.domElement );

        function onWindowResize() {
            const rects = document.body.getClientRects();
            if (rects.length) {
              const width = rects[0].width;
              const height = rects[0].height;
              renderer.setSize( width, height );
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
            }
           }
          
        window.addEventListener( 'resize', onWindowResize, false );
          
        createTestMesh(scene);

        camera.position.z = 5;
        controls.update();
        
        function animate() {
          requestAnimationFrame( animate );
        
          controls.update();
        
          renderer.render( scene, camera );
        };
        animate();
    }, []);
        
    return (
      <div className="Renderer"></div>
    );
  }
  
  export default Renderer;