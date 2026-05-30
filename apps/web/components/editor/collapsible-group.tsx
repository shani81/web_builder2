'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * A collapsible inspector section with a chevron header, title, and an optional
 * right-aligned summary — the shared shell used by the navbar's Brand, Menu, and
 * Buttons groups so they look and behave identically.
 */
export function CollapsibleGroup({
  title,
  summary,
  defaultOpen = true,
  children,
}: {
  title: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-black/10">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-black/[0.03]"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-black/40" aria-hidden />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-black/40" aria-hidden />
        )}
        <span className="text-xs font-semibold text-black/70">{title}</span>
        {summary ? (
          <span className="ml-auto truncate text-[11px] text-black/35">
            {summary}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-black/10 p-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}
