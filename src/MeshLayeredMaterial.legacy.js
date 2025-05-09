import * as THREE from 'three';

import {
  BUMPMAP_PARS_FRAGMENT,
  UV_MIX_PARS_FRAGMENT,
  UV_MIX_FRAGMENT_BEGIN,
  TRIPLANAR_PARS_VERTEX,
  TRIPLANAR,
  TRIPLANAR_FRAGMENT_BEGIN,
  TRIPLANAR_PARS_FRAGMENT,
  TRIPLANAR_COMMON,
  NORMAL_FRAGMENT_MAPS,
} from './ShaderLib.legacy';


const VERTEX_SHADER = `
// currently based on PHONG
#define LAYERED

#define USE_UV
#define USE_BUMPMAP

#define BUMPMAP_UV uv

// from LayeredMaterial
uniform vec3 lyrDirection;

varying vec3 vViewPosition;

#include <common>

${TRIPLANAR_COMMON}

#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <normal_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>

varying float height;
varying float slope;

${TRIPLANAR_PARS_VERTEX}

void main() {
  #include <uv_vertex>
	#include <color_vertex>

  #include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
	  vNormal = normalize( transformedNormal );
  #endif

  #include <begin_vertex>
  #include <project_vertex>
	#include <logdepthbuf_vertex>

  vViewPosition = - mvPosition.xyz;

  #include <worldpos_vertex>
	#include <shadowmap_vertex>

  height = dot(lyrDirection, position);
  slope = 1. - 0.99 * dot(lyrDirection, normalize(normal));

  // still a workaround to get the correct slope disturbance direction
  vUv = lyrDirection.x * position.zy + lyrDirection.y * position.zx + lyrDirection.z * position.xy; // switched direction from xz to zx
  trplNormal = normal;

  trplUV.x = position.zy; // switched direction from yz to zy
  trplUV.y = position.zx; // switched direction from xz to zx
  trplUV.z = position.xy;
}
`;

class MeshLayeredMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    super();
    this.type = 'MeshLayeredMaterial';
  
    this.color = new THREE.Color( 0xffffff ); // diffuse

    this.layers = parameters.layers ? parameters.layers : [];

    this.direction = parameters.direction || new THREE.Vector3( 0.0, 1.0, 0.0 );

    this.uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib["common" ],
      THREE.UniformsLib["lights" ],
      THREE.UniformsLib["bumpmap" ],
      {
        lyrDirection: { value: this.direction },
      }
    ]);

    this.layers.forEach((l) => l.extendUniforms(this.uniforms));

  this.defines = {
    PHONG: '',
    USE_BUMPMAP: '',
    USE_UV: '',
    USE_UV_MIX: '',
    USE_TRIPLANAR: '',
  };

  this.transparent =  false;
  this.lights = true;
  this.depthWrite = true;
  this.vertexShader = VERTEX_SHADER;

  this.bumpScale = parameters.bumpScale || 0;
  this.uniforms.bumpScale =  { value: this.bumpScale };

  this.combine = THREE.MultiplyOperation;
  this.reflectivity = 1;
  this.refractionRatio = 0.98;

  this.uniforms.specular = { value: new THREE.Color( 0x111111 )};
  this.uniforms.shininess = { value: 5 };

  this.wireframe = false;
  this.wireframeLinewidth = 1;
  this.wireframeLinecap = 'round';
  this.wireframeLinejoin = 'round';

  this.flatShading = false;

  this.uniformsNeedUpdate = true;

  this.fragmentShader = this.getFragmentShader();

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
}

sum(a, b) {
  return `${a ? `${a} + ` : a}${b}`;
}

mult(a, b) {
  return `${a ? `${a} * ` : a}${b}`;
}

// TODO: find correct sollution for slope and height ranges
//  glsl: normal = normalize(mix(${layerNormals[0].normal}, ${layerNormals[1].normal}, ${layerNormals[1].slope}));
getNormal(layerNormals) {
  let normals = '';
  layerNormals.forEach(n => {
    normals = this.sum(normals, n.normal);
  });
  return layerNormals.length
    ? `normal = normalize(${normals});`
    : ''
  ;
  // glsl: #include <emissivemap_fragment>`;
}

setValues(values) {
  super.setValues(values);

  if (typeof values.defines !== 'undefined') {
    
    this.fragmentShader = this.getFragmentShader();
  }
}

getFragmentShader() {
  let layerUniforms = '';
  let layerHeights = '';
  let layerSlopes = '';
  let layerDiffuseColors = '';

  let layerDiffuseMixes = 'lyr_baseColor';
  let layerSpecularMixes = 'lyr_specularStrength';
  let layerBaseColor = 'vec4(0., 0., 0., 1.)';
  let layerSpecularStrength = '1.0'; 

  let layerNormals = [];

  this.layers.forEach((l) => {
    const diffuseColorId = `lyr_sample${l.id}`;

    if (l.useBump) {
      layerUniforms += `uniform sampler2D ${l.bump0Name};\n`;
      layerUniforms += `uniform float ${l.bumpScaleName};\n`;
    }
    if (l.mixBump) {
      layerUniforms += `uniform sampler2D ${l.bump1Name};\n`;
    }

    if (l.useDiffuse) {
      layerUniforms += `uniform sampler2D ${l.map0Name};\n`;
    } 
    if (l.mixDiffuse) {
      layerUniforms += `uniform sampler2D ${l.map1Name};\n`;
    }

    if (l.range) {
      layerUniforms += `uniform vec2 ${l.rangeName};\n`;
      layerUniforms += `uniform vec2 ${l.rangeDisturbStrengthName};\n`;
      layerUniforms += `uniform vec2 ${l.rangeDisturbOctavesName};\n`;
      layerUniforms += `uniform vec2 ${l.rangeTrnsName};\n`;
      layerHeights += `float ${l.heightName} = smoothstep(${l.rangeName}.x - ${l.rangeTrnsName}.x,${l.rangeName}.x, height) * (1. -smoothstep(${l.rangeName}.y, ${l.rangeName}.y + ${l.rangeTrnsName}.y, height))\n;`;
    }
    
    if (l.slope) {
      layerUniforms += `uniform vec2 ${l.slopeName};\n`;
      layerUniforms += `uniform vec2 ${l.slopeDstrbStrengthName};\n`;
      layerUniforms += `uniform vec2 ${l.slopeDstrbOctavesName};\n`;
      layerUniforms += `uniform vec2 ${l.slopeTrnsName};\n`;
      const lowerSlope = `abs(slope${l.useSlopeDisturb ? ` + ${l.slopeDstrbStrengthName}.x * noise(${l.slopeDstrbOctavesName}.x * vUv)` : ``})`;
      const upperSlope = `abs(slope${l.useSlopeDisturb ? ` + ${l.slopeDstrbStrengthName}.y * noise(${l.slopeDstrbOctavesName}.y * vUv)` : ``})`;
      layerSlopes += `float ${l.slopeName} = smoothstep(${l.slopeName}.x - ${l.slopeTrnsName}.x, ${l.slopeName}.x, ${lowerSlope}) * (1. - smoothstep(${l.slopeName}.y, ${l.slopeName}.y + ${l.slopeTrnsName}.y, ${upperSlope}));\n`;
    }

    layerDiffuseMixes = `mix(${layerDiffuseMixes}, ${diffuseColorId}, ${l.hsModul})`;

    if (l.useDiffuse) {
      layerDiffuseColors += `vec4 ${diffuseColorId} = randomizeTileTextures(${l.map0Name}${l.mixDiffuse ? `, ${l.map1Name}` : ''});\n`;
    }

    if (l.useBump) {
      layerNormals.push({
        normal: `perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(${l.bump0Name}${l.mixBump ? `, ${l.bump1Name}` : ''}, ${l.bumpScaleName} ), faceDirection ) * ${l.hsModul}`,
        slope: (l.slope ? l.slopeName : null),
        height: (l.range ? l.heightName: null),
        bumpScale: l.bumpScale,
      });
    }
  });

  return `
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;

    ${TRIPLANAR_COMMON}

    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>

    ${TRIPLANAR_PARS_FRAGMENT}

    ${UV_MIX_PARS_FRAGMENT}

    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <bsdfs>

    #include <lights_pars_begin>
    #include <normal_pars_fragment> // defines vNormal
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>

    ${layerUniforms}

    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>

    ${TRIPLANAR}

    ${BUMPMAP_PARS_FRAGMENT}

   
    varying float height;
    varying float slope;

    void main() {
      ${TRIPLANAR_FRAGMENT_BEGIN}

      ${UV_MIX_FRAGMENT_BEGIN}

      vec4 diffuseColor = vec4( diffuse, opacity );

      ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;

      #include <logdepthbuf_fragment>
      #include <map_fragment>
      #include <color_fragment>
      #include <alphamap_fragment>
      #include <alphatest_fragment>
      #include <specularmap_fragment>
      #include <normal_fragment_begin>
      ${/*NORMAL_FRAGMENT_MAPS*/'// dummy fragment maps'}

      // ${layerSpecularStrength}

      ${layerDiffuseColors}

      ${layerHeights}

      ${layerSlopes}
    
      ${this.getNormal(layerNormals)}

      // accumulation
      #include <lights_phong_fragment>
      #include <lights_fragment_begin>
      #include <lights_fragment_maps>
      #include <lights_fragment_end>

      // modulation

      #include <aomap_fragment>

      vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

      // #include <envmap_fragment>

      // -------------------------------------------------------------------

      vec4 lyr_baseColor = ${layerBaseColor};
    
      gl_FragColor = vec4( outgoingLight, diffuseColor.a ) * ${layerDiffuseMixes};

      // #include <encodings_fragment>
      #include <premultiplied_alpha_fragment>
      #include <dithering_fragment>
    }
  `;
  }
}

MeshLayeredMaterial.prototype.isMeshLayeredMaterial = true;
// MeshLayeredMaterial.prototype.isMeshPhongMaterial = true; // this triggeres update in uniforms in WebGLMaterials
MeshLayeredMaterial.prototype.isShaderMaterial = true; // this skips update of uniforms, handle on your own!

export default MeshLayeredMaterial;