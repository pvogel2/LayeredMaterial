const initialState = {
  material: null,
  layer: null,
  randomize: true,
  triplanar: true,
  minmax: [-5, 5],
  mesh: '',
}

function updateObject(oldObject, newValues) {
  // Encapsulate the idea of passing a new object as the first parameter
  // to Object.assign to ensure we correctly copy data instead of mutating
  return Object.assign({}, oldObject, newValues)
}

export default function appReducer(state = initialState, action) {
/* function material(material = null, action) {
  switch (action.type) {
    case 'SET_MATERIAL':
      return action.payload;
    default:
      return material;
  }
}

function updateLayer(layer = null, action) {
  if (action.type === 'UPDATE_LAYER') {
    material.updateLayer(action.payload);
    return action.layer;
  } else {
    return layer;
  }
}

export default combineReducers({
  material,
  updateLayer,
}); */
  switch (action.type) {
    case 'SET_MATERIAL': {
      const m = action.payload;
      state.meshes.forEach((o) => {
          o.material = m;
      });
      return updateObject(state, { material: action.payload });
    }

    case 'SET_SCENE': {
      return updateObject(state, { scene: action.payload });
    }

    case 'ADD_MESH': {
      const scene = state.scene;
      const name = action.payload;

      const mesh = state.meshes.find((m) => m.name === name);

      if (state.mesh !== name && scene && mesh) {
        const minmax = [mesh.userData.min, mesh.userData.max];
        scene.add(mesh);

        return updateObject(state, { mesh: name, minmax });
      }
      return state;
    }

    case 'REMOVE_MESH': {
      const scene = state.scene;
      const name = action.payload;
      const mesh = state.meshes.find((m) => m.name === name);
      if (scene && mesh) {
        scene.remove(mesh);
      }

      return updateObject(state, { mesh: null });
    }

    case 'SET_MESHES': {
      return updateObject(state, { meshes: action.payload });
    }

    case 'SET_MINMAX': {
      return updateObject(state, { minmax: [...action.payload] });
    }

    case 'UPDATE_LAYER': {
      state.material.updateLayer(action.payload);
      return updateObject(state, { layer: action.payload });
    }

    case 'TRIPLANAR': {
      const defines = { ...state.material.defines };
      if (action.payload === true) {
        defines.USE_TRIPLANAR = '';
      } else {
        delete defines.USE_TRIPLANAR;
      }
      state.material.setValues({ defines });
      state.material.needsUpdate = true;

     return updateObject(state, { triplanar: action.payload });
    }

    case 'RANDOMIZE': {
      const defines = { ...state.material.defines };
      if (action.payload === true) {
        defines.USE_MIXUV = '';
      } else {
        delete defines.USE_MIXUV;
      }
      state.material.setValues({ defines });
      state.material.needsUpdate = true;

     return updateObject(state, { randomize: action.payload });
    }
    default:
      return state;
  }
};
