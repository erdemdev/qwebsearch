import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { getCurrent } from '@tauri-apps/api/window';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/api/shell';
import useConfig from '@/hooks/useConfig';
import useWindowSize from '@/hooks/useWindowSize';

export default function SearchBar() {
  //#region Hooks
  useWindowSize(700, 65, true);
  const [config, setConfig, isConfigLoading] = useConfig();
  const defaultPreset = useMemo(
    () =>
      config['search-presets'].collection.find(
        item => item.id === config['search-presets'].default
      ),
    [config, isConfigLoading]
  );
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState(defaultPreset);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarWindow = useMemo(() => getCurrent(), []);

  //#region Initial Listeners
  useEffect(() => {
    if (isConfigLoading /* || presetBrowserWindow */) return;

    const cleanupFns: (() => void)[] = [];

    (async () => {
      await register('Shift+Space', async () => {
        if (
          (await searchBarWindow.outerPosition()).x ===
          -(await searchBarWindow.outerSize()).width
        )
          return setVisible(true);
        return setVisible(false);
      });

      cleanupFns.push(() => unregister('Shift+Space'));

      cleanupFns.push(
        await listen('tauri://SystemTrayEvent::LeftClick', async () => setVisible(true))
      );
    })();

    function cleanup() {
      cleanupFns.forEach(fn => fn());
    }

    return cleanup;
  }, [isConfigLoading /* , presetBrowserWindow */]);
  //#endregion

  // #region Visibility Listener
  useEffect(() => {
    const cleanupFns: (() => void)[] = [];

    (async () => {
      if (visible) {
        await searchBarWindow.setFocus();
        await searchBarWindow.center();
        inputRef.current?.focus();
        await register('Escape', () => setVisible(false));
        cleanupFns.push(() => unregister('Escape'));
        if (!import.meta.env.VITE_NOBLUR_SEARCH_BAR_WINDOW)
          cleanupFns.push(
            await searchBarWindow.listen(TauriEvent.WINDOW_BLUR, () => setVisible(false))
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

    return function cleanup() {
      cleanupFns.forEach(fn => fn());
    };
  }, [visible]);
  //#endregion

  // #region Shortcode Listener
  useEffect(() => {
    const match = query.match(/^(\w*):/i);
    if (null === match) return setPreset(defaultPreset);

    const preset = config['search-presets']['collection'].find(
      // shortcode index is 1. 0 contains shortcode with ":" symbol at the end.
      preset => preset.shortcode === match[1]
    );
    if (undefined === preset) return setPreset(defaultPreset);

    setPreset(preset);
  }, [query]);
  //#endregion

  // #region Open Browser Callback
  const openBrowser = useCallback(async () => {
    await open(
      preset?.url.replace(
        '{{query}}',
        encodeURIComponent(query.replace(preset.shortcode + ':', '').trimStart())
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
      className="flex h-full"
    >
      <Link
        className="box-content w-8 self-center px-4 hover:cursor-pointer"
        to="/preset-browser"
      >
        <img src={preset?.icon['data-uri']} alt="" />
      </Link>
      <input
        ref={inputRef}
        onChange={e => setQuery(e.currentTarget.value)}
        autoComplete="off"
        spellCheck="false"
        className="text-bold w-full pb-px text-2xl leading-none text-gray-700 outline-none"
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
    </form>
  );
  // #endregion
}
