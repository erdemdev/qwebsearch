import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useModalCloseButton, useModalTitle } from '@/components/Modal';
import useShortcut from '@/hooks/useShortcut';
import { SubmitHandler } from 'react-hook-form/dist/types';
import Dropzone from '../Dropzone';
import { Event, listen } from '@tauri-apps/api/event';
import { fs } from '@tauri-apps/api';
import { confirm } from '@tauri-apps/api/dialog';
import { useAtom } from 'jotai';
import { configAtom } from '@/hooks/useConfig';

type FormValues = {
  id: string;
  label: string;
  placeholder: string;
  url: string;
  shortcode: string;
  icon: {
    'data-uri': string;
  };
};

export default function PresetCreator() {
  const navigate = useNavigate();
  useModalCloseButton('/');
  useModalTitle('Create a new preset');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const [config, setConfig] = useAtom(configAtom);
  const [searchParams] = useSearchParams();

  useShortcut('Escape', () => returnToPresetBrowser, []);

  useEffect(function registerDragAndDropListener() {
    const unListenPromise = listen(
      'tauri://file-drop',
      async (event: Event<string[]>) => {
        const data = await fs.readBinaryFile(event.payload[0]);
        console.log(data);
      }
    );

    return function cleanDragAndDropListener() {
      unListenPromise.then(unListenFn => unListenFn());
    };
  }, []);

  useEffect(function switchToEditMode() {
    const presetId = searchParams.get('id');

    if (null === presetId) return;

    const preset = config['search-presets'].collection.find(
      preset => preset.id === presetId
    );

    if (undefined === preset) return;

    reset(preset);
  }, []);

  // TODO: Insert error messages.
  // TODO: Validate input with zod.
  return (
    <>
      <form onSubmit={handleSubmit(handlePresetSubmit())}>
        <div className="grid grid-cols-4 items-center gap-6 pt-6 pb-10 text-right text-gray-700">
          <input type="hidden" value={Date.now().toString()} {...register('id')} />
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
          <label className="font-semibold" htmlFor="placeholder">
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
            rows={4}
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
            <Dropzone
              // TODO: Style dropzone element.
              id={'iconPreview'}
              // TODO: Change text in dropzone element when preview prop is entered.
              preview={watch('icon.data-uri')}
              onChange={handleIconChange()}
              accept="image/png, image/jpeg"
            />
            <input type="hidden" {...register('icon.data-uri')} />
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex items-center bg-white py-3">
          <Link
            to="../preset-browser"
            className="mr-auto inline-block rounded-md bg-gray-100 py-2 px-6 font-semibold hover:bg-gray-200"
          >
            Cancel
          </Link>
          {searchParams.get('id') ? (
            <button
              onClick={handlePresetDelete()}
              className="inline-block rounded-md bg-red-200 py-2 px-6 font-semibold  text-red-900 hover:bg-red-300"
            >
              Delete
            </button>
          ) : null}
          <button
            type="submit"
            className="ml-3 inline-block rounded-md bg-blue-600 py-2 px-6 font-semibold text-white hover:bg-blue-500"
          >
            Confirm
          </button>
        </div>
      </form>
    </>
  );

  function handleIconChange(): React.ChangeEventHandler<HTMLInputElement> {
    return async e => {
      try {
        if (!e.target.files?.length) throw new Error('Icon field is empty.');

        const { initializeImageMagick, MagickGeometry, ImageMagick } = await import(
          '@imagemagick/magick-wasm'
        );

        await initializeImageMagick();

        const imageType = e.target.files[0].type;
        const imageGeometry = new MagickGeometry(32, 32);
        imageGeometry.ignoreAspectRatio = true;

        ImageMagick.read(new Uint8Array(await e.target.files[0].arrayBuffer()), image => {
          image.resize(imageGeometry);
          image.write(data => {
            const reader = new FileReader();
            reader.onload = e => {
              if (!e.target?.result) throw new Error('FileReader throwed an error!');
              setValue('icon.data-uri', e.target.result.toString());
            };
            reader.readAsDataURL(new Blob([data], { type: imageType }));
          });
        });
      } catch (error) {
        if (import.meta.env.DEV) console.warn(error);

        setValue('icon.data-uri', '');
      }
    };
  }

  function handlePresetSubmit(): SubmitHandler<FormValues> {
    return data => {
      setConfig(config => {
        const newConfig = { ...config };
        const existingPresetIndex = newConfig['search-presets'].collection.findIndex(
          preset => preset.id === data.id
        );

        if (-1 === existingPresetIndex) {
          newConfig['search-presets'].collection.push(data);
        } else {
          newConfig['search-presets'].collection[existingPresetIndex] = data;
        }

        return newConfig;
      });

      returnToPresetBrowser();
    };
  }

  function handlePresetDelete(): React.MouseEventHandler<HTMLButtonElement> {
    return async e => {
      e.preventDefault();

      if (!(await confirm('Are you sure you want to delete this preset?'))) return;

      setConfig(config => {
        const newConfig = { ...config };

        newConfig['search-presets'].collection = config[
          'search-presets'
        ].collection.filter(preset => preset.id !== searchParams.get('id'));

        return newConfig;
      });

      returnToPresetBrowser();
    };
  }

  function returnToPresetBrowser() {
    navigate('../preset-browser');
  }
}
