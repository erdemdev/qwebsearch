import { window } from '@tauri-apps/api';
import { WebviewWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useState } from 'react';

export default function useWindow(
  label: string,
  windowOptions: window.WindowOptions
): [window: typeof window, createWindow: typeof createWindow] {
  const [window, setWindow] = useState<WebviewWindow>();

  const createWindow = useCallback(() => {
    const window = new WebviewWindow(label, {
      ...windowOptions,
    });

    window.once('tauri://created', async () => {
      setWindow(window);
      await window.setFocus();
    });

    window.once('tauri://destroyed', () => setWindow(undefined));
  }, []);

  return [window, createWindow];
}
