import { Link, OutletProps, useNavigate } from 'react-router-dom';
import { configAtom } from '@/hooks/useConfig';
import { useModalTitle, useModalCloseButton } from '@/components/Modal';
import { useAtom } from 'jotai';
import useShortcut from '@/hooks/useShortcut';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SortablePresetItem } from './SortablePresetItem';
import { PresetItem } from './PresetItem';
import { useState } from 'react';

export default function PresetBrowser(props: OutletProps) {
  const [config, setConfig] = useAtom(configAtom);
  const navigate = useNavigate();
  useShortcut('Escape', () => navigate('/'), []);
  useModalCloseButton('/');
  useModalTitle('Select a preset');
  const [activePresetId, setActivePresetId] = useState<UniqueIdentifier>();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={config['search-presets'].collection}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-2 pb-10 pt-4">
            {config['search-presets']['collection'].map(preset => (
              <SortablePresetItem
                key={preset.id}
                preset={preset}
                onClick={handlePresetOnClick(preset.id)}
                hidden={activePresetId === preset.id}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activePresetId ? (
            <PresetItem
              preset={
                config['search-presets'].collection.find(
                  item => item.id === activePresetId
                ) || config['search-presets'].collection[0]
              }
              dropShadow
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="sticky bottom-0 z-40 h-20 bg-gradient-to-t from-white"></div>
      <Link
        to="../preset-creator"
        className="fixed bottom-9 right-11 z-40 ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 align-middle shadow-xl -outline-offset-1 hover:bg-blue-500"
      >
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAaElEQVR4nO3XsQnAMAxEUe0/hXfwTtrCXAhKK1CKEBn/B8aNiuMwApsBaELSkDTvu0MYV/C/sxhhMjSToZnMec0oNqsXznrCrOL8+02tWPFfmHs3U3XeA64iTIZmMjSzSzOjze8AgIULPkr21EcDduAAAAAASUVORK5CYII=" />
      </Link>
    </>
  );

  function handlePresetOnClick(
    presetId: string
  ): React.MouseEventHandler<HTMLButtonElement> {
    return () => {
      setConfig(config => {
        const newConfig = { ...config };
        newConfig['search-presets'].default = presetId;
        return newConfig;
      });
      navigate('/');
    };
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActivePresetId(active.id);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;

    if (active.id !== over.id) {
      setConfig(config => {
        const searchPresets = config['search-presets'].collection;
        const presetIds = searchPresets.map(preset => preset.id);
        const oldIndex = presetIds.indexOf(String(active.id));
        const newIndex = presetIds.indexOf(String(over.id));

        const newConfig = { ...config };
        newConfig['search-presets'].collection = arrayMove(
          searchPresets,
          oldIndex,
          newIndex
        );

        return newConfig;
      });
    }

    setActivePresetId(undefined);
  }
}
