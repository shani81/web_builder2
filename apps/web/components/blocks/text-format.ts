import type { CSSProperties } from 'react';
import type { BlockProps } from '@buildr/types';

/**
 * Per-field text formatting applied to inline-editable section text (headings,
 * subtexts, labels). Stored on the block under `fmt_<field>` so it never
 * collides with the field's own value, and applied as an inline style by
 * InlineText — so it renders identically in the editor and on the published
 * site (no stored HTML, just a style object).
 */
export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function fmtKey(field: string): string {
  return `fmt_${field}`;
}

export function fmtOf(
  props: BlockProps,
  field: string,
): TextFormat | undefined {
  const v = props[fmtKey(field)];
  return v && typeof v === 'object' ? (v as TextFormat) : undefined;
}

export function formatStyle(fmt?: TextFormat): CSSProperties {
  if (!fmt) return {};
  return {
    ...(fmt.bold && { fontWeight: 700 }),
    ...(fmt.italic && { fontStyle: 'italic' }),
    ...(fmt.underline && { textDecoration: 'underline' }),
    ...(fmt.color && { color: fmt.color }),
    ...(fmt.align && { textAlign: fmt.align }),
  };
}
