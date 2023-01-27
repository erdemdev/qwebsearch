import React, { MouseEventHandler } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type defaultConfig from '@/default-config.json';
import { PresetItem } from './PresetItem';

export const SortablePresetItem: React.FC<{
  onClick: MouseEventHandler<HTMLButtonElement>;
  preset: typeof defaultConfig['search-presets']['collection'][0];
  hidden?: boolean;
  autoFocus?: boolean;
}> = props => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.preset.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <PresetItem
      attributes={attributes}
      listeners={listeners}
      ref={setNodeRef}
      style={style}
      onClick={props.onClick}
      preset={props.preset}
      hidden={props.hidden}
      autoFocus={props.autoFocus}
    />
  );
};
