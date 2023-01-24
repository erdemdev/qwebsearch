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
          <div className="grid grid-cols-4 gap-2">
            {config['search-presets']['collection'].map(preset => (
              <SortablePresetItem
                key={preset.id}
                preset={preset}
                onClick={handlePresetOnClick(preset.id)}
                isActive={activePresetId === preset.id}
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
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );

  function handlePresetOnClick(presetId: string) {
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
