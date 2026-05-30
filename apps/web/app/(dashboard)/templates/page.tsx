'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { TemplateCategory, TemplateSummary } from '@buildr/types';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/dashboard/template-card';
import { TemplatePreviewModal } from '@/components/dashboard/template-preview-modal';
import { useRecommendTemplates, useTemplates } from '@/hooks/use-templates';

const CATEGORIES: { label: string; value: TemplateCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Business', value: 'business' },
  { label: 'Portfolio', value: 'portfolio' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Event', value: 'event' },
];

export default function TemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [recommended, setRecommended] = useState<TemplateSummary[] | null>(null);

  const { data: templates, isLoading } = useTemplates(
    category === 'all' ? undefined : category,
  );
  const recommend = useRecommendTemplates();

  const runRecommend = async () => {
    if (prompt.trim().length < 3) return;
    const result = await recommend.mutateAsync(prompt.trim());
    setRecommended(result);
  };

  const list = recommended ?? templates ?? [];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="mt-1 text-sm text-black/60">
          Start from a polished design — preview, then make it yours.
        </p>
      </header>

      {/* AI recommendation */}
      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-black/10 bg-black/[0.02] p-4 sm:flex-row sm:items-center">
        <Sparkles
          className="size-5 shrink-0 text-[var(--color-brand)]"
          aria-hidden
        />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void runRecommend();
          }}
          placeholder="Describe your site and we'll suggest templates…"
          className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
        />
        <Button
          variant="outline"
          onClick={() => void runRecommend()}
          disabled={recommend.isPending}
        >
          {recommend.isPending ? 'Thinking…' : 'Recommend'}
        </Button>
      </div>

      {recommended ? (
        <div className="mt-4 flex items-center gap-3 text-sm text-black/60">
          <span>Showing recommendations for &ldquo;{prompt}&rdquo;.</span>
          <button
            type="button"
            onClick={() => setRecommended(null)}
            className="font-medium text-[var(--color-brand)]"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                category === c.value
                  ? 'bg-[var(--color-sidebar)] text-white'
                  : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <section className="mt-8">
        {isLoading && !recommended ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-black/10 bg-black/[0.03]"
              />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={setPreviewId}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/50">No templates found.</p>
        )}
      </section>

      <TemplatePreviewModal
        templateId={previewId}
        onClose={() => setPreviewId(null)}
      />
    </div>
  );
}
