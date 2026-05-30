import type { CSSProperties } from 'react';
import type { BlockProps } from '@buildr/types';
import { num, str } from './types';

/**
 * Shared, opt-in "appearance" controls applied to any block via a thin wrapper
 * in the block renderer. Props use a `bx*` namespace so they never collide with
 * a block's own settings. When nothing is set (`hasAny` is false) the block
 * renders exactly as before — no wrapper, no DOM or style change — so existing
 * pages are untouched.
 */

const RADIUS: Record<string, string> = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
};

const WIDTH: Record<string, string> = {
  contained: '64rem',
  wide: '80rem',
};

export function blockAppearance(props: BlockProps): {
  style: CSSProperties;
  hasAny: boolean;
} {
  const bg = str(props.bxBg);
  const radius = RADIUS[str(props.bxRadius)] ?? '';
  const maxWidth = WIDTH[str(props.bxWidth)] ?? '';
  const padTop = num(props.bxPadTop, 0);
  const padBottom = num(props.bxPadBottom, 0);

  const hasAny = Boolean(
    bg || radius || maxWidth || padTop > 0 || padBottom > 0,
  );

  const style: CSSProperties = {
    ...(bg && { background: bg }),
    ...(radius && { borderRadius: radius, overflow: 'hidden' }),
    ...(maxWidth && { maxWidth, marginInline: 'auto' }),
    ...(padTop > 0 && { paddingTop: `${padTop}px` }),
    ...(padBottom > 0 && { paddingBottom: `${padBottom}px` }),
  };

  return { style, hasAny };
}
