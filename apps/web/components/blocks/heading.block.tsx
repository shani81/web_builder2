import type { CSSProperties } from 'react';
import { str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

/** Font size per heading level. h1/h2 use clamp() so they scale down on small
 *  screens without any per-device config. */
const SIZE: Record<string, string> = {
  h1: 'clamp(1.875rem, 5vw, 2.75rem)',
  h2: 'clamp(1.5rem, 4vw, 2rem)',
  h3: '1.5rem',
  h4: '1.25rem',
  h5: '1.125rem',
  h6: '1rem',
};
const WEIGHT: Record<string, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

/**
 * A semantic heading. The level (h1–h6) sets both the HTML tag — for SEO and
 * accessibility — and a sensible default size, while weight, alignment, and
 * color are adjustable. Color is left to inherit the theme text color unless
 * explicitly set.
 */
export function HeadingBlock({ props, blockId }: BlockComponentProps) {
  const text = str(props.text, 'Your heading');
  const level = str(props.level, 'h2');
  const tag = /^h[1-6]$/.test(level) ? level : 'h2';
  const align = str(props.align, 'left');
  const weight = str(props.weight, 'bold');
  const color = str(props.color);

  const style: CSSProperties = {
    margin: 0,
    fontSize: SIZE[tag] ?? SIZE.h2,
    fontWeight: WEIGHT[weight] ?? 700,
    lineHeight: 1.2,
    ...(color ? { color } : {}),
  };

  return (
    <div
      className="px-8 py-4"
      style={{ textAlign: align as CSSProperties['textAlign'] }}
    >
      <InlineText
        as={tag}
        blockId={blockId}
        field="text"
        value={text}
        style={style}
      />
    </div>
  );
}
