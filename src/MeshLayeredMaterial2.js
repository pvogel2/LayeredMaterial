import * as THREE from 'three';

class MeshLayeredMaterial2 extends THREE.ShaderMaterial {
  constructor(parameters) {
    super();
    this.type = 'MeshLayeredMaterial2';

    this.layers = parameters.layers ? parameters.layers : [];

    this.defines = {
      USE_UV: '', // enables vUv
    };

    this.direction = parameters.direction || new THREE.Vector3( 0.0, 1.0, 0.0 );

    this.uniforms = THREE.UniformsUtils.merge([
      // THREE.UniformsLib["common" ],
      // THREE.UniformsLib["lights" ],
      // THREE.UniformsLib["bumpmap" ],
      {
        lyrDirection: { value: this.direction },
      }
    ]);

    this.layers.forEach((l) => l.extendUniforms(this.uniforms));

    this.setVertexShader();
    this.setFragmentShader();
    console.log('--------------------------------------');
    console.log(this.vertexShader);
    console.log('--------------------------------------');
    console.log(this.fragmentShader);
    console.log('--------------------------------------');
    this.setValues( parameters );
  }

  get vUVName() {
    return 'vUv';
  }

  /**
   * Change parameters on runtime
   * 
   * @param {*} layer 
   */
  updateLayer(layer) {
    if (layer.range) {
      this.uniforms[layer.rangeName].value.set(layer.range[0], layer.range[1]);
      this.uniformsNeedUpdate = true;
    }
    if (layer.rangeTrns) {
      this.uniforms[layer.rangeTrnsName].value.set(layer.rangeTrns[0], layer.rangeTrns[1]);
      this.uniformsNeedUpdate = true;
    }
    if (layer.slope) {
      this.uniforms[layer.slopeName].value.set(layer.slope[0], layer.slope[1]);
      this.uniformsNeedUpdate = true;
    }
    if (layer.slopeTrns) {
      this.uniforms[layer.slopeTrnsName].value.set(layer.slopeTrns[0], layer.slopeTrns[1]);
      this.uniformsNeedUpdate = true;
    }
    if (layer.slopeDstrbStrength) {
      this.uniforms[layer.slopeDstrbStrengthName].value.set(layer.slopeDstrbStrength[0], layer.slopeDstrbStrength[1]);
      this.uniformsNeedUpdate = true;
    }
    if (layer.slopeDstrbOctaves) {
      this.uniforms[layer.slopeDstrbOctavesName].value.set(layer.slopeDstrbOctaves[0], layer.slopeDstrbOctaves[1]);
      this.uniformsNeedUpdate = true;
    }
  }

  setVertexShader() {
    this.vertexShader = /* glsl */`
    #include <uv_pars_vertex> // defines vUv 

    // from LayeredMaterial
    uniform vec3 lyrDirection;

    varying float height;

    void main() {
      #include <uv_vertex> // refers to vUv

      height = dot(lyrDirection, position);    

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
  }

  setFragmentShader() {
    let layerUniforms = '';
    let layerDiffuseColors = '';
    let layerHeights = '';

    let layerDiffuseMixes = 'lyr_baseColor';
    const layerBaseColor = 'vec4(0., 0., 0., 1.)';
    const heightName = 'height';
  
    this.layers.forEach((l) => {
      layerUniforms += l.addFragmentUniforms();
      if (l.useDiffuse) {

        layerHeights += l.addFragmentHeight(heightName);

        layerDiffuseMixes = l.mixinFragmentDiffuse(layerDiffuseMixes);
    
        layerDiffuseColors += l.addFragmentDiffuseColor(this.vUVName);
      }
    });

    this.fragmentShader = `
    #include <uv_pars_fragment> // refers to vUv
  
    ${layerUniforms}

    varying float height;

    void main() {
      //layerDiffuseColors
      ${layerDiffuseColors}

      // layerHeights
      ${layerHeights}

      vec4 lyr_baseColor = ${layerBaseColor};

      gl_FragColor = ${layerDiffuseMixes}; // vec4(lyr_sample${this.layers[0].id}.xyz, 1.0 );
    }
    `;
  }  
}

MeshLayeredMaterial2.prototype.isMeshLayeredMaterial2 = true;
MeshLayeredMaterial2.prototype.isShaderMaterial = true; // this skips update of uniforms, handle on your own!

export default MeshLayeredMaterial2;
