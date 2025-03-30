export default /* glsl */`
#ifdef USE_TRIPLANAR
  varying vec3 trplNormal;
  varying TriplanarUV trplUV;

  vec3 trplBF;

  #ifdef USE_MIXUV
    TriplanarUV trplUVCorn;
    TriplanarUV trplUVCent;

    TriplanarUV trplUVFloor;
    TriplanarUV trplUVFract;

    vec3 trplMixThreshold;

    void triplanarRotateUVs() {
      trplUVCorn.x = rotateQuadrants(trplUVFract.x, trplUVFloor.x);
      trplUVCent.x = rotateAroundCenter(trplUVFract.x, random(trplUVFloor.x), vec2(0., 0.));
    
      trplUVCorn.y = rotateQuadrants(trplUVFract.y, trplUVFloor.y);
      trplUVCent.y = rotateAroundCenter(trplUVFract.y, random(trplUVFloor.y), vec2(0., 0.));
    
      trplUVCorn.z = rotateQuadrants(trplUVFract.z, trplUVFloor.z);
      trplUVCent.z = rotateAroundCenter(trplUVFract.z, random(trplUVFloor.z), vec2(0., 0.));
    }

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
  #endif

  vec3 triplanarBF() {
    vec3 bf = normalize( abs( trplNormal ) );
    bf /= dot( bf, vec3( 1. ) );
    return bf;
  }

  vec4 triplanar(sampler2D map, TriplanarUV tuv) {
    #ifdef USE_MIXUV
      vec4 cx = mix(texture2D(map, trplUVCent.x), texture2D(map, trplUVCorn.x), trplMixThreshold.x) * trplBF.x;
  	  vec4 cy = mix(texture2D(map, trplUVCent.y), texture2D(map, trplUVCorn.y), trplMixThreshold.y) * trplBF.y;
   	  vec4 cz = mix(texture2D(map, trplUVCent.z), texture2D(map, trplUVCorn.z), trplMixThreshold.z) * trplBF.z;
  	  
      return cx + cy + cz;
    #else
  	  vec4 cx = texture2D(map, tuv.x) * trplBF.x;
  	  vec4 cy = texture2D(map, tuv.y) * trplBF.y;
  	  vec4 cz = texture2D(map, tuv.z) * trplBF.z;

  	  return cx + cy + cz;
    #endif
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
      texture2D(map, tx).x * trplBF.x,
      texture2D(map, ty).x * trplBF.y,
      texture2D(map, tz).x * trplBF.z
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
      texture2D(map, tx).x * trplBF.x,
      texture2D(map, ty).x * trplBF.y,
      texture2D(map, tz).x * trplBF.z
    );
  }
#endif
`;
