import { WebviewWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useState } from 'react';

export function useWindow(label: string) {
  const [window, setWindow] = useState<WebviewWindow>();

  const createWindow = useCallback(() => {
    const window = new WebviewWindow(label, {
      title: 'Search Presets Modal',
      width: 500,
      height: 400,
      x: 0,
      y: 0,
      fullscreen: false,
      resizable: false,
      transparent: true,
      decorations: import.meta.env.DEV,
      alwaysOnTop: import.meta.env.PROD,
      skipTaskbar: import.meta.env.PROD,
      // center: true,
    });

    window.once('tauri://created', async () => {
      setWindow(window);
      await window.setFocus();
    });

    window.once('tauri://destroyed', () => setWindow(undefined));
  }, []);

  return { window, createWindow };
}
