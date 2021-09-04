import * as THREE from 'three';

import { BUMPMAP_PARS_FRAGMENT, UV_MIX_PARS_FRAGMENT, UV_MIX_FRAGMENT_BEGIN, NORMAL_FRAGMENT_MAPS } from './ShaderLib';

const VERTEX_SHADER = `
// currently based on PHONG
#define LAYERED

#define USE_UV
#define USE_BUMPMAP

// from LayeredMaterial
uniform vec3 lyrDirection;

varying vec3 vViewPosition;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <color_pars_vertex>
#include <normal_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>

varying float height;
varying float slope;

void main() {
  #include <uv_vertex>
	#include <uv2_vertex>
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
}
`;

class MeshLayeredMaterial extends THREE.ShaderMaterial {
  constructor(parameters) {
    super();
  this.type = 'MeshLayeredMaterial';
  
  this.color = new THREE.Color( 0xffffff ); // diffuse

  this.layers = parameters.layers ? parameters.layers : [];

  this.direction = parameters.direction || new THREE.Vector3( 0.0, 1.0, 0.0 );

  this.uniforms = THREE.UniformsUtils.merge( [
    THREE.UniformsLib["common" ],
    THREE.UniformsLib["lights" ],
    THREE.UniformsLib["bumpmap" ],
    {
      lyrDirection: { value: this.direction },
    }
  ] );

  this.layers.forEach(l => {
     l.extendUniforms(this.uniforms);
  });

  this.defines = {
    PHONG: '',
    USE_BUMPMAP: '',
    USE_UV: '',
    USE_UV_MIX: '',
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

  this.setValues( parameters );
  // console.log(this.fragmentShader);
}

/**
 * Change parameters on runtime
 * 
 * @param {*} layer 
 */
updateLayer(layer) {
  if (layer.range) {
    this.uniforms[layer.uRangeId].value.set(layer.range[0], layer.range[1]);
    this.uniformsNeedUpdate = true;
  }
  if (layer.rangeTrns) {
    this.uniforms[layer.uRangeTrnsId].value.set(layer.rangeTrns[0], layer.rangeTrns[1]);
    this.uniformsNeedUpdate = true;
  }
  if (layer.slope) {
    this.uniforms[layer.uSlopeId].value.set(layer.slope[0], layer.slope[1]);
    this.uniformsNeedUpdate = true;
  }
  if (layer.slopeTrns) {
    this.uniforms[layer.uSlopeTrnsId].value.set(layer.slopeTrns[0], layer.slopeTrns[1]);
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
    // console.log(this.fragmentShader);
  }
}

getFragmentShader() {
  let layerUniforms = '';

  let layerHeights = '';
  let totalHeights = 'float lyrs_totalHeight = 1.';
  let layerNormalizedHeights = '';
  let layerSlopes = '';
  let layerDiffuseMaps = '';
  let layerBumpMaps = '';
  let layerDiffuseColors = '';

  let layerDiffuseMixes = '';
  let layerSpecularMixes = 'lyr_specularStrength';
  let layerBaseColor = 'vec4(1., 1., 1., 1.)';
  let lyr_specularStrength = '1.0'; 

  let layerNormals = [];
  const nLayers = `${this.layers.length}.`;

  this.layers.forEach((l) => {
    const tId = l.tId;
    const tId2 = l.tId2 ? l.tId2 : null;

    const uBumpScaleId = l.bumpScaleId;

    const uRangeId =l.uRangeId;
    const uRangeTrnsId =l.uRangeTrnsId;
    const uSlopeId = l.uSlopeId;
    const uSlopeTrnsId = l.uSlopeTrnsId;

    const diffuseColorId = `lyr_sample${l.id}`;
    const hId = `lyr_height${l.id}`;
    const hnId = `lyr_norm_height${l.id}`;
    const slpId = `lyr_slope${l.id}`;

    if (l.bmId0) {
      layerBumpMaps += `uniform sampler2D ${l.bmId0};\n`;
      layerUniforms += `uniform float ${uBumpScaleId};\n`;
    }
    if (l.bmId1) {
      layerBumpMaps += `uniform sampler2D ${l.bmId1};\n`;
    }

    if (tId2) {
      layerDiffuseMaps += `uniform sampler2D ${tId};\n`;
      layerDiffuseMaps += `uniform sampler2D ${tId2};\n`;

      layerDiffuseColors += `vec4 ${diffuseColorId} = randomizeTileTextures(${tId}, ${tId2});\n`;
    } else {
      layerDiffuseMaps += `uniform sampler2D ${tId};\n`;

      layerDiffuseColors += `vec4 ${diffuseColorId} = randomizeTileTexture(${tId});\n`;
    }

    if (l.range) {
      layerUniforms += `uniform vec2 ${uRangeId};\n`;
      layerUniforms += `uniform vec2 ${uRangeTrnsId};\n`;
      layerHeights += `float ${hId} = smoothstep(${uRangeId}.x - ${uRangeTrnsId}.x,${uRangeId}.x, height) * (1. -smoothstep(${uRangeId}.y, ${uRangeId}.y + ${uRangeTrnsId}.y, height))\n;`;
      totalHeights += `+${hId}`;
      layerNormalizedHeights += `float ${hnId} = ${hId} / (${nLayers} * lyrs_totalHeight);\n`;
    }
    
    if (l.slope) {
      layerUniforms += `uniform vec2 ${uSlopeId};\n`;
      layerUniforms += `uniform vec2 ${uSlopeTrnsId};\n`;
      layerSlopes += `float ${slpId} = smoothstep(${uSlopeId}.x - ${uSlopeTrnsId}.x, ${uSlopeId}.x, abs(slope)) * (1. - smoothstep(${uSlopeId}.y, ${uSlopeId}.y + ${uSlopeTrnsId}.y, abs(slope)));\n`;
    }

    // if (l.range || l.slope) {
      layerDiffuseMixes = this.sum(layerDiffuseMixes, `${diffuseColorId} ${(l.range ? `* ${hnId}` : '')} ${l.slope ? `*  ${slpId}` : ''}`);
    // } else {
      // TODO: is this correct??
      // layerBaseColor = this.mult(layerBaseColor, diffuseColorId);
      // lyr_specularStrength = `${lyr_specularStrength} * ${diffuseColorId}`;
    // }

    if (l.bmId0) {
      layerNormals.push({
        normal: `perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(${l.bmId0}${l.bmId1 ? `, ${l.bmId1}` : ''}, ${uBumpScaleId} ), faceDirection ) ${(l.range ? `* ${hnId}` : '')} ${l.slope ? `*  ${slpId}` : ''}`,
        slope: (l.slope ? slpId : null),
        height: (l.range ? hId: null),
        bumpScale: l.bumpScale,
      });
    }
  });
  layerDiffuseMixes = `${layerBaseColor} * ( ${layerDiffuseMixes} )`;
  totalHeights += ';';

  return `
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;

    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>

    ${UV_MIX_PARS_FRAGMENT}

    ${BUMPMAP_PARS_FRAGMENT}

    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <bsdfs>

    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>

    ${layerBumpMaps}

    ${layerDiffuseMaps}

    ${layerUniforms}

    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    
    varying float height;
    varying float slope;

    void main() {
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

      // ${lyr_specularStrength}

      ${layerDiffuseColors}

      ${layerHeights}
      ${totalHeights}
      ${layerNormalizedHeights}

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
    
      gl_FragColor = vec4( outgoingLight, diffuseColor.a ) * ${layerDiffuseMixes} * 4.; // the last factor is just to fix the outcome

      #include <encodings_fragment>
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