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
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EyeOff, GripVertical, Plus } from 'lucide-react';
import type { Block } from '@buildr/types';
import { bool } from '@/components/blocks/types';
import { findParentBlock, useEditorStore } from '@/stores/editor.store';
import { getBlockDefinition } from '@/components/blocks/registry';
import { SectionBlock } from '@/components/blocks/section.block';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import {
  BlockToolbar,
  TOOLBAR_BUTTON,
  toolbarPlacement,
} from './block-toolbar';

/** A content block nested inside a column — selectable, draggable, with a mini
 *  toolbar (drag, reorder up/down, duplicate, delete). */
function NestedBlock({
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
      className={`group/nested relative cursor-pointer rounded-sm outline-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] ${
        selected
          ? 'outline outline-2 outline-[var(--color-brand)]'
          : 'hover:outline hover:outline-1 hover:outline-[var(--color-brand)]/40'
      }`}
    >
      <div
        className={
          selected
            ? 'flex'
            : 'hidden group-hover/nested:flex group-focus-within/nested:flex'
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
      <div className="pointer-events-none">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}

/** One editable column (box): draggable, with its content + "add content". */
function ColumnEditor({ column }: { column: Block }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const setAddTarget = useEditorStore((s) => s.setAddTarget);
  const addTargetColumnId = useEditorStore((s) => s.addTargetColumnId);
  const selected = selectedId === column.id;
  const isTarget = addTargetColumnId === column.id;
  const hiddenMobile = bool(column.props.hiddenMobile, false);
  const children = column.children ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(column.id);
      }}
      className={`group/col relative flex min-w-0 flex-col gap-3 rounded-md p-2 transition ${
        isTarget
          ? 'bg-[var(--color-brand)]/5 outline outline-2 outline-[var(--color-brand)]'
          : selected
            ? 'outline-dashed outline-2 outline-[var(--color-brand)]/70'
            : 'outline-dashed outline-1 outline-black/10 hover:outline-[var(--color-brand)]/40'
      }`}
    >
      {/* Column drag handle */}
      <button
        type="button"
        aria-label="Drag column"
        title="Drag column"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1 top-1 z-10 hidden size-6 cursor-grab place-items-center rounded bg-[var(--color-sidebar)] text-white group-hover/col:grid"
      >
        <GripVertical className="size-3.5" aria-hidden />
      </button>

      {hiddenMobile ? (
        <span className="pointer-events-none absolute right-1 top-1 z-10 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          <EyeOff className="size-3" aria-hidden />
          Hidden on mobile
        </span>
      ) : null}

      <SortableContext
        items={children.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {children.map((child, i) => (
          <NestedBlock
            key={child.id}
            block={child}
            index={i}
            total={children.length}
          />
        ))}
      </SortableContext>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAddTarget(isTarget ? null : column.id);
        }}
        className={`flex items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-xs font-medium transition ${
          isTarget
            ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
            : 'border-black/15 text-black/45 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]'
        }`}
      >
        <Plus className="size-4" aria-hidden />
        {isTarget ? 'Pick a block on the left…' : 'Add content'}
      </button>
    </div>
  );
}

/** Editor view of a Section: a DnD context (drag columns horizontally, content
 *  vertically — reordering within a parent) wrapping the presentational grid. */
export function SectionEditor({ block }: { block: Block }) {
  const reorderChildren = useEditorStore((s) => s.reorderChildren);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const columns = block.children ?? [];

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const blocks = useEditorStore.getState().activePage?.blocks ?? [];
    const activeParent = findParentBlock(blocks, active.id as string);
    const overParent = findParentBlock(blocks, over.id as string);
    // Only reorder within the same parent (column-in-section or content-in-column).
    if (!activeParent || !overParent || activeParent.id !== overParent.id) {
      return;
    }
    const ids = (activeParent.children ?? []).map((c) => c.id);
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from < 0 || to < 0) return;
    reorderChildren(activeParent.id, arrayMove(ids, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SectionBlock block={block}>
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <ColumnEditor key={column.id} column={column} />
          ))}
        </SortableContext>
      </SectionBlock>
    </DndContext>
  );
}
