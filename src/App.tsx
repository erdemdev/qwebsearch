import { getCurrent } from '@tauri-apps/api/window';
import SearchBar from './components/SearchBar';
import PresetBrowser from './components/PresetBrowser';

export default function App() {
  return (() => {
    switch (getCurrent().label) {
      case 'search-bar':
        return <SearchBar />;
      case 'preset-browser':
        return <PresetBrowser />;
      default:
        return null;
    }
  })();
}
