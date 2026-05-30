'use client';

import { X } from 'lucide-react';
import { useEditorStore } from '@/stores/editor.store';
import { PALETTE_BLOCKS } from '@/components/blocks/registry';
import { SECTION_LAYOUTS } from '@/components/blocks/section-layouts';
import type { BlockDefinition } from '@/components/blocks/types';

/** Category groups shown in the palette, in display order. */
const GROUPS: { category: BlockDefinition['category']; label: string }[] = [
  { category: 'layout', label: 'Sections' },
  { category: 'content', label: 'Content' },
  { category: 'media', label: 'Media' },
  { category: 'advanced', label: 'Advanced' },
];

/** A little diagram of the columns in a layout preset. */
function LayoutThumb({ columns }: { columns: number[] }) {
  return (
    <div className="flex h-7 w-full gap-1" aria-hidden>
      {columns.map((c, i) => (
        <div
          key={i}
          style={{ flexGrow: c }}
          className="rounded-sm bg-black/15"
        />
      ))}
    </div>
  );
}

/** Left panel: add layout sections and blocks. */
export function BlockPalette() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const addSection = useEditorStore((s) => s.addSection);
  const addTargetColumnId = useEditorStore((s) => s.addTargetColumnId);
  const setAddTarget = useEditorStore((s) => s.setAddTarget);

  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-black/10 bg-white p-4">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-black/40">
        Blocks
      </h2>
      <p className="mt-1 px-1 text-xs text-black/40">
        Click a block to add it to the page.
      </p>

      {addTargetColumnId ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[var(--color-brand)]/10 px-3 py-2 text-xs text-[var(--color-brand)]">
          <span className="font-medium">Adding into a column…</span>
          <button
            type="button"
            aria-label="Cancel adding to column"
            title="Cancel"
            onClick={() => setAddTarget(null)}
            className="grid size-5 place-items-center rounded hover:bg-[var(--color-brand)]/15"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-5">
        {/* Layouts — drop in a multi-column section, then fill each column. */}
        <div>
          <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-black/35">
            Layouts
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SECTION_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                title={`Add a ${layout.label} section`}
                onClick={() => addSection(layout.id)}
                className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-2.5 text-center text-[11px] font-medium text-black/70 transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
              >
                <LayoutThumb columns={layout.columns} />
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {GROUPS.map(({ category, label }) => {
          const items = PALETTE_BLOCKS.filter((b) => b.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-black/35">
                {label}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {items.map(({ type, label: blockLabel, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    title={`Add ${blockLabel}`}
                    onClick={() => addBlock(type)}
                    className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-3 text-center text-xs font-medium text-black/70 transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                  >
                    <Icon className="size-5 text-black/55" aria-hidden />
                    {blockLabel}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
