'use client';

/**
 * A compact color-picker button (Word-style): shows the effective color and
 * opens the native picker. `preview` lets the visible chip reflect a CSS color
 * (e.g. a theme `var(--color-brand)`) when no explicit value is set, so the
 * swatch always matches what's actually rendered. `fallback` is the concrete
 * hex handed to the native input (which can't accept a CSS variable).
 */
export function ColorSwatch({
  label,
  value,
  fallback,
  preview,
  onChange,
  bar,
}: {
  label: string;
  value: string;
  fallback: string;
  preview?: string;
  onChange: (next: string) => void;
  /** Render as a filled chip (highlight / background) instead of an "A". */
  bar?: boolean;
}) {
  const shown = value || preview || fallback;
  return (
    <label
      title={label}
      className="relative grid size-8 cursor-pointer place-items-center rounded-md border border-black/15 text-black/70 transition hover:bg-black/5"
    >
      {bar ? (
        <span
          className="size-4 rounded-sm border border-black/10"
          style={{ background: shown }}
          aria-hidden
        />
      ) : (
        <span className="flex flex-col items-center leading-none" aria-hidden>
          <span className="text-[13px] font-semibold">A</span>
          <span
            className="mt-0.5 h-[3px] w-4 rounded-full"
            style={{ background: shown }}
          />
        </span>
      )}
      <input
        type="color"
        aria-label={label}
        value={value || fallback}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}
