'use client';

import { Plus } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { SECTION_LAYOUTS } from '@/components/blocks/section-layouts';

/** Switch a section's layout preset (content preserved) and add columns. */
export function SectionLayoutField({ block }: { block: Block }) {
  const switchLayout = useEditorStore((s) => s.switchSectionLayout);
  const addColumn = useEditorStore((s) => s.addColumn);
  const current = String(block.props.layout ?? '');

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/60">Layout</span>
      <div className="grid grid-cols-4 gap-1.5">
        {SECTION_LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            title={layout.label}
            aria-label={layout.label}
            onClick={() => switchLayout(block.id, layout.id)}
            className={`flex h-8 items-center gap-0.5 rounded border p-1 transition ${
              current === layout.id
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5'
                : 'border-black/10 hover:border-[var(--color-brand)]/50'
            }`}
          >
            {layout.columns.map((c, i) => (
              <div
                key={i}
                style={{ flexGrow: c }}
                className="h-full rounded-sm bg-black/15"
              />
            ))}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addColumn(block.id)}
        className="mt-1 flex items-center justify-center gap-1 rounded-md border border-dashed border-black/15 py-1.5 text-xs font-medium text-black/55 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
      >
        <Plus className="size-3.5" aria-hidden />
        Add column
      </button>
      <p className="text-[11px] text-black/40">
        Switching keeps your content — extra boxes fold into the last column.
      </p>
    </div>
  );
}
