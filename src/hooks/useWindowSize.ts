import { useEffect, useState } from 'react';
import { getCurrent, LogicalSize } from '@tauri-apps/api/window';

export default function useWindowSize(width: number, height: number) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrent()
      .setSize(new LogicalSize(width, height))
      .then(() => setIsLoading(false));
  }, []);

  return isLoading;
}
