/**
 * Section (Columns) layout presets and the responsive CSS that powers them.
 *
 * Responsiveness uses CSS **container queries**, not viewport media queries, so
 * a multi-box row auto-stacks based on the *page* width — which makes the
 * editor's device-preview (a fixed-width canvas) accurate AND keeps published
 * pages correct on real phones. Breakpoints (container width):
 *   - < 768px  (mobile):  always 1 column  ← the zero-config auto-stack
 *   - 768–1023 (tablet):  3+ box rows cap at 2 columns; 1–2 box rows unchanged
 *   - ≥ 1024px (desktop): the full layout / custom ratios
 */
export interface SectionLayout {
  /** Stable id stored on the section block's `layout` prop. */
  id: string;
  label: string;
  /** Column width ratios, e.g. [1,1] = 50/50, [1,2] = ⅓ + ⅔. */
  columns: number[];
}

export const SECTION_LAYOUTS: SectionLayout[] = [
  { id: '1', label: '1 column', columns: [1] },
  { id: '2', label: '2 columns', columns: [1, 1] },
  { id: 'split-1-2', label: '⅓ + ⅔', columns: [1, 2] },
  { id: 'split-2-1', label: '⅔ + ⅓', columns: [2, 1] },
  { id: '3', label: '3 columns', columns: [1, 1, 1] },
  { id: '4', label: '4 columns', columns: [1, 1, 1, 1] },
  { id: '5', label: '5 columns', columns: [1, 1, 1, 1, 1] },
  { id: '6', label: '6 columns', columns: [1, 1, 1, 1, 1, 1] },
];

export function layoutById(id: string): SectionLayout | undefined {
  return SECTION_LAYOUTS.find((l) => l.id === id);
}

/** `[1,2]` → `"minmax(0, 1fr) minmax(0, 2fr)"` (minmax(0,…) prevents overflow). */
export function gridTemplate(columns: number[]): string {
  return columns.map((c) => `minmax(0, ${c}fr)`).join(' ');
}

/**
 * Scoped, container-query CSS for one section's grid. Mobile-first: single
 * column by default (the auto-stack), widening at the tablet/desktop
 * breakpoints. Keyed by the section's block id via a `[data-bsec="…"]` selector.
 */
export function sectionGridCss(
  id: string,
  columns: number[],
  gap: number,
): string {
  const sel = `[data-bsec="${id}"]`;
  const desktop = gridTemplate(columns);
  const tablet = columns.length >= 3 ? 'repeat(2, minmax(0, 1fr))' : desktop;
  return [
    `${sel}{display:grid;gap:${gap}px;grid-template-columns:minmax(0,1fr);}`,
    `@container (min-width:768px){${sel}{grid-template-columns:${tablet};}}`,
    `@container (min-width:1024px){${sel}{grid-template-columns:${desktop};}}`,
  ].join('');
}
