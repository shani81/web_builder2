'use client';

import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import type { Block } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { bool, num, str } from '@/components/blocks/types';
import { BRAND_FONT_OPTIONS } from '@/components/blocks/navbar-fonts';
import { MediaField } from '@/components/media/media-field';
import { CollapsibleGroup } from '@/components/editor/collapsible-group';
import { ColorSwatch } from '@/components/editor/color-swatch';

const inputClass =
  'rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

/** A single Word-style toggle button (B / I / U / S). */
function FormatToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md border transition ${
        active
          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
          : 'border-black/15 text-black/60 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Collapsible "Brand & logo" group for the navbar inspector: logo image,
 * logo size, brand text, font, and a Word-style formatting toolbar
 * (bold / italic / underline / strike + text & highlight color).
 */
export function BrandField({ block }: { block: Block }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const set = (patch: Record<string, unknown>) =>
    updateBlockProps(block.id, patch);

  const logo = str(p.logo);
  const brand = str(p.brand, 'Brand');
  const brandColor = str(p.brandColor);
  const brandBg = str(p.brandBg);
  const hasColors = Boolean(brandColor || brandBg);

  return (
    <CollapsibleGroup
      title="Brand & logo"
      summary={logo ? 'Logo image' : brand}
    >
      <MediaField
        label="Logo image"
        value={logo}
        onPick={(image) => set({ logo: image.url })}
        onClear={() => set({ logo: '' })}
      />
      <p className="-mt-1.5 text-[11px] text-black/40">
        Optional — replaces the brand text. Transparent PNG or SVG works best.
      </p>

      {logo ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="brand-logo-height"
            className="text-xs font-medium text-black/60"
          >
            Logo height (px)
          </label>
          <input
            id="brand-logo-height"
            type="number"
            min={16}
            max={96}
            value={num(p.logoHeight, 32)}
            onChange={(e) => set({ logoHeight: Number(e.target.value) })}
            className={inputClass}
          />
          <p className="text-[11px] text-black/40">
            Recommended 28–48px. Width scales automatically; keep wide logos
            under ~220px. Min 16, max 96.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="brand-name"
          className="text-xs font-medium text-black/60"
        >
          Brand name
        </label>
        <input
          id="brand-name"
          type="text"
          value={brand}
          onChange={(e) => set({ brand: e.target.value })}
          className={inputClass}
        />
        <p className="text-[11px] text-black/40">
          Shown when no logo is set. Also used as the logo’s alt text.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="brand-font"
          className="text-xs font-medium text-black/60"
        >
          Font
        </label>
        <select
          id="brand-font"
          value={str(p.brandFont)}
          onChange={(e) => set({ brandFont: e.target.value })}
          className={inputClass}
        >
          {BRAND_FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Word-style formatting toolbar */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-black/60">Style</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <FormatToggle
            label="Bold"
            active={bool(p.brandBold)}
            onClick={() => set({ brandBold: !bool(p.brandBold) })}
          >
            <Bold className="size-4" aria-hidden />
          </FormatToggle>
          <FormatToggle
            label="Italic"
            active={bool(p.brandItalic)}
            onClick={() => set({ brandItalic: !bool(p.brandItalic) })}
          >
            <Italic className="size-4" aria-hidden />
          </FormatToggle>
          <FormatToggle
            label="Underline"
            active={bool(p.brandUnderline)}
            onClick={() => set({ brandUnderline: !bool(p.brandUnderline) })}
          >
            <Underline className="size-4" aria-hidden />
          </FormatToggle>
          <FormatToggle
            label="Strikethrough"
            active={bool(p.brandStrike)}
            onClick={() => set({ brandStrike: !bool(p.brandStrike) })}
          >
            <Strikethrough className="size-4" aria-hidden />
          </FormatToggle>

          <span className="mx-0.5 h-6 w-px bg-black/10" aria-hidden />

          <ColorSwatch
            label="Text color"
            value={brandColor}
            fallback="#0F0F12"
            onChange={(v) => set({ brandColor: v })}
          />
          <ColorSwatch
            label="Highlight color"
            value={brandBg}
            fallback="#FFE08A"
            onChange={(v) => set({ brandBg: v })}
            bar
          />

          {hasColors ? (
            <button
              type="button"
              onClick={() => set({ brandColor: '', brandBg: '' })}
              className="ml-auto rounded-md px-2 py-1 text-[11px] font-medium text-black/45 transition hover:bg-black/5 hover:text-black/70"
            >
              Reset colors
            </button>
          ) : null}
        </div>
      </div>
    </CollapsibleGroup>
  );
}
