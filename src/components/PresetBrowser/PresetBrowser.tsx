import { Link, OutletProps, useNavigate } from 'react-router-dom';
import { configAtom } from '@/hooks/useConfig';
import { useModalTitle, useModalCloseButton } from '@/components/Modal';
import { useAtom } from 'jotai';
import useShortcut from '@/hooks/useShortcut';

export default function PresetBrowser(props: OutletProps) {
  const [config, setConfig] = useAtom(configAtom);
  const navigate = useNavigate();
  useShortcut('Escape', () => navigate('/'), []);
  useModalCloseButton('/');
  useModalTitle('Select a preset');

  return (
    <>
      <div className="sticky top-0 z-10 flex bg-white py-4">
        <input
          className=" rounded-ou flex-grow rounded-l-md border-y-2 border-l-2 border-gray-300 pl-4 pr-6 outline-none focus:border-gray-900"
          type="text"
          name="filter"
          id="filter"
          placeholder="Search for presets"
        />
        <Link
          to="../preset-creator"
          className="rounded-r-md bg-blue-600 py-2 pr-6 pl-5 font-semibold text-white -outline-offset-1  hover:bg-blue-500"
        >
          New Preset
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {config['search-presets']['collection'].map((preset, index) => (
          <button
            {...(0 === index ? { autoFocus: true } : {})}
            key={index}
            className="relative flex flex-col overflow-hidden rounded-md border-2 border-gray-300 px-2 "
            onClick={() => {
              setConfig(config => {
                const newConfig = { ...config };
                newConfig['search-presets'].default = preset.id;
                return newConfig;
              });
              navigate('/');
            }}
          >
            <img
              className="absolute bottom-16 h-full w-full blur-2xl"
              src={preset.icon['data-uri']}
              alt=""
            />
            <p className="h-6 overflow-clip font-mono">{preset.shortcode}</p>
            <img className="my-3 mx-auto block" src={preset.icon['data-uri']} alt="" />
            <p className="h-6 w-full truncate text-left text-sm">{preset.label}</p>
          </button>
        ))}
      </div>
    </>
  );
}
