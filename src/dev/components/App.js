import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Renderer from './Renderer';
import Dialog from './Dialog';
import SceneSettings from './SceneSettings';
import reducer from '../store/reducer';

const store = createStore(reducer);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Renderer />
        <Dialog />
      </Provider>
    </div>
  );
}

export default App;
