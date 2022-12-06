import { invoke } from '@tauri-apps/api';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';
import { useEffect } from 'react';

export default function useWindowSize(
  width: number,
  height: number,
  center: boolean = false
) {
  useEffect(() => {
    (async () => {
      const currentWindow = getCurrent();
      currentWindow.setSize(new LogicalSize(width, height));
      currentWindow.setFocus();
      if (center) currentWindow.center();
      if (import.meta.env.DEV) invoke('open_devtools');
    })();
  }, []);
}
