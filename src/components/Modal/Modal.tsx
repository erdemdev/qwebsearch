import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAtom } from 'jotai';
import { modalCloseLinkAtom } from '@/atom';
import ModalWrapper from '@/components/ModalWrapper';
import useWindowSize from '@/hooks/useWindowSize';
import { getCurrent } from '@tauri-apps/api/window';

export default function Window() {
  const { isWindowSizing } = useWindowSize(500, 400);
  const [modalCloseLink] = useAtom(modalCloseLinkAtom);

  useEffect(() => {
    getCurrent().center();
  }, [isWindowSizing]);

  if (isWindowSizing) return <></>;

  return (
    <ModalWrapper>
      <div className="relative flex justify-end bg-gray-100">
        <div className="absolute h-full w-full" data-tauri-drag-region></div>
        <Link className="z-10 h-6 w-6 p-1 hover:bg-gray-200" to={modalCloseLink}>
          <svg
            className="fill-gray-400"
            /*  style="enable-background:new 0 0 512 512;" */ version="1.1"
            viewBox="0 0 512 512"
            /* xml:space="preserve" */ xmlns="http://www.w3.org/2000/svg" /* xmlns:xlink="http://www.w3.org/1999/xlink" */
          >
            <path d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5  c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9  c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z" />
          </svg>
        </Link>
      </div>
      <Outlet />
    </ModalWrapper>
  );
}
