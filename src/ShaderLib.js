export const M_PI = `
#if !defined M_PI
  #define M_PI 3.14159265
#endif
`;

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
export const NOISE = `
#if !defined MWM_NOISE
#define MWM_NOISE
float noise_random (in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = noise_random(i);
  float b = noise_random(i + vec2(1.0, 0.0));
  float c = noise_random(i + vec2(0.0, 1.0));
  float d = noise_random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
          (c - a)* u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}
#endif
`;

// @see https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_nodes.html

// normal as global
// float currently not supported

export const TRIPLANAR_COMMON = `
struct TriplanarUV {
  vec2 x; // YZ plane uv coords
  vec2 y; // XZ plane uv coords
  vec2 z; // XY plane uv coords
};
`;

export const TRIPLANAR_PARS_VERTEX = `
varying vec3 triplanarNormal;
varying TriplanarUV trplUV;
`;

/**
 * define all needed global fragment variables here (in header)
 */
export const TRIPLANAR_PARS_FRAGMENT = `
  varying vec3 triplanarNormal;
  varying TriplanarUV trplUV;
 
  TriplanarUV trplUVCorn;
  TriplanarUV trplUVCent;

  TriplanarUV trplUVFloor;
  TriplanarUV trplUVFract;

  vec3 triplanarBF;
  vec3 trplMixThreshold;
 `;

 export const TRIPLANAR_FRAGMENT_BEGIN = `
 trplUVFloor.x = floor(trplUV.x);
 trplUVFloor.y = floor(trplUV.y);
 trplUVFloor.z = floor(trplUV.z);
 
 trplUVFract.x = fract(trplUV.x);
 trplUVFract.y = fract(trplUV.y);
 trplUVFract.z = fract(trplUV.z);
 
 triplanarBF = normalize( abs( triplanarNormal ) );
 triplanarBF /= dot( triplanarBF, vec3( 1. ) );
 
 trplMixThreshold = triplanarUVThreshold();
 `;
 
export const TRIPLANAR = `
#if !defined MWM_TRIPLANAR
  #define MWM_TRIPLANAR

  vec3 triplanarUVThreshold() {
    vec2 centDist_x = trplUVFract.x - vec2(0.5);
    vec2 centDist_y = trplUVFract.y - vec2(0.5);
    vec2 centDist_z = trplUVFract.z - vec2(0.5);

    return vec3(
      smoothstep(1. - .4, 1.,  dot(centDist_x, centDist_x) * 4.0),
      smoothstep(1. - .4, 1.,  dot(centDist_y, centDist_y) * 4.0),
      smoothstep(1. - .4, 1.,  dot(centDist_z, centDist_z) * 4.0)
    );
  }

  vec3 triplanarDFDx(sampler2D map, TriplanarUV tuv) {
    vec2 dSTdx_x = dFdx( tuv.x );
    vec2 dSTdx_y = dFdx( tuv.y );
    vec2 dSTdx_z = dFdx( tuv.z );
  
    vec2 tx = (tuv.x + dSTdx_x);
    vec2 ty = (tuv.y + dSTdx_y);
    vec2 tz = (tuv.z + dSTdx_z);
  
    // the resulting value only extracted from x merges
    return vec3(
      texture2D(map, tx).x * triplanarBF.x,
      texture2D(map, ty).x * triplanarBF.y,
      texture2D(map, tz).x * triplanarBF.z
    );
  }

      
  vec3 triplanarDFDy(sampler2D map, TriplanarUV tuv) {
    vec2 dSTdy_x = dFdy( tuv.x );
    vec2 dSTdy_y = dFdy( tuv.y );
    vec2 dSTdy_z = dFdy( tuv.z );
  
    vec2 tx = (tuv.x + dSTdy_x);
    vec2 ty = (tuv.y + dSTdy_y);
    vec2 tz = (tuv.z + dSTdy_z);
  
    // the resulting value only extracted from x merges
    return vec3(
      texture2D(map, tx).x * triplanarBF.x,
      texture2D(map, ty).x * triplanarBF.y,
      texture2D(map, tz).x * triplanarBF.z
    );
  }

  #ifdef USE_UV_MIX
    void triplanarRotateUVs() {

      trplUVCorn.x = rotateQuadrants(trplUVFract.x, trplUVFloor.x);
      trplUVCent.x = rotateAroundCenter(trplUVFract.x, random(trplUVFloor.x), vec2(0., 0.));
    
      trplUVCorn.y = rotateQuadrants(trplUVFract.y, trplUVFloor.y);
      trplUVCent.y = rotateAroundCenter(trplUVFract.y, random(trplUVFloor.y), vec2(0., 0.));
    
      trplUVCorn.z = rotateQuadrants(trplUVFract.z, trplUVFloor.z);
      trplUVCent.z = rotateAroundCenter(trplUVFract.z, random(trplUVFloor.z), vec2(0., 0.));
    }

    vec4 triplanar(sampler2D map) {
    	vec4 cx = mix(texture2D(map, trplUVCent.x), texture2D(map, trplUVCorn.x), trplMixThreshold.x) * triplanarBF.x;
    	vec4 cy = mix(texture2D(map, trplUVCent.y), texture2D(map, trplUVCorn.y), trplMixThreshold.y) * triplanarBF.y;
    	vec4 cz = mix(texture2D(map, trplUVCent.z), texture2D(map, trplUVCorn.z), trplMixThreshold.z) * triplanarBF.z;

      return cx + cy + cz;
    }
  #else
    vec4 triplanar(sampler2D map, TriplanarUV tuv) {
      // Triplanar mapping
    	vec2 tx = tuv.x;
    	vec2 ty = tuv.y;
    	vec2 tz = tuv.z;
    
      // Base color
    	vec4 cx = texture2D(map, tx) * triplanarBF.x;
    	vec4 cy = texture2D(map, ty) * triplanarBF.y;
    	vec4 cz = texture2D(map, tz) * triplanarBF.z;
    
    	return cx + cy + cz;
    }
  #endif
#endif
`;

export const FBM = `
#if !defined MWM_FBM
  #define MWM_FBM

${NOISE}

float fbm (vec2 point) {
  // Initial values
  //int octaves = 6;
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
  //
  // Loop of octaves
  for (int i = 0; i < 6; i++) {
      value += amplitude * noise(point);
      point *= 2.;
      amplitude *= .5;
  }
  return value;
}
#endif
`;

export const RANDOM = `
#if !defined MWM_RANDOM
  #define MWM_RANDOM

float random (vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
#endif
`;

export const ROTATE_AROUND_CENTER = `
#if !defined MWM_ROTATE_AROUND_CENTER
  #define MWM_ROTATE_AROUND_CENTER
${M_PI}

vec2 rotateAroundCenter(vec2 fr, float amount) {
    float c = cos(amount * 2. * M_PI);
    float s = sin(amount * 2. * M_PI);
    float x = fr.x - 0.5;
    float y = fr.y - 0.5;
    float x1 = x * c - y * s + 0.5;
    float y1 = x * s + y * c + 0.5;
    return vec2(x1, y1);
  }

  vec2 rotateAroundCenter(vec2 fr, float amount, vec2 off) {
    float c = cos(amount * 2. * M_PI);
    float s = sin(amount * 2. * M_PI);
    float x = fr.x - 0.5 - off.x;
    float y = fr.y - 0.5 - off.y;
    float x1 = x * c - y * s + 0.5 + off.x;
    float y1 = x * s + y * c + 0.5 + off.y;
    return vec2(x1, y1);
  }
  #endif
`;
export const ROTATE_QAUDRANTS = `
#if !defined MWM_ROTATE_QAUDRANTS
  #define MWM_ROTATE_QAUDRANTS

  ${RANDOM}
  ${ROTATE_AROUND_CENTER}

  vec2 rotateQuadrants(vec2 fr, vec2 fl) {
    // get quadrant related offset
    vec2 offset = step(vec2(.5, .5), fr);

    // get rotation center in corner
    vec2 center = vec2(-.5, -.5) + offset;

    // get angle continous for paired quadants
    float amount = random(fl + offset);

    return rotateAroundCenter(fr, amount, center);
  }
  #endif
`;

/**
 * define all needed global fragment variables here (in header)
 */
export const UV_MIX_PARS_FRAGMENT =  `
${FBM}

${NOISE}

float vUvNoise;
float vUvMixAmount;

#ifdef USE_UV_MIX
  ${ROTATE_QAUDRANTS}

  vec2 vUvCorn;
  vec2 vUvCent;

  vec2 vUvCentDist;
  float vUvMixThreshold;
#endif
`;

/**
 *prefix in main function
 */
 export const UV_MIX_FRAGMENT_BEGIN = `
 vUvNoise = noise(vUv);
 vUvMixAmount = smoothstep(0., .6, vUvNoise * fbm(vUv * 3.)) + 0.2 * smoothstep(0., 1., vUvNoise * fbm(vUv * 40.));

 #ifdef USE_UV_MIX
  vec2 fl = floor(vUv);
  vec2 fr = fract(vUv);

  vUvCorn = rotateQuadrants(fr, fl);
  vUvCent = rotateAroundCenter(fr, random(fl), vec2(0., 0.));

  triplanarRotateUVs();

  vUvCentDist = fr - vec2(0.5);
  vUvMixThreshold = smoothstep(1. - .4, 1.,  dot(vUvCentDist, vUvCentDist) * 4.0);

#endif
`;

export const BUMPMAP_PARS_FRAGMENT = `
#include <bumpmap_pars_fragment>

#ifdef USE_BUMPMAP
  #ifdef USE_UV_MIX

    vec2 triplanar_dHdxy_per_texture_fwd(sampler2D tex, float scale) {
      float Hll = scale * triplanar(tex).x;

      vec3 trplDFDX_CentColor = triplanarDFDx(tex, trplUVCent);
      vec3 trplDFDX_CornColor = triplanarDFDx(tex, trplUVCorn);

      vec3 trplDFDY_CentColor = triplanarDFDy(tex, trplUVCent);
      vec3 trplDFDY_CornColor = triplanarDFDy(tex, trplUVCorn);

      float trplDBxColor =
        mix(trplDFDX_CentColor.x, trplDFDX_CornColor.x, trplMixThreshold.x)
        + mix(trplDFDX_CentColor.y, trplDFDX_CornColor.y, trplMixThreshold.y)
        + mix(trplDFDX_CentColor.z, trplDFDX_CornColor.z, trplMixThreshold.z);

      float trplDByColor =
        mix(trplDFDY_CentColor.x, trplDFDY_CornColor.x, trplMixThreshold.x)
        + mix(trplDFDY_CentColor.y, trplDFDY_CornColor.y, trplMixThreshold.y)
        + mix(trplDFDY_CentColor.z, trplDFDY_CornColor.z, trplMixThreshold.z);

      float dBx = scale * trplDBxColor - Hll;
      float dBy = scale * trplDByColor - Hll;
  
      return vec2( dBx, dBy );
    }

    vec2 dHdxy_per_texture_fwd(sampler2D tex, float scale) {
      vec2 dSTdxCent = dFdx( vUvCent );
  		vec2 dSTdyCent = dFdy( vUvCent );
  		vec2 dSTdxCorn = dFdx( vUvCorn );
  		vec2 dSTdyCorn = dFdy( vUvCorn );
      
      float Hll = scale * mix(texture2D(tex , vUvCent), texture2D(tex , vUvCorn), vUvMixThreshold).x;
  		float dBx = scale * mix(texture2D(tex , vUvCent + dSTdxCent), texture2D(tex , vUvCorn + dSTdxCorn), vUvMixThreshold).x - Hll;
  		float dBy = scale * mix(texture2D(tex , vUvCent + dSTdyCent), texture2D(tex , vUvCorn + dSTdyCorn), vUvMixThreshold).x - Hll;

      return vec2( dBx, dBy );
    }

    vec4 randomizeTileTextures(sampler2D tex) {
      #ifdef USE_TRIPLANAR
        vec3 color = triplanar(tex).xyz;
      #else
        vec3 color = mix(texture2D(tex , vUvCent).rgb, texture2D(tex , vUvCorn).rgb, vUvMixThreshold);
      #endif

      return vec4(color, 1.);
    }

    vec4 randomizeTileTextures(sampler2D tex1, sampler2D tex2) {
      #ifdef USE_TRIPLANAR
        vec3 color1 = triplanar(tex1).rgb;
        vec3 color2 = triplanar(tex2).rgb;
      #else
        vec3 color1 = mix(texture2D(tex1 , vUvCent).rgb, texture2D(tex1 , vUvCorn).rgb, vUvMixThreshold);
        vec3 color2 = mix(texture2D(tex2 , vUvCent).rgb, texture2D(tex2 , vUvCorn).rgb, vUvMixThreshold);
      #endif

      return vec4(mix(color1, color2, vUvMixAmount), 1.);
    }
  #else
    vec2 triplanar_dHdxy_per_texture_fwd(sampler2D tex, float scale) {
      float Hll = scale * triplanar(tex, trplUV).x;
      vec3 cDFDx = triplanarDFDx(tex, trplUV);
      vec3 cDFDy = triplanarDFDy(tex, trplUV);
      float dBx = scale * (cDFDx.x + cDFDx.y + cDFDx.z) - Hll;
      float dBy = scale * (cDFDy.x + cDFDy.y + cDFDy.z) - Hll;
  
      return vec2( dBx, dBy );
    }

    vec2 dHdxy_per_texture_fwd(sampler2D tex, float scale) {
      vec2 dSTdx = dFdx( vUv );
      vec2 dSTdy = dFdy( vUv );
  
      float Hll = scale * texture2D(tex , vUv).x;
      float dBx = scale * texture2D(tex , vUv + dSTdx).x - Hll;
      float dBy = scale * texture2D(tex , vUv + dSTdy).x - Hll;
      return vec2( dBx, dBy );
    }
  
    // dummy implementation
    vec4 randomizeTileTextures(sampler2D tex) {
      #ifdef USE_TRIPLANAR
        return triplanar(tex, trplUV);
      #else
        return texture2D(tex , vUv);
      #endif
    }
  
    vec4 randomizeTileTextures(sampler2D tex1, sampler2D tex2) {
      #ifdef USE_TRIPLANAR
        vec3 color1 = triplanar(tex1, trplUV).rgb;
        vec3 color2 = triplanar(tex2, trplUV).rgb;
      #else
        vec3 color1 = texture2D(tex1 , vUv).rgb;
        vec3 color2 = texture2D(tex2 , vUv).rgb;
      #endif
  
      return vec4(mix(color1, color2, vUvMixAmount), 1.);
    }
  #endif

  vec2 dHdxy_fwd(sampler2D tex1) {
    return dHdxy_per_texture_fwd(tex1, bumpScale);
  }

  vec2 dHdxy_fwd(sampler2D tex1, float scale) {
    #ifdef USE_TRIPLANAR
      return triplanar_dHdxy_per_texture_fwd(tex1, scale);
    #else
      return dHdxy_per_texture_fwd(tex1, scale);
    #endif
  }

  vec2 dHdxy_fwd(sampler2D tex1, sampler2D tex2, float scale) {
    #ifdef USE_TRIPLANAR
      vec2 dHdx01 = triplanar_dHdxy_per_texture_fwd(tex1, scale);
      vec2 dHdx02 = triplanar_dHdxy_per_texture_fwd(tex2, scale);
    #else
      vec2 dHdx01 = dHdxy_per_texture_fwd(tex1, scale);
      vec2 dHdx02 = dHdxy_per_texture_fwd(tex2, scale);
    #endif

    return mix(dHdx01, dHdx02, vUvMixAmount);
  }

  vec2 dHdxy_fwd(sampler2D tex1, sampler2D tex2) {
    return dHdxy_fwd(tex1, tex2, bumpScale);
  }
#endif
`;

export const NORMAL_FRAGMENT_MAPS = `
#ifdef USE_UV_MIX
  #ifdef USE_BUMPMAP
    normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(), faceDirection ).xyz;
  #endif
#else
  #include <normal_fragment_maps>
#endif
`;
