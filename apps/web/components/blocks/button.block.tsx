import type { CSSProperties } from 'react';
import { bool, linkAttrs, str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

const RADIUS: Record<string, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};
const PADDING: Record<string, string> = {
  sm: '0.375rem 0.875rem',
  md: '0.625rem 1.25rem',
  lg: '0.875rem 1.75rem',
};
const FONT_SIZE: Record<string, string> = {
  sm: '0.8125rem',
  md: '0.9375rem',
  lg: '1.0625rem',
};
const SHADOW: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.14)',
  lg: '0 10px 24px rgba(0,0,0,0.20)',
};

/**
 * A standalone button. Variant (filled / outline / ghost), size, radius,
 * colors, and shadow are all configurable. For outline/ghost the button color
 * doubles as the text/border accent unless an explicit (non-white) text color
 * is set. Alignment is handled by a wrapper so it works in any container.
 */
export function ButtonBlock({ props, blockId }: BlockComponentProps) {
  const label = str(props.label, 'Button');
  const href = str(props.href, '#');
  const variant = str(props.variant, 'filled');
  const size = str(props.size, 'md');
  const align = str(props.align, 'left');
  const fullWidth = bool(props.fullWidth);
  const bg = str(props.bg, '#4F6EF7');
  const color = str(props.color, '#FFFFFF');
  const radius = str(props.radius, 'md');
  const shadow = str(props.shadow, 'none');

  // For outline/ghost, fall back to the button color for text unless the user
  // picked a non-default text color (white would vanish on a light page).
  const customText = color && color.toLowerCase() !== '#ffffff';
  const accentText = customText ? color : bg;

  const base: CSSProperties = {
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : undefined,
    padding: PADDING[size] ?? PADDING.md,
    fontSize: FONT_SIZE[size] ?? FONT_SIZE.md,
    fontWeight: 500,
    lineHeight: 1.2,
    textAlign: 'center',
    borderRadius: RADIUS[radius] ?? RADIUS.md,
    boxShadow: SHADOW[shadow] ?? 'none',
    transition: 'opacity 150ms ease',
  };

  let variantStyle: CSSProperties;
  if (variant === 'outline') {
    variantStyle = {
      background: 'transparent',
      color: accentText,
      border: `1px solid ${bg}`,
    };
  } else if (variant === 'ghost') {
    variantStyle = { background: 'transparent', color: accentText };
  } else {
    variantStyle = { background: bg, color: color || '#FFFFFF' };
  }

  const newTab = bool(props.newTab);
  const attrs = newTab
    ? { href: href || '#', target: '_blank', rel: 'noreferrer noopener' }
    : linkAttrs(href);

  return (
    <div style={{ textAlign: align as CSSProperties['textAlign'] }}>
      <a {...attrs} style={{ ...base, ...variantStyle }}>
        <InlineText as="span" blockId={blockId} field="label" value={label} />
      </a>
    </div>
  );
}
