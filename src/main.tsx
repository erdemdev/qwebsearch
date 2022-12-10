import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { register } from '@tauri-apps/api/globalShortcut';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './style.css';
import defaultConfig from './default-config.json';

if (import.meta.env.DEV) invoke('open_devtools');

register(defaultConfig.app['toggle-shortcut'], () => emit('toggle-shortcut'));

// #region Disable WebView context menu in production.
if (import.meta.env.PROD) {
  document.addEventListener(
    'contextmenu',
    e => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );
}
// #endregion

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
