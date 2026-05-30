'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { str } from '@/components/blocks/types';

/**
 * Manage a Features block's cards: add, remove, reorder. The card text itself
 * is edited inline on the canvas — each card is a real `feature-item` child
 * block, so these reuse the generic store ops (add/remove/move).
 */
export function FeatureItemsField({ block }: { block: Block }) {
  const addFeatureItem = useEditorStore((s) => s.addFeatureItem);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const cards = block.children ?? [];

  const iconBtn =
    'grid size-7 shrink-0 place-items-center rounded-md text-black/45 transition hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">Feature cards</span>
      <p className="text-[11px] text-black/40">
        Click a card on the page to edit its text. Use these to add, remove, or
        reorder.
      </p>

      <div className="flex flex-col gap-1.5">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1.5"
          >
            <span
              className="min-w-0 flex-1 truncate text-sm"
              title={str(card.props.title)}
            >
              {str(card.props.title) || (
                <span className="text-black/30">Untitled</span>
              )}
            </span>
            <button
              type="button"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => moveBlock(card.id, 'up')}
              className={iconBtn}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={i === cards.length - 1}
              onClick={() => moveBlock(card.id, 'down')}
              className={iconBtn}
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Delete card"
              onClick={() => removeBlock(card.id)}
              className="grid size-7 shrink-0 place-items-center rounded-md text-red-500 transition hover:bg-red-50"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addFeatureItem(block.id)}
        className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-black/15 py-2 text-xs font-medium text-black/55 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
      >
        <Plus className="size-4" aria-hidden />
        Add feature
      </button>
    </div>
  );
}
