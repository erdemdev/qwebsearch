import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { writeTextFile, createDir, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import defaultConfig from './config.json';

// #region Configuration
(async () => {
  const appVersion = await getVersion();
  const appPath = await appDir();

  try {
    const savedConfig: typeof defaultConfig = JSON.parse(
      await readTextFile(appPath + '/config.json')
    );

    if (savedConfig.app.version !== appVersion)
      throw 'App version is different.';
  } catch (error) {
    console.log(error + ' Creating a new config file.');

    const newConfig = defaultConfig;
    newConfig.app.version = appVersion;

    await createDir(appPath, { recursive: true });
    await writeTextFile(appPath + '/config.json', JSON.stringify(newConfig));
  }
})();
//#endregion

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
