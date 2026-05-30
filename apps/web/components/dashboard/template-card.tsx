'use client';

import type { TemplateSummary } from '@buildr/types';
import { gradientFor } from '@/lib/gradient';

export function TemplateCard({
  template,
  onPreview,
}: {
  template: TemplateSummary;
  onPreview: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPreview(template.id)}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:shadow-sm"
    >
      <div
        className="h-32 transition group-hover:opacity-90"
        style={{ background: gradientFor(template.name) }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{template.name}</h3>
          <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize text-black/50">
            {template.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-black/55">
          {template.description}
        </p>
      </div>
    </button>
  );
}
