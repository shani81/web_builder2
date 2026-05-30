'use client';

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';
import { findBlockInTree, useEditorStore } from '@/stores/editor.store';
import {
  fmtKey,
  fmtOf,
  type TextFormat,
} from '@/components/blocks/text-format';
import type { FocusedText } from './inline-edit-context';

function TBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`grid size-7 place-items-center rounded-md transition ${
        active
          ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
          : 'text-black/60 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Floating toolbar shown above the text element being edited. Toggles
 * bold/italic/underline, text color, and alignment for the whole element by
 * writing a `fmt_<field>` object on the block (applied by InlineText, so it
 * also renders on the published site). Rendered outside the zoomed canvas so
 * `position: fixed` tracks the element's real viewport rect.
 */
export function TextFormatToolbar({ focus }: { focus: FocusedText | null }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const block = useEditorStore((s) =>
    focus && s.activePage
      ? (findBlockInTree(s.activePage.blocks, focus.blockId) ?? null)
      : null,
  );
  if (!focus || !block) return null;

  const fmt = fmtOf(block.props, focus.field) ?? {};
  const set = (patch: Partial<TextFormat>) =>
    updateBlockProps(focus.blockId, {
      [fmtKey(focus.field)]: { ...fmt, ...patch },
    });

  const top = Math.max(8, focus.rect.top - 46);
  const left = Math.max(8, focus.rect.left);

  return (
    <div
      // Keep the editable focused and don't deselect the block on interaction.
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top, left, zIndex: 50 }}
      className="flex items-center gap-0.5 rounded-lg border border-black/10 bg-white p-1 shadow-lg"
    >
      <TBtn
        label="Bold"
        active={fmt.bold}
        onClick={() => set({ bold: !fmt.bold })}
      >
        <Bold className="size-4" aria-hidden />
      </TBtn>
      <TBtn
        label="Italic"
        active={fmt.italic}
        onClick={() => set({ italic: !fmt.italic })}
      >
        <Italic className="size-4" aria-hidden />
      </TBtn>
      <TBtn
        label="Underline"
        active={fmt.underline}
        onClick={() => set({ underline: !fmt.underline })}
      >
        <Underline className="size-4" aria-hidden />
      </TBtn>

      <span className="mx-0.5 h-5 w-px bg-black/10" aria-hidden />

      <label
        title="Text color"
        className="relative grid size-7 cursor-pointer place-items-center rounded-md text-black/60 hover:bg-black/5"
      >
        <span
          className="size-4 rounded-sm border border-black/15"
          style={{ background: fmt.color || '#0F0F12' }}
          aria-hidden
        />
        <input
          type="color"
          aria-label="Text color"
          value={fmt.color || '#0F0F12'}
          onChange={(e) => set({ color: e.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <span className="mx-0.5 h-5 w-px bg-black/10" aria-hidden />

      <TBtn
        label="Align left"
        active={fmt.align === 'left'}
        onClick={() => set({ align: 'left' })}
      >
        <AlignLeft className="size-4" aria-hidden />
      </TBtn>
      <TBtn
        label="Align center"
        active={fmt.align === 'center'}
        onClick={() => set({ align: 'center' })}
      >
        <AlignCenter className="size-4" aria-hidden />
      </TBtn>
      <TBtn
        label="Align right"
        active={fmt.align === 'right'}
        onClick={() => set({ align: 'right' })}
      >
        <AlignRight className="size-4" aria-hidden />
      </TBtn>
    </div>
  );
}
