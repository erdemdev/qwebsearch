import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import defaultConfig from '@/default-config.json';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

export const PresetItem = React.forwardRef<
  HTMLDivElement | null,
  {
    preset: typeof defaultConfig['search-presets']['collection'][0];
    onClick?: () => void;
    style?: CSSProperties;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap;
    hidden?: boolean;
    dropShadow?: boolean;
  }
>((props, ref) => (
  <div
    ref={ref}
    style={props.style}
    {...props.attributes}
    className={`group relative rounded-md border-2 border-gray-300 bg-white ${
      props.hidden ? 'invisible' : ''
    } ${props.dropShadow ? 'shadow-xl' : ''}`}
  >
    <button
      /* {...(0 === props.index
  ? {
      autoFocus: true,
    }
  : {})} */
      className="relative flex w-full flex-col overflow-hidden px-2"
      onClick={props.onClick}
    >
      <img
        className="absolute bottom-16 h-full w-full blur-2xl"
        src={props.preset.icon['data-uri']}
        alt=""
      />
      <p className="z-10 h-6 overflow-clip font-mono">{props.preset.shortcode}</p>
      <img className="my-3 mx-auto block" src={props.preset.icon['data-uri']} alt="" />
      <p className="z-10 h-6 w-full truncate text-left text-sm">{props.preset.label}</p>
    </button>

    <div className="invisible absolute top-0 right-0 px-1 group-hover:visible">
      <div {...props.listeners}>drag</div>
      <Link to={'../preset-creator' + '?id=' + props.preset.id}>edit</Link>
    </div>
  </div>
));
