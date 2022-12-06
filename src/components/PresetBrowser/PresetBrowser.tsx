import { useEffect, useState } from 'react';
import useConfig from '@/hooks/useConfig';
import useWindowSize from '@/hooks/useWindowSize';
import { Link } from 'react-router-dom';

export default function PresetBrowser() {
  useWindowSize(500, 400, true);
  const [config, setConfig, isConfigLoading] = useConfig();

  useEffect(() => {
    if (isConfigLoading) return;
  }, [isConfigLoading]);

  return (
    <>
      <div className="p-10">
        <Link to="/" className="absolute top-0 right-0">
          Kapat
        </Link>
        <div className="flex">
          <input
            className=" flex-grow rounded-l-md border-y-2 border-l-2 border-gray-300 pl-4 pr-6 outline-none"
            type="text"
            name="filter"
            id="filter"
            placeholder="Search for presets"
          />
          <Link
            to="/preset-creator"
            className="rounded-r-md bg-blue-600 py-2 pr-6 pl-5 font-semibold text-white"
          >
            New Preset
          </Link>
        </div>
        <div className="my-6">
          {config['search-presets']['collection'].map(preset => (
            <div key={preset.id}>
              <img className="inline" src={preset.icon['data-uri']} alt="" />
              <span>{preset.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
