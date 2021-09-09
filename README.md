# LayeredMaterial
A threejs material to manage texture layers.

** This is still work in progress **

## Clone

To clone the project:
```bash
git clone https://github.com/pvogel2/LayeredMaterial.git
```
## Installation (not yet released)

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

The material is based on phong material properties, currently without specularity support. This will be added soon.

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

**map** Array \<Images\> diffuse texture images

**bumpMap** Array \<Images\> bump texture images

**bumpScale** Number bump scale

## Development

Start dev server on port 5000:
```
npm run dev
```


