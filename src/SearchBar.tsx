import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { open } from '@tauri-apps/api/shell';
import { getCurrent } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import {
  register,
  unregister,
  unregisterAll,
} from '@tauri-apps/api/globalShortcut';
import googleIcon from './google.png';
import { createSearchPresetsWindow } from './utils/window';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const searchBarWindow = useMemo(() => getCurrent(), []);

  useEffect(() => {
    (async () => {
      await unregisterAll();
      await register('Shift + Space', async () => await toggleSearch());
      await listen('tray:left-click', async () => await showSearchBar());

      if (import.meta.env.DEV) {
        // await showSearchBar();
        createSearchPresetsWindow();
      }
    })();
  }, []);

  const showSearchBar = useCallback(async () => {
    await unregister('Escape');
    await register('Escape', hideSearchBar);
    await searchBarWindow.setFocus();
    await searchBarWindow.center();
    inputRef.current?.focus();
  }, []);

  const hideSearchBar = useCallback(async () => {
    await unregister('Escape');
    const searchBarSize = await searchBarWindow.outerSize();
    searchBarWindow.setPosition({
      type: 'Physical',
      x: -searchBarSize.width,
      y: -searchBarSize.height,
    });
  }, []);

  const toggleSearch = useCallback(async () => {
    if ((await searchBarWindow.outerPosition()).x === -700)
      return await showSearchBar();
    await hideSearchBar();
  }, []);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        await open(
          'https://google.com/search?q=' + encodeURIComponent(searchQuery)
        );
        hideSearchBar();
        setSearchQuery('');
      }}
      className="absolute flex h-full w-full items-center justify-center px-3"
    >
      <div className="flex w-full overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-lg">
        <div
          className="box-content w-8 self-center px-4"
          onClick={e => alert('Websearch Presets Modal')}
        >
          <img src={googleIcon} alt="" />
        </div>
        <input
          ref={inputRef}
          onChange={e => setSearchQuery(e.currentTarget.value)}
          onBlur={e =>
            import.meta.env.PROD
              ? hideSearchBar()
              : console.info(
                  'Firing hideSearchBar() on blur disabled for debug mode.'
                )
          }
          autoComplete="off"
          spellCheck="false"
          className="text-bold w-full py-2 text-2xl leading-none text-gray-700 outline-none"
          value={searchQuery}
          placeholder="Google Search"
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
}
