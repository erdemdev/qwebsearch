import { useEffect } from 'react';

export default function useShortcut(
  shortcut: string,
  handler: () => void,
  deps: React.DependencyList
) {
  useEffect(() => {
    function listenShortcutPress(event: KeyboardEvent) {
      if (event.key === shortcut) handler();
    }

    document.addEventListener('keydown', listenShortcutPress);

    return () => {
      document.removeEventListener('keydown', listenShortcutPress);
    };
  }, deps);
}
