const initialState = {
  material: null,
  layer: null,
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
      console.log('set_material', action);
      return updateObject(state, { material: action.payload });
    }
    case 'UPDATE_LAYER': {
      state.material.updateLayer(action.payload);
      return updateObject(state, { layer: action.payload });
    }
    default:
      return state;
  }
};
