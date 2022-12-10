import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { modalCloseLinkAtom } from '@/atom';

export default function useModalCloseButton(newLink: string) {
  const [modalCloseLink, setModalCloseLink] = useAtom(modalCloseLinkAtom);

  useEffect(() => {
    const defaultModalCloseLink = modalCloseLink;
    setModalCloseLink(newLink);

    return () => {
      setModalCloseLink(defaultModalCloseLink);
    };
  }, []);
}
