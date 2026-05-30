'use client';

import {
  createElement,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { useInlineEdit } from '@/components/editor/inline-edit-context';

/**
 * Renders a text value as the given tag. In the builder (when an InlineEdit
 * provider is present) it becomes click-to-edit: an uncontrolled
 * `contentEditable` that commits the plain text back to the store on blur.
 * Everywhere else it renders the text as-is.
 *
 * It's uncontrolled by design — the initial value is captured once and React
 * never re-writes the DOM, so the caret never jumps. We only commit on blur,
 * so there are no per-keystroke store updates.
 */
export function InlineText({
  blockId,
  field,
  value,
  as = 'span',
  className,
  style,
  multiline = false,
}: {
  blockId?: string;
  field: string;
  value: string;
  as?: string;
  className?: string;
  style?: CSSProperties;
  /** Allow Enter to insert a line break instead of committing. */
  multiline?: boolean;
}) {
  const { enabled, commit } = useInlineEdit();
  // Capture the value once (uncontrolled): React must not re-write the DOM
  // mid-edit or the caret jumps. Updates flow out via commit-on-blur only.
  const [initial] = useState(value);

  if (!enabled || !blockId) {
    return createElement(as, { className, style }, value);
  }

  const editableClass = [
    className ?? '',
    'cursor-text outline-none [pointer-events:auto]',
    'focus:outline-dashed focus:outline-2 focus:outline-[var(--color-brand)]/60 focus:outline-offset-2',
  ].join(' ');

  const props: HTMLAttributes<HTMLElement> = {
    className: editableClass,
    style,
    contentEditable: true,
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': `Edit ${field}`,
    // Don't follow a link (e.g. a button) while editing its label.
    onClick: (e) => e.preventDefault(),
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
    },
  };

  return createElement(as, props, initial);
}
