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
    this.rangeDstrbStrength = config.rangeDstrbStrength || [0, 0];
    this.rangeDstrbOctaves = config.rangeDstrbOctaves || [0, 0];
    this.rangeTrns = config.rangeTrns || [0, 0];

    this.slope = config.slope || null;
    this.slopeDstrbStrength = config.slopeDstrbStrength || [0, 0];
    this.slopeDstrbOctaves = config.slopeDstrbOctaves || [0, 0];
    this.slopeTrns = config.slopeTrns || [0, 0];

    this.useRangeDisturb = false;
    this.useSlopeDisturb = true;

    this.bumpScale = config.bumpScale || 0;

    this.map = config.map || null;
    this.bumpMap = config.bumpMap || null;
    this.specularColor = config.specularColor || null;
    this.specularStrength = config.specularStrength || null;
    this.specularMap = config.specularMap || null;

    this.useDiffuse = !!this.map;
    this.useBump = !!this.bumpMap && !!this.bumpScale;
    this.useSpecular = !!this.specularStrength && !!this.specularColor;
    this.useSpecularMap = !!this.specularMap;
    this.enabled = config.enabled === false ? false : true;
  
    this.useMixes = this.useSpecular || this.useDiffuse || this.useBump;
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

  get rangeDisturbStrengthName() {
    return `lyr_rng_ds_${this.id}`;
  }

  get rangeDisturbOctavesName() {
    return `lyr_rng_do_${this.id}`;
  }

  get rangeTrnsName() {
    return `lyr_rng_trns_${this.id}`;
  }

  get slopeName() {
    return `lyr_slp_${this.id}`;
  }

  get slopeDstrbStrengthName() {
    return `lyr_slp_ds_${this.id}`;
  }

  get slopeDstrbOctavesName() {
    return `lyr_slp_do_${this.id}`;
  }

  get slopeTrnsName() {
    return `lyr_slp_trns_${this.id}`;
  }

  get diffuseColorName() {
    return `lyr_dff_clr_${this.id}`;
  }

  get mapName() {
    return this.getTextureName('mp');
  }

  get bumpName() {
    return this.getTextureName('bmp');
  }

  get specularColorName() {
    return `lyr_spc_clr_${this.id}`;
  }

  get specularStrengthName() {
    return `lyr_spc_sth_${this.id}`;
  }

  get specularMapName() {
    return this.getTextureName('smp');
  }

  get hsModulName() {
    return `lyr_hsm_${this.id}`;
  }

  get hsModul() {
    return `1. ${(this.range ? `* ${this.heightName}` : '')} ${this.slope ? `* ${this.slopeName}` : ''}`;
  }

  getTextureName(base) {
    return `lyr_${base}_${this.id}`;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  mixSpecularColor(specularColorMixes) {
    return `mix(${specularColorMixes}, ${this.specularColorName}, ${this.hsModulName})`;
  }

  mixSpecularStrength(specularStrengthMixes) {
    return `mix(${specularStrengthMixes}, ${this.specularStrengthName}, ${this.hsModulName})`;
  }

  mixDiffuse(diffuseMixes) {
    return `mix(${diffuseMixes}, ${this.diffuseColorName}, ${this.hsModulName})`;
  }

  addDiffuseColor() {
    return `vec4 ${this.diffuseColorName} = getTexture2D(${this.mapName});\n`;
  }

  addBumpNormal() {
    if (!this.useBump) {
      return '';
    }
    return `perturbNormalArb( -vViewPosition, normal, dHdxy_fwd(${this.bumpName}, ${this.bumpScaleName} ), faceDirection ) * ${this.hsModulName}`;
  }

  prepareMixes() {
    return `float ${this.hsModulName} = ${this.hsModul};\n`;
  }

  addFragmentHeight(heightName) {
    if (!this.range) {
      return '';
    }
    return `float ${this.heightName} = smoothstep(${this.rangeName}.x - ${this.rangeTrnsName}.x,${this.rangeName}.x, ${heightName}) * (1. -smoothstep(${this.rangeName}.y, ${this.rangeName}.y + ${this.rangeTrnsName}.y, ${heightName}))\n;`;
  }

  addFragmentSlope() {
    if (!this.slope) {
      return '';
    }

    const lowerSlope = `slope${this.useSlopeDisturb ? ` + ${this.slopeDstrbStrengthName}.x * noise(${this.slopeDstrbOctavesName}.x * vUv)` : ``}`;
    const upperSlope = `slope${this.useSlopeDisturb ? ` + ${this.slopeDstrbStrengthName}.y * noise(${this.slopeDstrbOctavesName}.y * vUv)` : ``}`;
    return `float ${this.slopeName} = smoothstep(${this.slopeName}.x - ${this.slopeTrnsName}.x, ${this.slopeName}.x, ${lowerSlope}) * (1. - smoothstep(${this.slopeName}.y, ${this.slopeName}.y + ${this.slopeTrnsName}.y, ${upperSlope}));\n`;
}

  addFragmentDiffuseColor() {
    return `vec4 ${this.diffuseColorName} = getTexture2D(${this.mapName});\n`;
  }

  addFragmentUniforms() {
    let uniforms = `// mix layer ${this.id} uniforms\n`;
    if (this.useDiffuse) {
      // write out diffuse color map texture
      uniforms += `uniform sampler2D ${this.mapName};\n`;

      if (this.range) {
        uniforms += `uniform vec2 ${this.rangeName};\n`;
        // uniforms += `uniform vec2 ${l.rangeDisturbStrengthName};\n`;
        // uniforms += `uniform vec2 ${l.rangeDisturbOctavesName};\n`;
        uniforms += `uniform vec2 ${this.rangeTrnsName};\n`;
      }
    }

    if (this.useSpecular) {
      uniforms += `uniform float ${this.specularStrengthName};\n`;
      uniforms += `uniform vec3 ${this.specularColorName};\n`;
    }

    if (this.useSpecularMap) {
      uniforms += `uniform sampler2D ${this.specularMapName};\n`;
    }

    if (this.slope) {
      uniforms += `uniform vec2 ${this.slopeName};\n`;
      uniforms += `uniform vec2 ${this.slopeDstrbStrengthName};\n`;
      uniforms += `uniform vec2 ${this.slopeDstrbOctavesName};\n`;
      uniforms += `uniform vec2 ${this.slopeTrnsName};\n`;
    }

    if (this.useBump) {
      uniforms += `uniform sampler2D ${this.bumpName};\n`;
      uniforms += `uniform float ${this.bumpScaleName};\n`;
    }

    uniforms += `\n`;
    return uniforms;
  }

  extendUniforms(u) {
    if (this.range) {
      u[this.rangeName] = { type: 'vec2', value: new THREE.Vector2(this.range[0], this.range[1]) };
      u[this.rangeTrnsName] = { type: 'vec2', value: new THREE.Vector2(this.rangeTrns[0], this.rangeTrns[1]) };
      u[this.rangeDisturbStrengthName] = { type: 'vec2', value: new THREE.Vector2(0.2, 0.2) };
      u[this.rangeDisturbOctavesName] = { type: 'vec2', value: new THREE.Vector2(1., 1.) };
    }
    if (this.slope) {
      u[this.slopeName] = { type: 'vec2', value: new THREE.Vector2(this.slope[0], this.slope[1]) };
      u[this.slopeTrnsName] = { type: 'vec2', value: new THREE.Vector2(this.slopeTrns[0], this.slopeTrns[1]) };
      u[this.slopeDstrbStrengthName] = { type: 'vec2', value: new THREE.Vector2(this.slopeDstrbStrength[0], this.slopeDstrbStrength[1]) };
      u[this.slopeDstrbOctavesName] = { type: 'vec2', value: new THREE.Vector2(this.slopeDstrbOctaves[0], this.slopeDstrbOctaves[1]) };
    }
    if (this.useDiffuse) {
      this.map.wrapS = this.map.wrapT = THREE.RepeatWrapping;
      //this.map.magFilter = THREE.NearestFilter;
      u[this.mapName] = { type: "t", value: this.map };
    }

    if (this.useBump) {
      this.bumpMap.wrapS = this.bumpMap.wrapT = THREE.RepeatWrapping;
      // this.bumpMap.magFilter = THREE.NearestFilter;
      u[this.bumpName] = { type: "t", value: this.bumpMap };
      u[this.bumpScaleName] = { value: this.bumpScale };
    }
  
    if(this.useSpecular) {
      u[this.specularStrengthName] = { value: this.specularStrength };
      u[this.specularColorName] = { type: 'vec3', value: this.specularColor };
    }
  }
}