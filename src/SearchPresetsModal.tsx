import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { useConfig } from './hooks/config';
import { Events } from './constants';

export function SearchPresetsModal() {
  const { config, setConfig, isLoading } = useConfig();

  useEffect(() => {
    if (isLoading) return;

    // if (import.meta.env.DEV) invoke('open_devtools');

    (async () => {
      await emit(Events.SearchPresetsModal.created);
    })();
  }, [isLoading]);

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
