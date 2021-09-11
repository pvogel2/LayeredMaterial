const initialState = {
  material: null,
  layer: null,
  randomize: true,
  minmax: [-5, 5],
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
      return updateObject(state, { material: action.payload });
    }

    case 'SET_SCENE': {
      return updateObject(state, { scene: action.payload });
    }

    case 'ADD_MESH': {
      const scene = state.scene;
      const name = action.payload;
      if (state.mesh === name) {
        return state;
      };

      const mesh = state.meshes.find((m) => m.name === name);

      if (scene && mesh) {
        scene.add(mesh);
      }
      return updateObject(state, { mesh: name });
    }

    case 'REMOVE_MESH': {
      const scene = state.scene;
      const name = action.payload;
      const mesh = state.meshes.find((m) => m.name === name);
      console.log('REMOVE', name, mesh, scene);
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

    case 'RANDOMIZE': {
      const defines = { ...state.material.defines };
      if (action.payload === true) {
        defines.USE_UV_MIX = '';
      } else {
        delete defines.USE_UV_MIX;
      }
      state.material.setValues({ defines });
      state.material.needsUpdate = true;

     return updateObject(state, { randomize: action.payload });
    }
    default:
      return state;
  }
};
