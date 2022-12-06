import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import PresetBrowser from '@/components/PresetBrowser';
import PresetCreator from '@/components/PresetCreator';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <div className="h-screen px-1 pb-3">
          <div className="relative h-full overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-md">
            <Routes>
              <Route path="/" element={<SearchBar />} />
              <Route path="/preset-browser" element={<PresetBrowser />} />
              <Route path="/preset-creator" element={<PresetCreator />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}
