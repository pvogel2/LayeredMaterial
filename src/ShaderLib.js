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
  return fract(sin(dot(st.xy,
                       vec2(12.9898,78.233)))*
      43758.5453123);
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
  vUvCentDist = fr - vec2(0.5);
  vUvMixThreshold = smoothstep(1. - .4, 1.,  dot(vUvCentDist, vUvCentDist) * 4.0);

#endif
`;

export const BUMPMAP_PARS_FRAGMENT = `
#include <bumpmap_pars_fragment>

#ifdef USE_BUMPMAP
  #ifdef USE_UV_MIX
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

    vec4 randomizeTileTextures(sampler2D tex1, sampler2D tex2) {
      vec3 color1 = mix(texture2D(tex1 , vUvCent).rgb, texture2D(tex1 , vUvCorn).rgb, vUvMixThreshold);
      vec3 color2 = mix(texture2D(tex2 , vUvCent).rgb, texture2D(tex2 , vUvCorn).rgb, vUvMixThreshold);

      return vec4(mix(color1, color2, vUvMixAmount), 1.);
    }

    vec4 randomizeTileTexture(sampler2D tex) {
      vec3 color = mix(texture2D(tex , vUvCent).rgb, texture2D(tex , vUvCorn).rgb, vUvMixThreshold);

      return vec4(color, 1.);
    }
#else
  vec2 dHdxy_per_texture_fwd(sampler2D tex, float scale) {
    vec2 dSTdx = dFdx( vUv );
    vec2 dSTdy = dFdy( vUv );

    float Hll = scale * texture2D(tex , vUv).x;
    float dBx = scale * texture2D(tex , vUv + dSTdx).x - Hll;
    float dBy = scale * texture2D(tex , vUv + dSTdy).x - Hll;
    return vec2( dBx, dBy );
  }

  vec4 randomizeTileTextures(sampler2D tex1, sampler2D tex2) {
    vec3 color1 = texture2D(tex1 , vUv).rgb;
    vec3 color2 = texture2D(tex2 , vUv).rgb;

    return vec4(mix(color1, color2, vUvMixAmount), 1.);
  }

  // dummy implementation
  vec4 randomizeTileTexture(sampler2D tex) {
    return texture2D(tex , vUv);
  }
#endif

  vec2 dHdxy_fwd(sampler2D tex1) {
    return dHdxy_per_texture_fwd(tex1, bumpScale);
  }

  vec2 dHdxy_fwd(sampler2D tex1, float scale) {
    return dHdxy_per_texture_fwd(tex1, scale);
  }

  vec2 dHdxy_fwd(sampler2D tex1, sampler2D tex2, float scale) {
    vec2 dHdx01 = dHdxy_per_texture_fwd(tex1, scale);
    vec2 dHdx02 = dHdxy_per_texture_fwd(tex2, scale);
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
