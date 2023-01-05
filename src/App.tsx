import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { appWindow, LogicalPosition } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { atom, useAtom } from 'jotai';
import SearchBar from '@/components/SearchBar';
import useConfig from './hooks/useConfig';

// #region Lazy Loaded Components
const Modal = lazy(() => import('@/components/Modal'));
const PresetBrowser = lazy(() => import('@/components/PresetBrowser'));
const PresetCreator = lazy(() => import('@/components/PresetCreator'));
// #endregion

//#region Global State
export const windowVisibleAtom = atom(false);
// #endregion

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
    appWindow.outerSize().then(windowSize => {
      appWindow.setPosition(new LogicalPosition(-windowSize.width, -windowSize.height));
    });
  }, [windowVisible]);
  // #endregion

  // #region Render
  return (
    <Routes>
      <Route index element={<SearchBar />} />
      <Route
        path="modal"
        element={
          <Suspense>
            <Modal />
          </Suspense>
        }
      >
        <Route
          path="preset-browser"
          element={
            <Suspense>
              <PresetBrowser />
            </Suspense>
          }
        />
        <Route
          path="preset-creator"
          element={
            <Suspense>
              <PresetCreator />
            </Suspense>
          }
        />
      </Route>
    </Routes>
    // #endregion
  );
}
