import * as THREE from 'three';

import {
  triplanar_common_pars,
  triplanar_pars_vertex,
  triplanar_pars_fragment,
  triplanar_fragment_begin,
  triplanar_begin_vertex,
  noise_pars_fragment,
  mixuv_pars_fragment,
  mixuv_fragment_begin,
  bump_pars_fragment,
} from './ShaderChunk';

class MeshLayeredMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    super();
    this.type = 'MeshLayeredMaterial';

    this.layers = parameters.layers ? parameters.layers : [];

    this.defines = {
      USE_UV: '', // enables vUv
      USE_MIXUV: '',
      USE_TRIPLANAR: '',
      USE_BUMPMAP: '',
    };

    this.lights = true; // enable light usage in shaders

    this.direction = parameters.direction || new THREE.Vector3( 0.0, 1.0, 0.0 );

    this.useBump = this.layers.reduce((acc, l) => acc || l.useBump, false);

    this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["common" ], // for lighting diffuse needs to be set ,done here with white
      THREE.UniformsLib["lights" ],
      THREE.UniformsLib["bumpmap" ],
      {
        lyrDirection: { value: this.direction },
        specular: { value: new THREE.Color( 0xffffff )},
        shininess: { value: 30.0 },
        specularStrength: { value: 0.2 }, // TODO: per layer, support for textures
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
    if (typeof layer.enabled !== undefined) {
      this.setVertexShader();
      this.setFragmentShader();
      this.needsUpdate = true;
    }
  }

  setVertexShader() {
    this.vertexShader = /* glsl */`
    #include <uv_pars_vertex> // defines vUv

    #include <normal_pars_vertex> // defines vNormal


    #include <shadowmap_pars_vertex> // needed if sspotlights are in use 

    #ifdef USE_BUMPMAP
      #define BUMPMAP_UV vUv // define uv coords, normaly defined by existing bump map in material
    #endif

    ${triplanar_common_pars}

    uniform vec3 lyrDirection;

    varying vec3 vViewPosition;

    varying float height;
    varying float slope;

    ${triplanar_pars_vertex}

    void main() {
      #include <uv_vertex> // refers to vUv

      #include <beginnormal_vertex> // defines objectNormal from normal
      #include <defaultnormal_vertex> // defines transformedNormal from objectNormal

      #include <begin_vertex> // defines transformed
      #include <project_vertex> // defines mvPosition, uses transformed, sets gl_Position

      // #include <shadowmap_vertex> // experimental

      ${triplanar_begin_vertex}

      #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
    	  vNormal = normalize( transformedNormal );
      #endif

      height = dot(lyrDirection, position);
      slope = 1. - 0.99 * dot(lyrDirection, normalize(normal));

      vViewPosition = - mvPosition.xyz;
    }
    `;
  }

  setFragmentShader() {
    let layerUniforms = '';
    let layerDiffuseColors = '';
    let layerHeights = '';
    let layerSlopes = '';
    let layerNormals = 'vec3(0.)';

    let layerDiffuseMixes = 'lyr_baseColor';
    const layerBaseColor = 'vec4(0., 0., 0., 1.)';
    const heightName = 'height';
  
    this.layers.forEach((l) => {
      if (!l.enabled) {
        return;
      }

      layerUniforms += l.addFragmentUniforms();

      if (l.useDiffuse) {
        layerHeights += l.addFragmentHeight(heightName);
        layerSlopes += l.addFragmentSlope();

        layerDiffuseMixes = l.mixinFragmentDiffuse(layerDiffuseMixes);
    
        layerDiffuseColors += l.addDiffuseColor();
      }

      layerNormals += `+ ${l.addBumpNormal()}`;
    });

    this.fragmentShader = `
    #include <common>
    #include <packing> // defines methods used in shadowmap_pars_fragment
    #include <uv_pars_fragment> // refers to vUv
    #include <normal_pars_fragment>
    #include <bumpmap_pars_fragment>
    // #include <lightmap_pars_fragment> // experimental
    #include <shadowmap_pars_fragment> // if shadow maps enabled in renderer

    #include <bsdfs> // define lighting function used by phong
    #include <lights_phong_pars_fragment> // define light calcuation functions for lights pars, based on phong
    #include <lights_pars_begin>

    uniform vec3 diffuse; // used by diffuseColor
    uniform vec3 emissive;
    uniform vec3 specular; // used by phong lighting
    uniform float specularStrength; // used by phong lighting
    uniform float shininess; // used by phong lighting
    uniform float opacity; // used by diffuseColor

    ${noise_pars_fragment}

    ${mixuv_pars_fragment}

    ${triplanar_common_pars}
  
    ${triplanar_pars_fragment}
  
    ${layerUniforms}
  
    ${bump_pars_fragment}

    varying float height;
    varying float slope;

    #ifdef USE_TRIPLANAR
      vec4 getTexture2D(sampler2D tex) {
        return triplanar(tex, trplUV);
      }
    #elif defined USE_MIXUV
      vec4 getTexture2D(sampler2D tex) {
        return vec4(mix(texture2D(tex , vUvCent).rgb, texture2D(tex , vUvCorn).rgb, vUvMixThreshold), 1.);
      }
    #else
      vec4 getTexture2D(sampler2D tex) {
        return texture2D(tex , vUv);
      }
    #endif

    void main() {
      ${mixuv_fragment_begin}

      ${triplanar_fragment_begin}

      vec4 diffuseColor = vec4( diffuse, opacity ); // used by phong lighting

      #include <normal_fragment_begin> // normal vector defind here from vNormal

      // initialize light processing
    	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;

      ${layerDiffuseColors}

      ${layerHeights}

      ${layerSlopes}

      #ifdef USE_BUMPMAP
        // TODO: find correct sollution for slope and height ranges
        normal = normalize(${layerNormals});
      #endif

      // accumulation
      #include <lights_phong_fragment>
      #include <lights_fragment_begin>
      // #include <lights_fragment_maps>
      #include <lights_fragment_end>

      vec4 lyr_baseColor = ${layerBaseColor};

      vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance + reflectedLight.directSpecular + reflectedLight.indirectSpecular;

      gl_FragColor = vec4( outgoingLight, diffuseColor.a ) * ${layerDiffuseMixes};
    }
    `;
  }  
}


MeshLayeredMaterial.prototype.isMeshLayeredMaterial = true;
MeshLayeredMaterial.prototype.isShaderMaterial = true; // this skips update of uniforms, handle on your own!

export default MeshLayeredMaterial;
