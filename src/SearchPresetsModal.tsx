import { invoke } from '@tauri-apps/api';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { configAtom } from './state';

export function SearchPresetsModal() {
  const [config] = useAtom(configAtom);

  useEffect(() => {
    if (import.meta.env.DEV) invoke('open_devtools');
    console.log('config: ', config);
  }, [config]);

  return (
    <div className="absolute left-0 top-0 h-full w-full bg-red-100 p-2">
      <h1 className="text-xl">Modal Window</h1>
      <br />
      {config['search-presets'].map(preset => (
        <div key={preset.id}>
          <img className="inline" src={preset.icon['data-uri']} alt="" />
          <span>{preset.label}</span>
        </div>
      ))}
    </div>
  );
}
