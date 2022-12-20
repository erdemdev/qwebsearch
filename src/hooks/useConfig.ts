import { writeTextFile, createDir, readTextFile } from '@tauri-apps/api/fs';
import { appDir } from '@tauri-apps/api/path';
import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import defaultConfig from '@/default-config.json';

export const configAtom = atom(defaultConfig);

export default function useConfig() {
  const [config, setConfig] = useAtom(configAtom);
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

  useEffect(() => {
    if (isLoading) return;
    (async () => {
      await writeTextFile((await appDir()) + '/config.json', JSON.stringify(config));
      if (import.meta.env.DEV) console.log('Config wrote to dist.');
    })();
  }, [config, isLoading]);

  return isLoading;
}
