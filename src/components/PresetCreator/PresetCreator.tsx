import { Link } from 'react-router-dom';
import useWindowSize from '@/hooks/useWindowSize';

export default function PresetCreator() {
  useWindowSize(500, 400, true);

  return (
    <div className="p-8">
      <Link to="/preset-browser">Go Back</Link>
      <p>Testing 123</p>
    </div>
  );
}
