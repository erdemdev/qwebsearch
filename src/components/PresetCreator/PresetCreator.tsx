import { Link, useNavigate } from 'react-router-dom';
import { useModalCloseButton, useModalTitle } from '@/components/Modal';
import useShortcut from '@/hooks/useShortcut';

export default function PresetCreator() {
  const navigate = useNavigate();
  useShortcut('Escape', () => navigate('/'), []);
  useModalCloseButton('/');
  useModalTitle('Create a new preset');

  return (
    <>
      <Link to="../preset-browser">Go Back</Link>
      <p>Testing 123</p>
    </>
  );
}
