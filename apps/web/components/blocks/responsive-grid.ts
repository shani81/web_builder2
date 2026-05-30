/**
 * A `grid-template-columns` value that auto-reduces columns on narrow widths.
 *
 * Uses CSS intrinsic sizing (`auto-fit` + `minmax`), not viewport media
 * queries — so it responds to the grid's actual rendered width. That makes it
 * correct in the editor's fixed-width device preview AND on real phones, and it
 * needs no client JS or container context.
 *
 * `columns` is the desired desktop count; each cell gets a derived min width
 * (smaller for more columns) and the row wraps once cells no longer fit.
 * `min(100%, …)` guarantees a single column without overflow on very narrow
 * screens. Pass `minPx` to override the derived min for denser/looser content.
 */
export function autoGridColumns(columns: number, minPx?: number): string {
  const derived = Math.round(640 / Math.max(1, columns));
  const min = minPx ?? Math.min(360, Math.max(140, derived));
  return `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`;
}

/**
 * Scoped, container-query CSS giving a grid an *exact* column count per
 * breakpoint — so a user's separate desktop/mobile choices are honored, and
 * it's accurate in the editor preview + on phones. Mobile-first base, then
 * tablet (defaults to a sensible cap), then desktop. Target the grid element
 * with `data-grid={id}` and put `container-type: inline-size` on an ancestor.
 */
export function gridColumnsCss(
  id: string,
  opts: { mobile: number; tablet?: number; desktop: number },
): string {
  const sel = `[data-grid="${id}"]`;
  const tpl = (n: number) => `repeat(${Math.max(1, n)}, minmax(0, 1fr))`;
  const tablet =
    opts.tablet ?? Math.min(opts.desktop, Math.max(opts.mobile, 2));
  return [
    `${sel}{grid-template-columns:${tpl(opts.mobile)};}`,
    `@container (min-width:768px){${sel}{grid-template-columns:${tpl(tablet)};}}`,
    `@container (min-width:1024px){${sel}{grid-template-columns:${tpl(opts.desktop)};}}`,
  ].join('');
}

export type AlignValue = 'left' | 'center' | 'right';

/** Normalize an arbitrary string to a valid alignment (defaults to center). */
export function toAlign(value: string): AlignValue {
  return value === 'left' || value === 'right' ? value : 'center';
}

/** Scoped CSS aligning a flex column (text + items + margins) per breakpoint. */
export function alignCss(
  id: string,
  mobile: AlignValue,
  desktop: AlignValue,
): string {
  const sel = `[data-align="${id}"]`;
  const rule = (a: AlignValue) => {
    const items =
      a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
    return `text-align:${a};align-items:${items};margin-left:${a === 'left' ? '0' : 'auto'};margin-right:${a === 'right' ? '0' : 'auto'};`;
  };
  return [
    `${sel}{${rule(mobile)}}`,
    `@container (min-width:768px){${sel}{${rule(desktop)}}}`,
  ].join('');
}
