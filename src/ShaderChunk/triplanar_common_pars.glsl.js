export default /* glsl */`
#ifdef USE_TRIPLANAR
  struct TriplanarUV {
    vec2 x; // YZ plane uv coords
    vec2 y; // XZ plane uv coords
    vec2 z; // XY plane uv coords
  };
#endif
`;
