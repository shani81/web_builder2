'use client';

import { useEffect, useRef, useState } from 'react';

interface MenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

/**
 * Minimal dropdown menu. Closes on outside click, Escape, or item selection.
 * `trigger` is the clickable element (e.g. a "⋯" button).
 */
export function Menu({
  trigger,
  items,
  align = 'right',
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-lg text-black/60 transition hover:bg-black/5"
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-9 z-20 min-w-40 overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-lg`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-black/5 ${
                item.destructive ? 'text-red-600' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
