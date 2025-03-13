export default /* glsl */`
#ifdef USE_TRIPLANAR
  varying vec3 trplNormal;
  varying TriplanarUV trplUV;
 
  vec3 trplBF;

  vec3 triplanarBF() {
    vec3 bf = normalize( abs( trplNormal ) );
    bf /= dot( bf, vec3( 1. ) );
    return bf;
  }

  vec4 triplanar(sampler2D map, TriplanarUV tuv) {
  	vec4 cx = texture2D(map, tuv.x) * trplBF.x;
  	vec4 cy = texture2D(map, tuv.y) * trplBF.y;
  	vec4 cz = texture2D(map, tuv.z) * trplBF.z;

  	return cx + cy + cz;
  }
#endif
`;
