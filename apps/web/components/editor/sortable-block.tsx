'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { getBlockDefinition } from '@/components/blocks/registry';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import {
  BlockToolbar,
  TOOLBAR_BUTTON,
  toolbarPlacement,
} from './block-toolbar';
import { SectionEditor } from './section-editor';

export function SortableBlock({
  block,
  index,
  total,
}: {
  block: Block;
  index: number;
  total: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selected = selectedId === block.id;

  const label = getBlockDefinition(block.type)?.label ?? block.type;

  const dragHandle = (
    <button
      type="button"
      aria-label="Drag to reorder"
      title="Drag to reorder"
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      className={`${TOOLBAR_BUTTON} cursor-grab active:cursor-grabbing`}
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      role="group"
      tabIndex={0}
      aria-label={`${label} block. Press Enter to select.`}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onKeyDown={(e) => {
        if (
          (e.key === 'Enter' || e.key === ' ') &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          selectBlock(block.id);
        }
      }}
      className={`group relative cursor-pointer outline-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] ${
        selected
          ? 'outline outline-2 outline-[var(--color-brand)]'
          : 'hover:outline hover:outline-1 hover:outline-[var(--color-brand)]/40'
      }`}
    >
      <div
        className={
          selected ? 'flex' : 'hidden group-hover:flex group-focus-within:flex'
        }
      >
        <BlockToolbar
          label={label}
          isFirst={index === 0}
          isLast={index === total - 1}
          dragHandle={dragHandle}
          placement={toolbarPlacement(block.type)}
          onMoveUp={() => moveBlock(block.id, 'up')}
          onMoveDown={() => moveBlock(block.id, 'down')}
          onDuplicate={() => duplicateBlock(block.id)}
          onDelete={() => removeBlock(block.id)}
        />
      </div>

      {/* Sections are interactive (nested columns/content are selectable);
          every other block's content is inert so clicks select the block. */}
      {block.type === 'section' ? (
        <SectionEditor block={block} />
      ) : (
        <div className="pointer-events-none">
          <BlockRenderer block={block} />
        </div>
      )}

      {/* Insertion indicator: new blocks are added right after the selection. */}
      {selected ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px flex items-center gap-2 px-3"
        >
          <span className="h-px flex-1 bg-[var(--color-brand)]" />
          <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            New blocks add here
          </span>
          <span className="h-px flex-1 bg-[var(--color-brand)]" />
        </div>
      ) : null}
    </div>
  );
}
