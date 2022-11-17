import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { writeTextFile, createDir, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';

(async () => {
  const path = await appDir();

  try {
    const settings = JSON.parse(await readTextFile(path + '/settings.json'));
    console.log(settings);
  } catch (error) {
    await createDir(path, { recursive: true });
    await writeTextFile(
      path + '/settings.json',
      JSON.stringify({ test: true })
    );
  }
})();

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

  document.addEventListener(
    'selectstart',
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
