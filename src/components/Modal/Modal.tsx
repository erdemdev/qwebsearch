import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { atom, useAtom } from 'jotai';
import { getCurrent } from '@tauri-apps/api/window';
import ModalWrapper from '@/components/ModalWrapper';
import useWindowSize from '@/hooks/useWindowSize';

export default function Modal() {
  const isWindowSizing = useWindowSize(520, 400);
  const [modalCloseLink] = useAtom(modalCloseLinkAtom);
  const [modalTitle] = useAtom(modalTitleAtom);

  useEffect(() => {
    getCurrent().center();
  }, [isWindowSizing]);

  if (isWindowSizing) return <></>;

  return (
    <ModalWrapper>
      <div className="relative flex bg-gray-100">
        <div className="absolute h-full w-full" data-tauri-drag-region></div>
        <h1 className="ml-2 mt-px flex-grow text-sm font-semibold text-gray-400">
          {modalTitle}
        </h1>
        <Link
          className="z-10 h-6 w-6 p-1 -outline-offset-1 hover:bg-gray-200"
          to={modalCloseLink}
        >
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
      <div className="relative min-w-full flex-grow overflow-x-hidden overflow-y-scroll px-5">
        <Outlet />
        {/* <div className="sticky bottom-0 z-10 block h-6 w-full bg-white"></div> */}
      </div>
    </ModalWrapper>
  );
}

const modalCloseLinkAtom = atom('/');
const modalTitleAtom = atom('');

export function useModalTitle(newTitle: string) {
  const [modalTitle, setModalTitle] = useAtom(modalTitleAtom);

  useEffect(() => {
    const defaultModalTitle = modalTitle;
    setModalTitle(newTitle);

    return () => {
      setModalTitle(defaultModalTitle);
    };
  }, []);
}

export function useModalCloseButton(newLink: string) {
  const [modalCloseLink, setModalCloseLink] = useAtom(modalCloseLinkAtom);

  useEffect(() => {
    const defaultModalCloseLink = modalCloseLink;
    setModalCloseLink(newLink);

    return () => {
      setModalCloseLink(defaultModalCloseLink);
    };
  }, []);
}
