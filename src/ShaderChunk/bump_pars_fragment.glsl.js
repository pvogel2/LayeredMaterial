export default /* glsl */`
#ifdef USE_BUMPMAP
  #if defined(USE_TRIPLANAR) && defined(USE_MIXUV)
    vec2 dHdxy_fwd(sampler2D tex, float scale) {
      float Hll = scale * triplanar(tex, trplUV).x;

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
  
  #elif defined USE_MIXUV
    vec2 dHdxy_fwd(sampler2D tex, float scale) {
      vec2 dSTdxCent = dFdx( vUvCent );
  		vec2 dSTdyCent = dFdy( vUvCent );
  		vec2 dSTdxCorn = dFdx( vUvCorn );
  		vec2 dSTdyCorn = dFdy( vUvCorn );
      
      float Hll = scale * mix(texture2D(tex , vUvCent), texture2D(tex , vUvCorn), vUvMixThreshold).x;
  		float dBx = scale * mix(texture2D(tex , vUvCent + dSTdxCent), texture2D(tex , vUvCorn + dSTdxCorn), vUvMixThreshold).x - Hll;
  		float dBy = scale * mix(texture2D(tex , vUvCent + dSTdyCent), texture2D(tex , vUvCorn + dSTdyCorn), vUvMixThreshold).x - Hll;

      return vec2( dBx, dBy );
    }
  #elif defined USE_TRIPLANAR
    vec2 dHdxy_fwd(sampler2D tex, float scale) {
      float Hll = scale * triplanar(tex, trplUV).x;
      vec3 cDFDx = triplanarDFDx(tex, trplUV);
      vec3 cDFDy = triplanarDFDy(tex, trplUV);
      float dBx = scale * (cDFDx.x + cDFDx.y + cDFDx.z) - Hll;
      float dBy = scale * (cDFDy.x + cDFDy.y + cDFDy.z) - Hll;
  
      return vec2( dBx, dBy );
    }
  #else
    vec2 dHdxy_fwd(sampler2D tex, float scale) {
      vec2 dSTdx = dFdx( vUv );
      vec2 dSTdy = dFdy( vUv );
  
      float Hll = scale * texture2D(tex , vUv).x;
      float dBx = scale * texture2D(tex , vUv + dSTdx).x - Hll;
      float dBy = scale * texture2D(tex , vUv + dSTdy).x - Hll;
      return vec2( dBx, dBy );
    }
  #endif

  vec2 dHdxy_fwd(sampler2D tex) {
    return dHdxy_fwd(tex, bumpScale);
  }
#endif
`;
