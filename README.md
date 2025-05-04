# LayeredMaterial
A threejs material to manage texture layers. MaterialLayers are defined as described below and set to the LayeredMaterial property layers. The Material takes care of the combination of the layers due to their configurations.

The material is intended to be used on landscape surfaces. It supports triplanar mapping and texture randomization to prevent the classical tiling effect.

** This is a first version, not yet stable **

## Clone

To clone the project:
```bash
git clone https://github.com/pvogel2/LayeredMaterial.git
```
## Installation

Install the node module :
```bash
npm install layered-material
```
To include the modules in node:
```javascript
import MaterialLayer from 'layered-material/dist/jsm/MaterialLayer';
import MeshLayeredMaterial from 'layered-material/dist/jsm/MeshLayeredMaterial';

```

To include the plain javascripts in the browser:
```html
<script src="<path/to/node-module>/dist/js/MaterialLayer.js"></script>
<script src="<path/to/node-module>/distjs/MeshLayeredMaterial.js"></script>
```
## Usage

To use the MeshLayeredMaterial you also need to use the MaterialLayer, a defined format for configuring all properties used for a layer of the material.

Basic support for tileable diffuse maps and bump maps is provided, also the option to randomize the tiling.
Slope and range settings can be configured including transition areas for smooth blending between layers.

### MeshLayeredMaterial

To create a new layered material:
```
const new MehsLayeredMaterial({ layers: [], direction: new THREE.Vector3(0, 1, 0)});
```

The material is based on phong material properties.

#### Properties:
**layers** Array \<MaterialLayer\> Array of MaterialLayer objects


**direction** THREE.Vector3 The direction in world coordinates for stacking the layers

### MaterialLayer

To create a new layered material:
```
const new MaterialLayer();
```

**id** Unique id of the layer

**range** Array \<Number\> lower and upper limit

**rangeTrns** Array \<Number\> lower and upper transition range

**slope** Array \<Number\> lower and upper limit

**slopeTrns** Array \<Number\> lower and upper transition range

**map** Image diffuse texture image

**bumpMap** Image bump texture image

**bumpScale** Number bump scale

**specularStrength** Number the strength of the specularity of the layer

**specularColor** THREE.Color the color of the specularity of the layer

## Development

Start dev server on port 5000:
```
npm run dev
```


