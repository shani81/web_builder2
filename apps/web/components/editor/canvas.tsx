'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { deviceWidth } from '@buildr/utils';
import { useEditorStore } from '@/stores/editor.store';
import { SortableBlock } from './sortable-block';
import {
  InlineEditProvider,
  type FocusedText,
  type InlineEdit,
} from './inline-edit-context';
import { TextFormatToolbar } from './text-format-toolbar';

export function Canvas() {
  const blocks = useEditorStore((s) => s.activePage?.blocks ?? []);
  const devicePreview = useEditorStore((s) => s.devicePreview);
  const zoom = useEditorStore((s) => s.zoom);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const [focus, setFocus] = useState<FocusedText | null>(null);

  // Enable on-canvas inline text editing; commits write straight to the store.
  const inlineEdit = useMemo<InlineEdit>(
    () => ({
      enabled: true,
      commit: (blockId, field, value) =>
        updateBlockProps(blockId, { [field]: value }),
      setFocus,
    }),
    [updateBlockProps],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = blocks.map((b) => b.id);
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    reorderBlocks(next);
  };

  return (
    <InlineEditProvider value={inlineEdit}>
      <div
        className="relative flex-1 overflow-auto bg-black/[0.05] p-10"
        onClick={() => selectBlock(null)}
      >
        <div
          className="mx-auto bg-white shadow-sm"
          style={{
            width: deviceWidth(devicePreview),
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
        >
          {blocks.length === 0 ? (
            <div className="grid h-80 place-items-center px-8 text-center text-sm text-black/40">
              <p>
                Drag a block here, or click a block on the left to start
                building.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    index={index}
                    total={blocks.length}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
      <TextFormatToolbar focus={focus} />
    </InlineEditProvider>
  );
}
