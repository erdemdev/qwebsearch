import React, { CSSProperties, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import defaultConfig from '@/default-config.json';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

export const PresetItem = React.forwardRef<
  HTMLDivElement | null,
  {
    preset: typeof defaultConfig['search-presets']['collection'][0];
    onClick?: MouseEventHandler<HTMLButtonElement>;
    style?: CSSProperties;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
    hidden?: boolean;
    dropShadow?: boolean;
    autoFocus?: boolean;
  }
>((props, ref) => (
  <div
    ref={ref}
    style={props.style}
    className={`group relative block rounded-md border-2 border-gray-300 bg-white outline-none ${
      props.hidden ? 'invisible' : ''
    } ${props.dropShadow ? 'shadow-xl' : ''}`}
  >
    <button
      onClick={props.onClick}
      className="absolute z-20 h-full w-full outline-offset-1"
      autoFocus={props.autoFocus}
    ></button>
    <div className="relative flex w-full flex-col overflow-hidden">
      <img
        className="absolute bottom-16 h-full w-full blur-2xl"
        src={props.preset.icon['data-uri']}
        alt=""
      />
      <div className="flex">
        <p className="z-10 h-6 flex-grow truncate pl-2 text-left font-mono">
          {props.preset.shortcode}
        </p>
        <button
          {...props.listeners}
          {...props.attributes}
          className="invisible z-20 w-0 group-hover:visible group-hover:w-auto"
        >
          <svg
            version="1.1"
            width="23"
            height="23"
            viewBox="0 0 30 30"
            className="z-20 -rotate-90 cursor-move opacity-40"
          >
            <title>drag-handle-corner-line</title>
            <circle cx="12" cy="24" r="1.5"></circle>
            <circle cx="18" cy="24" r="1.5"></circle>
            <circle cx="18" cy="18" r="1.5"></circle>
            <circle cx="24" cy="12" r="1.5"></circle>
            <circle cx="24" cy="24" r="1.5"></circle>
            <circle cx="24" cy="18" r="1.5"></circle>
          </svg>
        </button>
      </div>
      <img className="my-3 mx-auto block" src={props.preset.icon['data-uri']} alt="" />
      <div className="flex">
        <p className="z-10 h-6 w-full truncate pl-2 text-left text-sm">
          {props.preset.label}
        </p>
        <Link
          to={'../preset-creator' + '?id=' + props.preset.id}
          className="invisible relative z-20 h-6 w-0 pr-1 group-hover:visible group-hover:w-auto"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 25 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </Link>
      </div>
    </div>
  </div>
));
