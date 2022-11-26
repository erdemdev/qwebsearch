import { writeTextFile, createDir, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import defaultConfig from './config.json';
import { useEffect, useState } from 'react';

export function useConfig() {
  const [config, setConfig] = useState(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const appVersion = await getVersion();
      const appPath = await appDir();

      try {
        const savedConfig: typeof defaultConfig = JSON.parse(
          await readTextFile(appPath + '/config.json')
        );

        if (savedConfig.app.version !== appVersion) throw 'App version is different.';

        setConfig(savedConfig);
      } catch (error) {
        console.log(error + ' Creating a new config file.');

        const newConfig = defaultConfig;
        newConfig.app.version = appVersion;

        await createDir(appPath, { recursive: true });
        await writeTextFile(appPath + '/config.json', JSON.stringify(newConfig));

        setConfig(newConfig);
      }

      setIsLoading(false);
    })();
  }, []);

  return { config, setConfig, isConfigLoading: isLoading };
}
