import { getCurrent } from '@tauri-apps/api/window';
import { SearchBar } from './SearchBar';
import { SearchPresetModal } from './SearchPresetModal';

export default function App() {
  return (() => {
    switch (getCurrent().label) {
      case 'search-bar':
        return <SearchBar />;
      case 'search-preset-modal':
        return <SearchPresetModal />;
      default:
        return null;
    }
  })();
}
