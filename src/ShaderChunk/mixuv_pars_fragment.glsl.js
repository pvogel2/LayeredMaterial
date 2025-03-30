export default /* glsl */`
#ifdef USE_MIXUV
  #define M_PI 3.14159265

  float vUvNoise;
  float vUvMixAmount;

  vec2 vUvCorn;
  vec2 vUvCent;

  vec2 vUvCentDist;
  float vUvMixThreshold;

  float random (vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123);
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
