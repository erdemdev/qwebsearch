import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// #region Disable WebView context menu on production.
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
    <App />
  </React.StrictMode>
);
