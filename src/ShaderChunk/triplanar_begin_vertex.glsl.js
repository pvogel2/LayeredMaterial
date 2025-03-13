export default /* glsl */`
#ifdef USE_TRIPLANAR
  trplNormal = normal;

  trplUV.x = position.zy; // switched direction from yz to zy
  trplUV.y = position.zx; // switched direction from xz to zx
  trplUV.z = position.xy;
#endif
`;
