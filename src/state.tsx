import { writeTextFile, createDir, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { atom } from 'jotai';
import defaultConfig from './config.json';

export const configAtom = atom(
  (async () => {
    const appVersion = await getVersion();
    const appPath = await appDir();

    try {
      const savedConfig: typeof defaultConfig = JSON.parse(
        await readTextFile(appPath + '/config.json')
      );

      if (savedConfig.app.version !== appVersion)
        throw 'App version is different.';

      return savedConfig;
    } catch (error) {
      console.log(error + ' Creating a new config file.');

      const newConfig = defaultConfig;
      newConfig.app.version = appVersion;

      await createDir(appPath, { recursive: true });
      await writeTextFile(appPath + '/config.json', JSON.stringify(newConfig));

      return newConfig;
    }
  })()
);
