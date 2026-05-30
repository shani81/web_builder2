/**
 * Curated brand fonts for the Navbar block. Lives in its own (non-"use client")
 * module so it can be imported by both the client navbar component and the
 * server-evaluated block registry — exporting plain data from a "use client"
 * file turns it into a client reference and breaks server-side use.
 *
 * Each value maps to a self-contained CSS stack so the brand renders
 * identically in the editor and on published sites with no extra web-font
 * loading. "Display" reuses the Geist variable already set on the root <html>.
 */
export const BRAND_FONT_OPTIONS = [
  { value: '', label: 'Theme default', stack: '' },
  {
    value: 'sans',
    label: 'Sans-serif',
    stack:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  {
    value: 'serif',
    label: 'Serif',
    stack: 'ui-serif, Georgia, "Times New Roman", serif',
  },
  {
    value: 'mono',
    label: 'Monospace',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  {
    value: 'display',
    label: 'Display (Geist)',
    stack: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
] as const;

export function brandFontStack(value: string): string {
  return BRAND_FONT_OPTIONS.find((f) => f.value === value)?.stack ?? '';
}
