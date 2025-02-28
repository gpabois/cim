import store from './store';
import { Provider } from 'react-redux'

import { createRoot } from 'react-dom/client';
import {App} from './App';
import './style.css';
import './i18n';
import React from 'react';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
