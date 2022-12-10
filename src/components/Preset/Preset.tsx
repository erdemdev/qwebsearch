import { Outlet, useNavigate } from 'react-router-dom';
import useShortcut from '@/hooks/useShortcut';
import useModalCloseButton from '@/hooks/useModalCloseButton';

export default function Preset() {
  const navigate = useNavigate();
  useShortcut('Escape', () => navigate('/'), []);
  useModalCloseButton('/');

  return <Outlet />;
}
