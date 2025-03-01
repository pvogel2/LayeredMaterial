import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Renderer from './Renderer';
import MaterialSettings from './MaterialSettings';
import SceneSettings from './SceneSettings';
import reducer from '../store/reducer';

const store = createStore(reducer);
console.log(store);
function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Renderer />
        <MaterialSettings />
        <SceneSettings />
      </Provider>
    </div>
  );
}

export default App;
