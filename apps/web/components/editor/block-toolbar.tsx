'use client';

import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Copy, MoreVertical } from 'lucide-react';
import { Menu } from '@/components/ui/menu';

/** Shared style for the compact toolbar icon buttons (incl. the drag handle). */
export const TOOLBAR_BUTTON =
  'grid size-7 place-items-center rounded-md text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black/55';

export type ToolbarPlacement = 'inside' | 'below' | 'above';

/** Short blocks whose content the in-corner bar would cover, so it floats just
 *  above them instead. */
const SHORT_BLOCKS = new Set(['button', 'divider', 'spacer', 'heading']);

/** Where a block's toolbar should sit so it stays visible without hiding the
 *  block's content. */
export function toolbarPlacement(type: string): ToolbarPlacement {
  if (type === 'navbar') return 'below';
  if (SHORT_BLOCKS.has(type)) return 'above';
  return 'inside';
}

/**
 * Floating action bar shown on a block when it's hovered, focused, or selected.
 * Groups the common block actions (drag, reorder, duplicate) and tucks the
 * destructive delete into an overflow menu. It only surfaces store actions the
 * editor could already perform — a pure affordance layer.
 *
 * The drag handle is passed in pre-rendered (`dragHandle`) so the dnd-kit
 * sortable wiring stays in the parent where it's typed.
 */
export function BlockToolbar({
  label,
  isFirst,
  isLast,
  dragHandle,
  placement = 'inside',
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  dragHandle?: ReactNode;
  /** Where the bar sits relative to the block, so it stays visible without
   *  covering content: `below` drops under the block (navbar, whose z-index
   *  would otherwise hide an overlapping bar), `above` floats just over the top
   *  edge (short blocks like buttons), `inside` is the default top-right. */
  placement?: ToolbarPlacement;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const placementClass =
    placement === 'below'
      ? 'top-full mt-2'
      : placement === 'above'
        ? 'bottom-full mb-1'
        : 'top-2';
  return (
    // Stop propagation so toolbar clicks don't toggle block selection.
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-2 z-30 flex items-center gap-0.5 rounded-lg border border-black/10 bg-white/95 p-0.5 shadow-md backdrop-blur ${placementClass}`}
    >
      <span className="select-none px-1.5 text-[11px] font-medium text-black/45">
        {label}
      </span>
      {dragHandle}
      <button
        type="button"
        aria-label="Move up"
        title="Move up"
        disabled={isFirst}
        onClick={onMoveUp}
        className={TOOLBAR_BUTTON}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Move down"
        title="Move down"
        disabled={isLast}
        onClick={onMoveDown}
        className={TOOLBAR_BUTTON}
      >
        <ArrowDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Duplicate"
        title="Duplicate"
        onClick={onDuplicate}
        className={TOOLBAR_BUTTON}
      >
        <Copy className="size-4" aria-hidden />
      </button>
      <Menu
        align="right"
        trigger={<MoreVertical className="size-4" aria-hidden />}
        items={[
          { label: 'Duplicate', onSelect: onDuplicate },
          { label: 'Delete block', onSelect: onDelete, destructive: true },
        ]}
      />
    </div>
  );
}
