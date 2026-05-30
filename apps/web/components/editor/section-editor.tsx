'use client';

import { EyeOff, Plus } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { bool } from '@/components/blocks/types';
import { getBlockDefinition } from '@/components/blocks/registry';
import { SectionBlock } from '@/components/blocks/section.block';
import { BlockRenderer } from '@/components/blocks/block-renderer';
import { BlockToolbar } from './block-toolbar';

/** A content block nested inside a column — selectable, with a mini toolbar.
 *  (Drag reordering of nested content is Phase 4; here we reorder via up/down.) */
function NestedBlock({
  block,
  index,
  total,
}: {
  block: Block;
  index: number;
  total: number;
}) {
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selected = selectedId === block.id;
  const label = getBlockDefinition(block.type)?.label ?? block.type;

  return (
    <div
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

/** One editable column (box): its content + an "add content" affordance. */
function ColumnEditor({ column }: { column: Block }) {
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
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(column.id);
      }}
      className={`relative flex min-w-0 flex-col gap-3 rounded-md p-2 transition ${
        isTarget
          ? 'bg-[var(--color-brand)]/5 outline outline-2 outline-[var(--color-brand)]'
          : selected
            ? 'outline-dashed outline-2 outline-[var(--color-brand)]/70'
            : 'outline-dashed outline-1 outline-black/10 hover:outline-[var(--color-brand)]/40'
      }`}
    >
      {hiddenMobile ? (
        <span className="pointer-events-none absolute right-1 top-1 z-10 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          <EyeOff className="size-3" aria-hidden />
          Hidden on mobile
        </span>
      ) : null}
      {children.map((child, i) => (
        <NestedBlock
          key={child.id}
          block={child}
          index={i}
          total={children.length}
        />
      ))}
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

/** Editor view of a Section: reuses the presentational SectionBlock as the grid
 *  shell (so the device-preview layout + auto-stack match published exactly),
 *  with interactive column cells inside. */
export function SectionEditor({ block }: { block: Block }) {
  return (
    <SectionBlock block={block}>
      {(block.children ?? []).map((column) => (
        <ColumnEditor key={column.id} column={column} />
      ))}
    </SectionBlock>
  );
}
