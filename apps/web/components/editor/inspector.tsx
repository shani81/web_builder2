'use client';

import { Trash2 } from 'lucide-react';
import { slugify } from '@buildr/utils';
import { findBlockInTree, useEditorStore } from '@/stores/editor.store';
import { getBlockDefinition } from '@/components/blocks/registry';
import { bool, num, str, type InspectorField } from '@/components/blocks/types';
import { Button } from '@/components/ui/button';
import { MediaField } from '@/components/media/media-field';
import { MenuEditor } from '@/components/editor/menu-editor';
import { BrandField } from '@/components/editor/brand-field';
import { SectionColumnsField } from '@/components/editor/section-columns-field';
import { SectionLayoutField } from '@/components/editor/section-layout-field';
import { ColumnActions } from '@/components/editor/column-actions-field';

const inputClass =
  'rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

function Field({
  field,
  value,
  onChange,
}: {
  field: InspectorField;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const id = `field-${field.key}`;
  const label = (
    <label htmlFor={id} className="text-xs font-medium text-black/60">
      {field.label}
    </label>
  );
  const hint = field.hint ? (
    <p className="text-[11px] text-black/40">{field.hint}</p>
  ) : null;

  if (field.type === 'toggle') {
    return (
      <label className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-black/60">{field.label}</span>
        <input
          id={id}
          type="checkbox"
          checked={bool(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4"
        />
      </label>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <input
          id={id}
          type="number"
          value={num(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputClass}
        />
        {hint}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <textarea
          id={id}
          rows={4}
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
          className={`resize-y ${inputClass}`}
        />
        {hint}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <select
          id={id}
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint}
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <input
          id={id}
          type="date"
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {hint}
      </div>
    );
  }

  if (field.type === 'color') {
    return (
      <div className="flex flex-col gap-1.5">
        {label}
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={str(value) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded border border-black/15"
          />
          <input
            type="text"
            value={str(value)}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>
        {hint}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label}
      <input
        id={id}
        type="text"
        value={str(value)}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint}
    </div>
  );
}

/** Right panel: context-aware property editor for the selected block. */
export function Inspector() {
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const block = useEditorStore((s) =>
    selectedId && s.activePage
      ? (findBlockInTree(s.activePage.blocks, selectedId) ?? null)
      : null,
  );
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  if (!block) {
    return (
      <aside className="w-72 shrink-0 overflow-y-auto border-l border-black/10 bg-white p-4">
        <p className="px-1 text-sm text-black/40">
          Select a block to edit its settings.
        </p>
      </aside>
    );
  }

  const def = getBlockDefinition(block.type);

  const renderControl = (field: InspectorField) => {
    if (field.type === 'menu')
      return <MenuEditor key={field.key} block={block} />;
    if (field.type === 'navbar-brand')
      return <BrandField key={field.key} block={block} />;
    if (field.type === 'section-layout')
      return <SectionLayoutField key={field.key} block={block} />;
    if (field.type === 'section-columns')
      return <SectionColumnsField key={field.key} block={block} />;
    if (field.type === 'column-actions')
      return <ColumnActions key={field.key} block={block} />;
    if (field.type === 'image')
      return (
        <MediaField
          key={field.key}
          label={field.label}
          value={str(block.props[field.key])}
          onPick={(image) =>
            updateBlockProps(block.id, {
              [field.key]: image.url,
              ...(image.alt ? { alt: image.alt } : {}),
            })
          }
          onClear={() => updateBlockProps(block.id, { [field.key]: '' })}
        />
      );
    return (
      <Field
        key={field.key}
        field={field}
        value={block.props[field.key]}
        onChange={(next) => updateBlockProps(block.id, { [field.key]: next })}
      />
    );
  };

  const fields = def?.fields ?? [];
  const basicFields = fields.filter((f) => !f.advanced);
  const advancedFields = fields.filter((f) => f.advanced);

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <h2 className="text-sm font-semibold">{def?.label ?? block.type}</h2>
        <button
          type="button"
          onClick={() => removeBlock(block.id)}
          aria-label="Delete block"
          className="grid size-8 place-items-center rounded-lg text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {basicFields.map(renderControl)}

        {advancedFields.length > 0 ? (
          <details className="border-t border-black/10 pt-3">
            <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-black/40">
              Advanced
            </summary>
            <div className="mt-3 flex flex-col gap-4">
              {advancedFields.map(renderControl)}
            </div>
          </details>
        ) : null}

        <div className="flex flex-col gap-1.5 border-t border-black/10 pt-4">
          <label
            htmlFor="field-anchorId"
            className="text-xs font-medium text-black/60"
          >
            Anchor ID
          </label>
          <input
            id="field-anchorId"
            type="text"
            value={str(block.props.anchorId)}
            onChange={(e) =>
              updateBlockProps(block.id, { anchorId: slugify(e.target.value) })
            }
            placeholder="e.g. pricing"
            className={inputClass}
          />
          <p className="text-[11px] text-black/40">
            {str(block.props.anchorId)
              ? `Link to this section with #${str(block.props.anchorId)}`
              : 'Give this block an id so nav links can scroll to it (e.g. #pricing).'}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-black/10 p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => removeBlock(block.id)}
        >
          <Trash2 className="size-4" aria-hidden />
          Delete block
        </Button>
      </div>
    </aside>
  );
}
