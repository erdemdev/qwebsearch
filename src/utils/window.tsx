import { WebviewWindow } from '@tauri-apps/api/window';

export function createSearchPresetsWindow() {
  const window = new WebviewWindow('search-preset-modal', {
    title: 'Search Presets Modal',
    width: 500,
    height: 400,
    // x: 0,
    // y: 0,
    fullscreen: false,
    resizable: false,
    transparent: true,
    decorations: import.meta.env.DEV,
    alwaysOnTop: true,
    skipTaskbar: import.meta.env.PROD,
    center: true,
  });

  window.once('tauri://created', async () => await window.setFocus());

  return window;
}
