import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { open } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import { windowVisibleAtom } from '@/atom';
import useWindowSize from '@/hooks/useWindowSize';
import useConfig from '@/hooks/useConfig';
import ModalWrapper from '@/components/ModalWrapper';
import useShortcut from '@/hooks/useShortcut';

export default function SearchBar() {
  const { isWindowSizing } = useWindowSize(700, 65);
  const [windowVisible, setWindowVisible] = useAtom(windowVisibleAtom);
  const { config, setConfig, isConfigLoading } = useConfig();
  const defaultPreset = useMemo(
    () =>
      config['search-presets'].collection.find(
        item => item.id === config['search-presets'].default
      ),
    [config, isConfigLoading]
  );
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState(defaultPreset);
  const inputRef = useRef<HTMLInputElement>(null);

  // #region Hide on "Escape" key press
  useShortcut('Escape', () => setWindowVisible(false), []);
  // #endregion

  // #region Hide window on blur
  useEffect(() => {
    const unlistenPromise = appWindow.listen(TauriEvent.WINDOW_BLUR, () =>
      setWindowVisible(false)
    );

    return () => {
      unlistenPromise.then(unlistenFn => {
        unlistenFn();
      });
    };
  }, []);
  // #endregion

  // #region Toggle visibility when toggle shortcut pressed.
  useEffect(() => {
    const toggleShortcutPromise = listen('toggle-shortcut', () => {
      if (windowVisible) return setWindowVisible(false);
      setWindowVisible(true);
    });

    return () => {
      toggleShortcutPromise.then(unlistenFn => unlistenFn());
    };
  }, [windowVisible]);
  // #endregion

  // #region Center and focus if visible
  useEffect(() => {
    if (!windowVisible) return;

    appWindow.center();
    inputRef.current?.focus();
  }, [isWindowSizing, windowVisible]);
  // #endregion

  // #region Select search preset on query changge
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

  // #region Open browser on form submit
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
  if (isWindowSizing) return <></>;

  return (
    <ModalWrapper>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setWindowVisible(false);
          openBrowser();
          setQuery('');
        }}
        className="flex h-full"
      >
        <div className="relative flex h-full self-center bg-gray-100">
          <div data-tauri-drag-region className="absolute h-full w-full"></div>
          <svg
            className="box-content w-7 fill-gray-400 text-center"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="none" d="M0 0h24v24H0V0z" />
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
        <Link
          className="box-content w-8 self-center px-4 hover:cursor-pointer"
          to="modal/preset/preset-browser"
        >
          <img src={preset?.icon['data-uri']} alt="" />
        </Link>
        <input
          ref={inputRef}
          onChange={e => setQuery(e.currentTarget.value)}
          autoComplete="off"
          spellCheck="false"
          className="text-bold w-full text-2xl leading-none text-gray-700 outline-none"
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
    </ModalWrapper>
  );
  // #endregion
}
