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
