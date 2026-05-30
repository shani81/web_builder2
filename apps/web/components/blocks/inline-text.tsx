'use client';

import {
  createElement,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { useInlineEdit } from '@/components/editor/inline-edit-context';
import { formatStyle, type TextFormat } from './text-format';

/**
 * Renders a text value as the given tag. In the builder (when an InlineEdit
 * provider is present) it becomes click-to-edit: an uncontrolled
 * `contentEditable` that commits the plain text back to the store on blur.
 * Everywhere else it renders the text as-is.
 *
 * It's uncontrolled by design — the initial value is captured once and React
 * never re-writes the DOM, so the caret never jumps. We only commit on blur,
 * so there are no per-keystroke store updates.
 *
 * `formattable` fields also report their on-screen rect on focus so the
 * floating format toolbar can appear; `fmt` (bold/italic/underline/color/align)
 * is applied as an inline style in both the editor and the published site.
 */
export function InlineText({
  blockId,
  field,
  value,
  as = 'span',
  className,
  style,
  multiline = false,
  fmt,
  formattable = false,
}: {
  blockId?: string;
  field: string;
  value: string;
  as?: string;
  className?: string;
  style?: CSSProperties;
  /** Allow Enter to insert a line break instead of committing. */
  multiline?: boolean;
  /** Per-field text formatting (applied editor + published). */
  fmt?: TextFormat;
  /** Show the floating format toolbar when this field is focused. */
  formattable?: boolean;
}) {
  const { enabled, commit, setFocus } = useInlineEdit();
  // Capture the value once (uncontrolled): React must not re-write the DOM
  // mid-edit or the caret jumps. Updates flow out via commit-on-blur only.
  const [initial] = useState(value);

  const mergedStyle: CSSProperties = { ...style, ...formatStyle(fmt) };

  if (!enabled || !blockId) {
    return createElement(as, { className, style: mergedStyle }, value);
  }

  const editableClass = [
    className ?? '',
    'cursor-text outline-none [pointer-events:auto]',
    'focus:outline-dashed focus:outline-2 focus:outline-[var(--color-brand)]/60 focus:outline-offset-2',
  ].join(' ');

  const props: HTMLAttributes<HTMLElement> = {
    className: editableClass,
    style: mergedStyle,
    contentEditable: true,
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': `Edit ${field}`,
    // Don't follow a link (e.g. a button) while editing its label.
    onClick: (e) => e.preventDefault(),
    onFocus: formattable
      ? (e) =>
          setFocus({
            blockId,
            field,
            rect: (e.currentTarget as HTMLElement).getBoundingClientRect(),
          })
      : undefined,
    onKeyDown: (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      } else if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
    },
    onBlur: (e) => {
      const next = (e.currentTarget as HTMLElement).innerText.replace(
        /\n$/,
        '',
      );
      if (next !== value) commit(blockId, field, next);
      if (formattable) setFocus(null);
    },
  };

  return createElement(as, props, initial);
}
