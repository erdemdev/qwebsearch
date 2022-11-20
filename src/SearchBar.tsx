import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { getCurrent } from '@tauri-apps/api/window';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/shell';
import { useAtom } from 'jotai';
import { configAtom } from './state';
import { createSearchPresetsWindow } from './utils/window';

export function SearchBar() {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useAtom(configAtom);
  const defaultSearchPreset = useMemo(() => {
    for (let i = 0; i < config['search-presets']['collection'].length; i++) {
      const preset = config['search-presets']['collection'][i];
      if (preset.id === config['search-presets']['default']) return preset;
    }
  }, [config]);
  const [searchPreset, setSearchPreset] = useState(defaultSearchPreset);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarWindow = useMemo(() => getCurrent(), []);

  //#region Register search bar listeners.
  useEffect(() => {
    let unlistenTrayLeftClick: UnlistenFn | undefined = undefined;

    (async () => {
      await register('Shift+Space', async () => {
        if ((await searchBarWindow.outerPosition()).x === -700)
          return setVisible(true);
        return setVisible(false);
      });

      unlistenTrayLeftClick = await listen('tray:left-click', async () =>
        setVisible(true)
      );

      if (import.meta.env.DEV) {
        // await showSearchBar();
        // createSearchPresetsWindow();
        invoke('open_devtools');
      }
    })();

    return () => {
      (async () => await unregister('Shift+Space'))();
      if (undefined !== unlistenTrayLeftClick) unlistenTrayLeftClick();
    };
  }, []);
  //#endregion

  // #region Listen [visible] state for search bar toggling.
  useEffect(() => {
    let unlistenTauriBlur: UnlistenFn | undefined = undefined;

    (async () => {
      if (visible) {
        await register('Escape', () => setVisible(false));
        await searchBarWindow.setFocus();
        await searchBarWindow.center();
        inputRef.current?.focus();
        unlistenTauriBlur = await searchBarWindow.listen('tauri://blur', () =>
          setVisible(false)
        );
      } else {
        const searchBarSize = await searchBarWindow.outerSize();
        searchBarWindow.setPosition({
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
  }, [visible]); // TODO: add a dependency for search-presets-modal visible state.
  //#endregion

  //#region "searchQuery" updates search preset selector.
  useEffect(() => {
    const match = searchQuery.match(/^(\w*):/i);
    if (null === match) return setSearchPreset(defaultSearchPreset);

    const preset = config['search-presets']['collection'].find(
      preset => preset.shortcode === match[1] // shortcode index is 1. 0 contains ":" symbol.
    );
    if (undefined === preset) return setSearchPreset(defaultSearchPreset);

    setSearchPreset(preset);
  }, [searchQuery]);
  //#endregion

  // #region Callbacks
  const openBrowser = useCallback(async () => {
    await open(
      searchPreset?.url.replace(
        '{{query}}',
        encodeURIComponent(
          searchQuery.replace(searchPreset.shortcode + ':', '').trimStart()
        )
      )!
    );
  }, [searchQuery, searchPreset]);
  //#endregion

  // #region Render
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        openBrowser();
        setVisible(false);
        setSearchQuery('');
      }}
      className="absolute flex h-full w-full items-center justify-center px-3"
    >
      <div className="flex w-full overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-lg">
        <div
          className="box-content w-8 self-center px-4 hover:cursor-pointer"
          onClick={() => {
            // if (undefined !== unlistenBlurEvent) unlistenBlurEvent();
            createSearchPresetsWindow();
          }}
        >
          <img src={searchPreset?.icon['data-uri']} alt="" />
        </div>
        <input
          ref={inputRef}
          onChange={e => setSearchQuery(e.currentTarget.value)}
          autoComplete="off"
          spellCheck="false"
          className="text-bold w-full py-2 text-2xl leading-none text-gray-700 outline-none"
          value={searchQuery}
          placeholder={searchPreset?.placeholder}
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
