import { useEffect, useState } from 'react';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';

export default function useWindowSize(width: number, height: number) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentWindow = getCurrent();

    (async () => {
      await currentWindow.setSize(new LogicalSize(width, height));
      setIsLoading(false);
    })();
  }, []);

  return { isWindowSizing: isLoading };
}
