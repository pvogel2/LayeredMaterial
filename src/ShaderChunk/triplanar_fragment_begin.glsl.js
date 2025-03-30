export default /* glsl */`
#ifdef USE_TRIPLANAR
  trplBF = triplanarBF();

  #ifdef USE_MIXUV
    trplUVFloor.x = floor(trplUV.x);
    trplUVFloor.y = floor(trplUV.y);
    trplUVFloor.z = floor(trplUV.z);

    trplUVFract.x = fract(trplUV.x);
    trplUVFract.y = fract(trplUV.y);
    trplUVFract.z = fract(trplUV.z);

    trplMixThreshold = triplanarUVThreshold();

    triplanarRotateUVs();
  #endif
#endif
`;
