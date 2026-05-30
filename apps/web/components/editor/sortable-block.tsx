'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { BlockRenderer } from '@/components/blocks/block-renderer';

export function SortableBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const selected = selectedId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      className={`group relative cursor-pointer ${
        selected
          ? 'outline outline-2 outline-[var(--color-brand)]'
          : 'hover:outline hover:outline-1 hover:outline-[var(--color-brand)]/40'
      }`}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-2 top-2 z-10 hidden size-7 cursor-grab place-items-center rounded-md bg-[var(--color-sidebar)] text-white group-hover:grid"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      {/* Content is inert so clicks select the block rather than its internals. */}
      <div className="pointer-events-none">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}
