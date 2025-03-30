export default /* glsl */`
#ifdef USE_MIXUV
  vUvNoise = noise(vUv);
  vUvMixAmount = smoothstep(0., .6, vUvNoise * fbm(vUv * 3.)) + 0.2 * smoothstep(0., 1., vUvNoise * fbm(vUv * 40.));

  vec2 fl = floor(vUv);
  vec2 fr = fract(vUv);

  vUvCorn = rotateQuadrants(fr, fl);
  vUvCent = rotateAroundCenter(fr, random(fl), vec2(0., 0.));

  vUvCentDist = fr - vec2(0.5);
  vUvMixThreshold = smoothstep(1. - .4, 1.,  dot(vUvCentDist, vUvCentDist) * 4.0);
#endif
 `;
 