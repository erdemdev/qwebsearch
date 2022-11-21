import { invoke } from '@tauri-apps/api';
import { useEffect, useState } from 'react';
import { useConfig } from './hooks/config';

export function SearchPresetsModal() {
  const { config, setConfig } = useConfig();

  useEffect(() => {
    if (import.meta.env.DEV) invoke('open_devtools');
    // const newConfig = { ...config };
    // newConfig.app.version = 'sex';
    // setConfig(newConfig);
  }, []);

  console.log(Date.now(), config.app.version);

  return (
    <div className="absolute left-0 top-0 h-full w-full bg-red-100 p-2">
      <h1 className="text-xl">Modal Window</h1>
      <br />
      {config['search-presets']['collection'].map(preset => (
        <div key={preset.id}>
          <img className="inline" src={preset.icon['data-uri']} alt="" />
          <span>{preset.label}</span>
        </div>
      ))}
    </div>
  );
}
