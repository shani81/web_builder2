'use client';

import { Minus, Plus } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { sectionColumns } from '@/components/blocks/section.block';

const MAX_RATIO = 6;

/** Adjust each column's relative desktop width (ratio units). Does not add or
 *  remove columns — that's the layout switcher (Phase 4). */
export function SectionColumnsField({ block }: { block: Block }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const columns = sectionColumns(block);
  const max = Math.max(...columns, 1);

  const setRatio = (index: number, value: number) => {
    const clamped = Math.min(MAX_RATIO, Math.max(1, value));
    updateBlockProps(block.id, {
      columns: columns.map((c, i) => (i === index ? clamped : c)),
    });
  };

  if (columns.length < 2) {
    return (
      <p className="text-[11px] text-black/40">
        Single-column section — add columns to set relative widths.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">Column widths</span>
      <div className="flex flex-col gap-2">
        {columns.map((ratio, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-xs text-black/45">
              Col {i + 1}
            </span>
            <button
              type="button"
              aria-label={`Decrease column ${i + 1} width`}
              disabled={ratio <= 1}
              onClick={() => setRatio(i, ratio - 1)}
              className="grid size-6 place-items-center rounded border border-black/15 text-black/60 hover:bg-black/5 disabled:opacity-30"
            >
              <Minus className="size-3" aria-hidden />
            </button>
            <span className="w-4 text-center text-sm tabular-nums">
              {ratio}
            </span>
            <button
              type="button"
              aria-label={`Increase column ${i + 1} width`}
              disabled={ratio >= MAX_RATIO}
              onClick={() => setRatio(i, ratio + 1)}
              className="grid size-6 place-items-center rounded border border-black/15 text-black/60 hover:bg-black/5 disabled:opacity-30"
            >
              <Plus className="size-3" aria-hidden />
            </button>
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-black/10">
              <div
                className="h-full rounded bg-[var(--color-brand)]/50"
                style={{ width: `${(ratio / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-black/40">
        Relative widths on desktop (e.g. 1 &amp; 2 = ⅓ and ⅔). Columns stack on
        mobile.
      </p>
    </div>
  );
}
