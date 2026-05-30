'use client';

import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import type { Block } from '@buildr/types';
import {
  blockSiblings,
  findParentBlock,
  useEditorStore,
} from '@/stores/editor.store';

/** Structural actions for a column: reorder within its section, or remove it. */
export function ColumnActions({ block }: { block: Block }) {
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const removeColumn = useEditorStore((s) => s.removeColumn);
  const section = useEditorStore((s) =>
    s.activePage ? findParentBlock(s.activePage.blocks, block.id) : null,
  );
  const siblings = useEditorStore((s) =>
    s.activePage ? blockSiblings(s.activePage.blocks, block.id) : null,
  );
  const index = siblings?.index ?? 0;
  const total = siblings?.total ?? 1;

  const btn =
    'flex flex-1 items-center justify-center gap-1 rounded-md border border-black/15 py-1.5 text-xs font-medium text-black/60 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">Column</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => moveBlock(block.id, 'up')}
          className={btn}
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Left
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => moveBlock(block.id, 'down')}
          className={btn}
        >
          Right
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Delete column"
          disabled={total <= 1 || !section}
          onClick={() => section && removeColumn(section.id, block.id)}
          className="grid size-8 shrink-0 place-items-center rounded-md border border-black/15 text-red-500 transition hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
