'use client';

import { Plus, X } from 'lucide-react';
import type { Block, BlockProps } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { str } from '@/components/blocks/types';
import { CollapsibleGroup } from '@/components/editor/collapsible-group';
import { ColorSwatch } from '@/components/editor/color-swatch';

const inputClass =
  'w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

const STYLE_OPTIONS = [
  { value: 'filled', label: 'Filled' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

/** Filled / Outline / Ghost segmented control. */
function StyleSegmented({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Button style"
      className="grid grid-cols-3 gap-1 rounded-lg bg-black/5 p-1"
    >
      {STYLE_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2 py-1.5 text-xs transition ${
            value === o.value
              ? 'bg-white font-medium shadow-sm'
              : 'text-black/55 hover:text-black'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

type ButtonKeys = {
  label: string;
  href: string;
  style: string;
  bg: string;
  color: string;
};

/** Editor for one button: label, link, style, and colors. */
function ButtonSettings({
  p,
  set,
  keys,
  title,
  onRemove,
}: {
  p: BlockProps;
  set: (patch: Record<string, unknown>) => void;
  keys: ButtonKeys;
  title: string;
  onRemove?: () => void;
}) {
  const bg = str(p[keys.bg]);
  const color = str(p[keys.color]);
  const hasColors = Boolean(bg || color);

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-black/10 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/65">{title}</span>
        {onRemove ? (
          <button
            type="button"
            aria-label="Remove button"
            onClick={onRemove}
            className="grid size-6 place-items-center rounded-md text-black/40 transition hover:bg-red-50 hover:text-red-500"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <input
        aria-label={`${title} label`}
        value={str(p[keys.label])}
        onChange={(e) => set({ [keys.label]: e.target.value })}
        placeholder="Button label"
        className={inputClass}
      />

      <div className="flex flex-col gap-1">
        <input
          aria-label={`${title} link`}
          value={str(p[keys.href])}
          onChange={(e) => set({ [keys.href]: e.target.value })}
          placeholder="URL or #anchor"
          className={inputClass}
        />
        <span className="text-[11px] text-black/40">URL or #anchor</span>
      </div>

      <StyleSegmented
        value={str(p[keys.style], 'filled')}
        onChange={(v) => set({ [keys.style]: v })}
      />

      <div className="flex items-center gap-2">
        <ColorSwatch
          label="Button color"
          value={bg}
          fallback="#4F6EF7"
          preview="var(--color-brand)"
          onChange={(v) => set({ [keys.bg]: v })}
          bar
        />
        <span className="text-[11px] text-black/50">Button</span>
        <ColorSwatch
          label="Text color"
          value={color}
          fallback="#FFFFFF"
          onChange={(v) => set({ [keys.color]: v })}
          bar
        />
        <span className="text-[11px] text-black/50">Text</span>
        {hasColors ? (
          <button
            type="button"
            onClick={() => set({ [keys.bg]: '', [keys.color]: '' })}
            className="ml-auto rounded-md px-2 py-1 text-[11px] font-medium text-black/45 transition hover:bg-black/5 hover:text-black/70"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

const PRIMARY: ButtonKeys = {
  label: 'ctaLabel',
  href: 'ctaHref',
  style: 'ctaStyle',
  bg: 'ctaBg',
  color: 'ctaColor',
};
const SECONDARY: ButtonKeys = {
  label: 'secondaryCtaLabel',
  href: 'secondaryCtaHref',
  style: 'secondaryCtaStyle',
  bg: 'secondaryCtaBg',
  color: 'secondaryCtaColor',
};

/** Collapsible "Buttons" group: a primary button plus an optional second one. */
export function ButtonsField({ block }: { block: Block }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const p = block.props;
  const set = (patch: Record<string, unknown>) =>
    updateBlockProps(block.id, patch);

  const hasSecondary = p.secondaryCtaEnabled === true;
  const primaryLabel = str(p.ctaLabel, 'Get started');
  const summary = hasSecondary ? `${primaryLabel} +1` : primaryLabel;

  return (
    <CollapsibleGroup title="Buttons" summary={summary}>
      <ButtonSettings p={p} set={set} keys={PRIMARY} title="Button 1" />

      {hasSecondary ? (
        <ButtonSettings
          p={p}
          set={set}
          keys={SECONDARY}
          title="Button 2"
          onRemove={() => set({ secondaryCtaEnabled: false })}
        />
      ) : (
        <button
          type="button"
          onClick={() => set({ secondaryCtaEnabled: true })}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/15 py-2 text-xs font-medium text-black/55 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
        >
          <Plus className="size-4" aria-hidden />
          Add button
        </button>
      )}
    </CollapsibleGroup>
  );
}
