import React, { useEffect } from 'react';
import { connect } from 'react-redux';

function Renderer(props) {
  const {dispatch } = props;

  const TEST01_JPG = '/images/testpattern.jpg';
  const GRASS01_JPG = '/images/grass01.jpg';
  const GRASS02_JPG = '/images/grass02.jpg';
  const GRASS1BUMP_PNG = '/images/grass01_bump256.png';
  const GRASS2BUMP_PNG = '/images/grass02_bump256.png';
  const ROCK2BUMP_PNG = '/images/rock02_bump256.png';
  
  const ROCK01_JPG = '/images/rock01.jpg';
  const ROCK02_JPG = '/images/rock02.jpg';
  const ISLAND_PNG = '/images/island.png';

  function createLandscapeGeometry() {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        console.log('img loaded');

        const width = img.width;
        const height = img.height;
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
    
        const ctx = c.getContext( '2d' );
        ctx.drawImage(img, 0, 0);
    
        const imgData = ctx.getImageData(0, 0, width, height);
        const pixels = imgData.data;
        const data = [];
    
        let j = 0;
        let maxValue = 0;
        let minValue = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          let p = pixels[i] / 255 + pixels[i + 1];
          if (i === 0) {
            maxValue = minValue = p;
          }  
    
          maxValue = Math.max(maxValue, p);
          minValue = Math.min(minValue, p);
          data[j++] = p;
        }
        const range = maxValue - minValue;
        const scale = 10 / range;
        const offset = minValue + range * 0.5;
        const position = [];
        const indices = [];
        const uvs = [];
        const scaledMin = Math.trunc( 0.98 * 10 * scale * (minValue - offset - 10)) / 10;
        const scaledMax = Math.trunc( 1.02 * 10 * scale * (maxValue - offset - 10)) / 10;

        dispatch({ type: 'SET_MINMAX', payload: [scaledMin, scaledMax] }); // extend minmax a little bit to prevent edge cases

        for (let h = 0; h < height; h++) {
          for (let w = 0; w < width; w++) {
            const idx = h * width + w;
            uvs.push(w / width * 50, 1 - h / height * 50);
            position.push((w - 0.5 * width) * scale * 0.1, (data[idx] - offset - 10) * scale, (h - 0.5 * height) * scale * 0.1);
            if (w < width - 1 && h < height - 1) {
              indices.push(idx, idx + width, idx + 1);
              indices.push(idx + 1, idx + width, idx + width + 1);
            }
          }
        }
        const geo  = new THREE.BufferGeometry();
        geo.setIndex( indices );
        geo.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
        geo.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
        geo.computeVertexNormals();
        resolve(geo);
      }
      img.src = ISLAND_PNG;
    });
  }

  function createPlaneGeometry() {
    const size = 10;
    const min = new THREE.Vector3();
    const max = new THREE.Vector3();
    const geometry  = new THREE.PlaneGeometry( 5, 5, 10 , 10 );

    const uv = [];

    for (let i = 0; i < geometry.attributes.uv.count; i++) {
      uv.push(i % (size + 1), (size - Math.floor(i / (size + 1))));
    }
  
    /* const position = geometry.attributes.position;
  
    for (let i = 0; i < position.count * position.itemSize; i+=3) {
      const v = new THREE.Vector3(
        position.array[i],
          position.array[i+1],
          position.array[i+2]
        );
        min.min(v);
        max.max(v);
      } */
  
    geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
    geometry.computeVertexNormals();
    return geometry;
  }

    function creatSphereGeometry() {
      const size = 10;
      const geometry  = new THREE.SphereGeometry( 2.5, 64, 32 );
  
      const uv = [];
  
      for (let i = 0; i < geometry.attributes.uv.count * 2; i++) {
        uv.push(geometry.attributes.uv.array[i] * size);
      }
  
      geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
      geometry.computeVertexNormals();
      return geometry;
    }

    async function createGeometry() {
      return createLandscapeGeometry();
      return creatSphereGeometry();
      return createPlaneGeometry();
    }

    function createMaterial() {
      const layers = [
        new MaterialLayer({
          id: 'grass',
          range: [-10, -2],
          rangeTrns: [0, 0],
          //slope:[0.0, 0.2],
          slope:[0, 1],
          slopeTransition: [0, 0],
          map: [GRASS01_JPG, GRASS02_JPG],
          bumpMap: [GRASS1BUMP_PNG, GRASS2BUMP_PNG],
          bumpScale: 0.04,
        }),
        new MaterialLayer({
          id: 'rock',
          range:[-2, 10],
          rangeTrns: [0, 0],
          slope:[0, 1],
          map: [ROCK01_JPG, ROCK02_JPG],
          bumpMap: [ROCK2BUMP_PNG],
          bumpScale: 0.08,
        }),
        /*new MaterialLayer({
          id: 'test',
          //range: [1, 2.5],
          //rangeTrns: [0, 0],
          //slope:[0.0, 0.2],
          //slope:[0, 1],
          // slopeTrns: 0.0,
          map: [TEST01_JPG],
          bumpMap: [GRASS1BUMP_PNG],
          bumpScale: 0.08,
        }),*/
      ];

      // return new THREE.MeshStandardMaterial();
      return new MeshLayeredMaterial({ layers, side: THREE.DoubleSide, wireframe: false, bumpScale: 1 });
    }
    
    async function createTestMesh(scene) {
      const geometry = await createGeometry();
      const material = createMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.receiveShadow = true;
      const sunLight = new THREE.DirectionalLight( 0xffffff, 1.3 );
      sunLight.castShadow = true;
      sunLight.position.set(-10, 10, 10);
      const sunHelper = new THREE.DirectionalLightHelper( sunLight, 3 );

      const ambientLight = new THREE.AmbientLight( 0x090909 );
    
      scene.add( mesh );
      scene.add( ambientLight );
      scene.add( sunLight );
      scene.add( sunHelper );

      dispatch({ type: 'SET_MATERIAL', payload: material });
    
      return { mesh, sunLight, sunHelper };
    }

    useEffect(async () => { 
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
  
        await createTestMesh(scene);

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
  
  export default connect()(Renderer);