export default /* glsl */`
// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
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

#if !defined MWM_FBM
  #define MWM_FBM

  float fbm (vec2 point) {
    // Initial values
    //int octaves = 6;
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;

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

