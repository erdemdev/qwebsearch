import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useModalCloseButton, useModalTitle } from '@/components/Modal';
import useShortcut from '@/hooks/useShortcut';
import { SubmitHandler } from 'react-hook-form/dist/types';
import { Dropzone } from './Dropzone';
import {
  initializeImageMagick,
  ImageMagick,
  MagickGeometry,
} from '@imagemagick/magick-wasm';

console.log('Preset Creator imported!');

type FormValues = {
  label: string;
  placeholder: string;
  url: string;
  shortcode: string;
  icon: string;
};

export default function PresetCreator() {
  const navigate = useNavigate();
  useShortcut('Escape', () => navigate('../preset-browser'), []);
  useModalCloseButton('/');
  useModalTitle('Create a new preset');
  const [loadingImageMagick, setLoadingImageMagick] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    initializeImageMagick().then(() => setLoadingImageMagick(false));
  }, []);

  const onSubmit: SubmitHandler<FormValues> = data => {
    console.log(data);
  };

  const handleIconChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
    try {
      if (!e.target.files?.length) throw new Error('Image file for icon not found.');

      if (loadingImageMagick) throw new Error('ImageMagick is still loading.');

      const imageType = e.target.files[0].type;
      const imageGeometry = new MagickGeometry(32, 32);
      imageGeometry.ignoreAspectRatio = true;

      ImageMagick.read(new Uint8Array(await e.target.files[0].arrayBuffer()), image => {
        image.resize(imageGeometry);
        image.write(data => {
          const reader = new FileReader();
          reader.onload = e => {
            if (e.target?.result) setValue('icon', e.target.result.toString());
          };
          reader.readAsDataURL(new Blob([data], { type: imageType }));
        });
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);

      setValue('icon', '');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-4 items-center gap-6 pt-6 pb-10 text-right text-gray-700">
          <label className="font-semibold" htmlFor="label">
            Label
          </label>
          <input
            className="col-span-3 rounded-md border-2 py-2 px-3 -outline-offset-1"
            type="text"
            id="label"
            autoFocus
            {...register('label')}
          />
          <label className="font-semibold" htmlFor="best">
            Placeholder
          </label>
          <input
            className="col-span-3 rounded-md border-2 py-2 px-3 -outline-offset-1"
            type="text"
            id="placeholder"
            {...register('placeholder')}
          />
          <label className="font-semibold" htmlFor="url">
            URL
          </label>
          <textarea
            className="col-span-3 w-full rounded-md border-2 px-3 pt-2 font-normal -outline-offset-1"
            id="url"
            rows={3}
            defaultValue={'https://example.com/search?q={{query}}'}
            {...register('url')}
          ></textarea>
          <label className="font-semibold" htmlFor="shortcode">
            Shortcode
          </label>
          <input
            className="col-span-3 rounded-md border-2 py-2 px-3 -outline-offset-1"
            type="text"
            id="shortcode"
            placeholder="gt"
            {...register('shortcode')}
          />
          <label className="font-semibold" htmlFor="iconPreview">
            Icon
          </label>
          <div className="col-span-3">
            <input
              type="file"
              accept="image/png, image/jpeg"
              id="iconPreview"
              onChange={handleIconChange}
            />
            <img src={watch('icon')} alt="test" />
            <input type="hidden" {...register('icon')} />
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex items-center bg-white py-3">
          <Link
            to="../preset-browser"
            className="inline-block rounded-md bg-gray-100 py-2 px-6 font-semibold hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="ml-auto inline-block rounded-md bg-blue-600 py-2 px-6 font-semibold text-white hover:bg-blue-500"
          >
            Create Preset
          </button>
        </div>
      </form>
    </>
  );
}
