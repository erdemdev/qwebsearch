import { invoke } from '@tauri-apps/api';
import { useEffect, useState } from 'react';
import useConfig from '@/hooks/useConfig';

export default function PresetBrowser() {
  const [config, setConfig, isConfigLoading] = useConfig();

  useEffect(() => {
    if (isConfigLoading) return;

    if (import.meta.env.DEV) invoke('open_devtools');
  }, [isConfigLoading]);

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
