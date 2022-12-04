import { getCurrent } from '@tauri-apps/api/window';
import SearchBar from './components/SearchBar';
import SearchPresetsModal from './components/SearchPresetsModal';

export default function App() {
  return (() => {
    switch (getCurrent().label) {
      case 'search-bar':
        return <SearchBar />;
      case 'search-presets-modal':
        return <SearchPresetsModal />;
      default:
        return null;
    }
  })();
}
