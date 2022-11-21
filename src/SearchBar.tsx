import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { getCurrent } from '@tauri-apps/api/window';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/shell';
import { useConfig } from './hooks/config';
import { createSearchPresetsWindow } from './utils/window';

export function SearchBar() {
  const { config, setConfig, isLoading } = useConfig();
  const defaultPreset = useMemo(() => {
    for (let i = 0; i < config['search-presets']['collection'].length; i++) {
      const preset = config['search-presets']['collection'][i];
      if (preset.id === config['search-presets']['default']) return preset;
    }
  }, [config]);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState(defaultPreset);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentWindow = useMemo(() => getCurrent(), []);

  //#region Setup
  // Wait fot config to load before registering event listeners.
  useEffect(() => {
    let unlistenTrayLeftClick: UnlistenFn | undefined = undefined;

    (async () => {
      if (isLoading) return;

      await register('Shift+Space', async () => {
        if ((await currentWindow.outerPosition()).x === -700)
          return setVisible(true);
        return setVisible(false);
      });

      unlistenTrayLeftClick = await listen(
        'tauri://SystemTrayEvent::LeftClick',
        async () => setVisible(true)
      );

      await listen('ts://hideSearchBar', () => alert('ts://hideSearchBar'));

      if (import.meta.env.DEV) {
        invoke('open_devtools');
      }
    })();

    return () => {
      (async () => await unregister('Shift+Space'))();
      if (undefined !== unlistenTrayLeftClick) unlistenTrayLeftClick();
    };
  }, [isLoading]);
  //#endregion

  // #region Toggle Listener
  useEffect(() => {
    let unlistenTauriBlur: UnlistenFn | undefined = undefined;

    (async () => {
      if (visible) {
        await register('Escape', () => setVisible(false));
        await currentWindow.setFocus();
        await currentWindow.center();
        inputRef.current?.focus();
        unlistenTauriBlur = await currentWindow.listen('tauri://blur', () =>
          setVisible(false)
        );
      } else {
        const searchBarSize = await currentWindow.outerSize();
        currentWindow.setPosition({
          type: 'Physical',
          x: -searchBarSize.width,
          y: -searchBarSize.height,
        });
      }
    })();

    return () => {
      if (undefined !== unlistenTauriBlur) unlistenTauriBlur();
      (async () => await unregister('Escape'))();
    };
  }, [visible]);
  //#endregion

  // #region Shortcode Listener
  // "query" updates preset selector.
  useEffect(() => {
    const match = query.match(/^(\w*):/i);
    if (null === match) return setPreset(defaultPreset);

    const preset = config['search-presets']['collection'].find(
      preset => preset.shortcode === match[1] // shortcode index is 1. 0 contains ":" symbol.
    );
    if (undefined === preset) return setPreset(defaultPreset);

    setPreset(preset);
  }, [query]);
  //#endregion

  // #region Callbacks
  const openBrowser = useCallback(async () => {
    await open(
      preset?.url.replace(
        '{{query}}',
        encodeURIComponent(
          query.replace(preset.shortcode + ':', '').trimStart()
        )
      )!
    );
  }, [query, preset]);
  //#endregion

  // #region Render
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        openBrowser();
        setVisible(false);
        setQuery('');
      }}
      className="absolute flex h-full w-full items-center justify-center px-3"
    >
      <div className="flex w-full overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-lg">
        <div
          className="box-content w-8 self-center px-4 hover:cursor-pointer"
          onClick={() => createSearchPresetsWindow()}
        >
          <img src={preset?.icon['data-uri']} alt="" />
        </div>
        <input
          ref={inputRef}
          onChange={e => setQuery(e.currentTarget.value)}
          autoComplete="off"
          spellCheck="false"
          className="text-bold w-full py-2 text-2xl leading-none text-gray-700 outline-none"
          value={query}
          placeholder={preset?.placeholder}
        />
        <div className="block self-center">
          <svg
            className="box-content w-7 fill-gray-400 px-4 text-center"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
        </div>
      </div>
    </form>
  );
  // #endregion
}
