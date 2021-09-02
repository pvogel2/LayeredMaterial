const  textureLoader = new THREE.TextureLoader();

/**
 * currently supported:
 * name string
 * texture Texture
 * range Vec2
 */

export default class MaterialLayer {

  constructor(config) {
    this.id = config.id;
    this.uRangeId = `lyr_u_rng_${config.id}`;
    this.uRangeTrnsId = `lyr_u_rng_trns_${config.id}`;
    this.uSlopeId = `lyr_u_slp_${config.id}`;
    this.uSlopeTrnsId = `lyr_u_slp_trns_${config.id}`;
    this.range = config.range || [0, 0];
    this.rangeTrns = config.rangeTrns || [0, 0];
    this.slope = config.slope || [0, 0];
    this.slopeTrns = config.rangeTrns || [0, 0];
    this.bumpScale = config.bumpScale || 0;

    this.tId = `lyr_texture${config.id}`;
    this.texture = config.map.length ? config.map[0] : null;

    this.bumpScaleId = `lyr_bm_scale${config.id}`;
    if (config.map.length > 1) {
      this.tId2 = `lyr_texture2${config.id}`;
      this.texture2 = config.map[1];
    }
    if (config?.bumpMap?.length) {
      this.bmId0 = `lyr_bm_tex0${config.id}`;
      this.bumpMap0 = config.bumpMap[0];
    }
    if (config?.bumpMap?.length > 1) {
      this.bmId1 = `lyr_bm_tex1${config.id}`;
      this.bumpMap1 = config.bumpMap[1];
    }
  }

  extendUniforms(u) {
    if (this.range) {
      u[this.uRangeId] = { type: 'vec2', value: new THREE.Vector2(this.range[0], this.range[1]) };
      u[this.uRangeTrnsId] = { type: 'vec2', value: new THREE.Vector2(this.rangeTrns[0], this.rangeTrns[1]) };
    }
    if (this.slope) {
      u[this.uSlopeId] = { type: 'vec2', value: new THREE.Vector2(this.slope[0], this.slope[1]) };
      u[this.uSlopeTrnsId] = { type: 'vec2', value: new THREE.Vector2(this.slopeTrns[0], this.slopeTrns[1]) };
    }
    if (this.texture) {
      const texture = textureLoader.load(this.texture);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //texture.magFilter = THREE.NearestFilter;
      u[this.tId] = { type: "t", value: texture };
      u[this.bumpScaleId] = { value: this.bumpScale };
    }

    if (this.texture2) {
      const texture = textureLoader.load(this.texture2);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //texture.magFilter = THREE.NearestFilter;
      u[this.tId2] = { type: "t", value: texture };
    }

    if (this.bumpMap0) {
      const texture = textureLoader.load(this.bumpMap0);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //texture.magFilter = THREE.NearestFilter;
      u[this.bmId0] = { type: "t", value: texture };
    }

    if (this.bumpMap1) {
      const texture = textureLoader.load(this.bumpMap1);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      //texture.magFilter = THREE.NearestFilter;
      u[this.bmId1] = { type: "t", value: texture };
    }
  }
}