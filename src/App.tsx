import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { appWindow, LogicalPosition } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom } from 'jotai';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import PresetBrowser from '@/components/PresetBrowser';
import PresetCreator from '@/components/PresetCreator';
import useConfig from './hooks/useConfig';

export const windowVisibleAtom = atom(false);

export default function App() {
  const isConfigLoading = useConfig();
  const [windowVisible, setWindowVisible] = useAtom(windowVisibleAtom);
  const navigate = useNavigate();

  // #region Listen System Tray LeftClick Events
  useEffect(() => {
    const unlistenPromise = listen('tauri://SystemTrayEvent::LeftClick', () => {
      setWindowVisible(true);
      navigate('/');
    });
    return () => {
      unlistenPromise.then(unlistenFn => unlistenFn());
    };
  }, []);
  // #endregion

  // #region Window Visibility Listener
  useEffect(() => {
    if (windowVisible) {
      appWindow.setFocus();
      appWindow.center();
      return;
    }
    appWindow
      .outerSize()
      .then(windowSize =>
        appWindow.setPosition(new LogicalPosition(-windowSize.width, -windowSize.height))
      );
  }, [windowVisible]);
  // #endregion

  return (
    <Routes>
      <Route index element={<SearchBar />} />
      <Route path="modal" element={<Modal />}>
        <Route path="preset-browser" element={<PresetBrowser />} />
        <Route path="preset-creator" element={<PresetCreator />} />
      </Route>
    </Routes>
  );
}
