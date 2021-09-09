import * as THREE from 'three';

/**
 * currently supported:
 * name string
 * texture Texture
 * range Vec2
 */

export default class MaterialLayer {

  constructor(config) {
    this.id = config.id;
    this.range = config.range || [0, 0];
    this.rangeTrns = config.rangeTrns || [0, 0];
    this.slope = config.slope || [0, 1];
    this.slopeTrns = config.rangeTrns || [0, 0];

    this.bumpScale = config.bumpScale || 0.02;

    this.map = config.map || null;
    this.bumpMap = config.bumpMap || null;
  }

  get heightName() {
    return `lyr_height${this.id}`;
  }

  get slopeName() {
    return `lyr_slope${this.id}`;
  }

  get bumpScaleName() {
    return `lyr_bm_scale${this.id}`;
  }

  get rangeName() {
    return `lyr_rng_${this.id}`;
  }

  get rangeTrnsName() {
    return `lyr_rng_trns_${this.id}`;
  }

  get slopeName() {
    return `lyr_slp_${this.id}`;
  }

  get slopeTrnsName() {
    return `lyr_slp_trns_${this.id}`;
  }

  get map0Name() {
    return this.getTextureName('mp', 0);
  }

  get map1Name() {
    return this.getTextureName('mp', 1);
  }

  get bump0Name() {
    return this.getTextureName('bmp', 0);
  }

  get bump1Name() {
    return this.getTextureName('bmp', 1);
  }

  get hsModul() {
    return `${(this.range ? `* ${this.heightName}` : '')} ${this.slope ? `* ${this.slopeName}` : ''}`;
  }
  
  getTextureName(base, idx) {
    return `lyr_${base}${idx}${this.id}`;
  }
 
  extendUniforms(u) {
    if (this.range) {
      u[this.rangeName] = { type: 'vec2', value: new THREE.Vector2(this.range[0], this.range[1]) };
      u[this.rangeTrnsName] = { type: 'vec2', value: new THREE.Vector2(this.rangeTrns[0], this.rangeTrns[1]) };
    }
    if (this.slope) {
      u[this.slopeName] = { type: 'vec2', value: new THREE.Vector2(this.slope[0], this.slope[1]) };
      u[this.slopeTrnsName] = { type: 'vec2', value: new THREE.Vector2(this.slopeTrns[0], this.slopeTrns[1]) };
    }
    if (this.map) {
      if(!Array.isArray(this.map)) {
        this.map = [this.map];
      }
      if (this.map[0]) {
        this.map[0].wrapS = this.map[0].wrapT = THREE.RepeatWrapping;
        //this.map[0].magFilter = THREE.NearestFilter;
        u[this.map0Name] = { type: "t", value: this.map[0] };
        u[this.bumpScaleName] = { value: this.bumpScale };
      }
      if (this.map[1]) {
        this.map[1].wrapS = this.map[1].wrapT = THREE.RepeatWrapping;
        //this.map[1].magFilter = THREE.NearestFilter;
        u[this.map1Name] = { type: "t", value: this.map[1] };
      }
    }

    if (this.bumpMap) {
      if(!Array.isArray(this.bumpMap)) {
        this.bumpMap = [this.bumpMap];
      }
      if (this.bumpMap[0]) {
        this.bumpMap[0].wrapS = this.bumpMap[0].wrapT = THREE.RepeatWrapping;
        // this.bumpMap[0].magFilter = THREE.NearestFilter;
        u[this.bump0Name] = { type: "t", value: this.bumpMap[0] };
      }
      if (this.bumpMap[1]) {
        this.bumpMap[1].wrapS = this.bumpMap[1].wrapT = THREE.RepeatWrapping;
        // this.bumpMap[1].magFilter = THREE.NearestFilter;
        u[this.bump1Name] = { type: "t", value: this.bumpMap[1] };
      }
    }
  }
}