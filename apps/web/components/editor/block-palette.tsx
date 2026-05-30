'use client';

import { useEditorStore } from '@/stores/editor.store';
import { PALETTE_BLOCKS } from '@/components/blocks/registry';

/** Left panel: click a block to append it to the page (after the selection). */
export function BlockPalette() {
  const addBlock = useEditorStore((s) => s.addBlock);

  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-black/10 bg-white p-4">
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-black/40">
        Blocks
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {PALETTE_BLOCKS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-3 text-sm transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
          >
            <Icon className="size-5 text-black/60" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <p className="mt-4 px-1 text-xs text-black/40">
        Click a block to add it to the page.
      </p>
    </aside>
  );
}
