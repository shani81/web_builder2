'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { SEOAnalysis } from '@buildr/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useEditorStore } from '@/stores/editor.store';
import { analyzeSeo } from '@/lib/ai';
import { ApiClientError } from '@/lib/api-client';
import { env } from '@/lib/env';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-black/50',
};

export function SeoDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const site = useEditorStore((s) => s.site);
  const page = useEditorStore((s) => s.activePage);
  const updatePageMeta = useEditorStore((s) => s.updatePageMeta);
  const save = useEditorStore((s) => s.save);
  const isSaving = useEditorStore((s) => s.isSaving);

  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !site || !page) return null;
  const seo = page.seo;

  const previewTitle = seo.metaTitle || page.title || 'Page title';
  const previewDesc =
    seo.metaDescription ||
    'Add a meta description to control how this page looks in search results.';
  const previewUrl = `${env.NEXT_PUBLIC_SITE_URL}/s/${site.subdomain}${
    page.isHome ? '' : `/${page.slug}`
  }`;

  const runAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      setAnalysis(await analyzeSeo({ siteId: site.id, pageId: page.id }));
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.code === 'AI_DISABLED'
            ? 'Add your Anthropic API key in Settings to use AI SEO.'
            : e.message
          : 'Analysis failed.',
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Page SEO"
      description="Control how this page appears in search and when shared."
    >
      <div className="-mx-1 max-h-[68vh] space-y-4 overflow-y-auto px-1">
        {/* Live search preview */}
        <div className="rounded-xl border border-black/10 p-3">
          <p className="text-xs font-medium text-black/40">Search preview</p>
          <p className="mt-1 truncate text-sm text-emerald-700">{previewUrl}</p>
          <p className="truncate text-base text-blue-700">{previewTitle}</p>
          <p className="line-clamp-2 text-sm text-black/60">{previewDesc}</p>
        </div>

        <TextField
          label="Page title"
          value={page.title}
          onChange={(e) => updatePageMeta({ title: e.target.value })}
        />

        <div>
          <TextField
            label="Search title (meta title)"
            value={seo.metaTitle}
            onChange={(e) => updatePageMeta({ seo: { metaTitle: e.target.value } })}
          />
          <p className="mt-1 text-right text-[11px] text-black/40">
            {seo.metaTitle.length}/60
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor="seo-desc">
            Meta description
          </label>
          <textarea
            id="seo-desc"
            rows={3}
            value={seo.metaDescription}
            onChange={(e) =>
              updatePageMeta({ seo: { metaDescription: e.target.value } })
            }
            className="resize-y rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          />
          <p className="text-right text-[11px] text-black/40">
            {seo.metaDescription.length}/160
          </p>
        </div>

        <TextField
          label="Social image URL (Open Graph)"
          value={seo.ogImage ?? ''}
          placeholder="https://…"
          onChange={(e) =>
            updatePageMeta({ seo: { ogImage: e.target.value || undefined } })
          }
        />

        <TextField
          label="Canonical URL (optional)"
          value={seo.canonicalUrl ?? ''}
          placeholder="https://…"
          onChange={(e) =>
            updatePageMeta({ seo: { canonicalUrl: e.target.value || undefined } })
          }
        />

        <label className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Hide from search engines</span>
          <input
            type="checkbox"
            className="size-4"
            checked={seo.noIndex}
            onChange={(e) => updatePageMeta({ seo: { noIndex: e.target.checked } })}
          />
        </label>

        {/* AI SEO analysis */}
        <div className="rounded-xl border border-black/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="size-4 text-[var(--color-brand)]" aria-hidden />
              AI SEO check
            </span>
            <Button size="sm" variant="outline" onClick={runAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {analysis ? (
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[var(--color-brand)]">
                  {analysis.score}
                </span>
                <span className="text-black/50">/ 100</span>
              </div>
              {analysis.suggestedMetaTitle ? (
                <button
                  type="button"
                  onClick={() =>
                    updatePageMeta({
                      seo: { metaTitle: analysis.suggestedMetaTitle },
                    })
                  }
                  className="block w-full rounded-lg bg-black/5 px-3 py-2 text-left hover:bg-black/10"
                >
                  <span className="text-xs text-black/45">Use suggested title</span>
                  <span className="block">{analysis.suggestedMetaTitle}</span>
                </button>
              ) : null}
              {analysis.suggestedMetaDescription ? (
                <button
                  type="button"
                  onClick={() =>
                    updatePageMeta({
                      seo: {
                        metaDescription: analysis.suggestedMetaDescription,
                      },
                    })
                  }
                  className="block w-full rounded-lg bg-black/5 px-3 py-2 text-left hover:bg-black/10"
                >
                  <span className="text-xs text-black/45">
                    Use suggested description
                  </span>
                  <span className="block">
                    {analysis.suggestedMetaDescription}
                  </span>
                </button>
              ) : null}
              <ul className="space-y-1.5">
                {analysis.issues.map((issue, i) => (
                  <li key={i}>
                    <span
                      className={`text-xs font-semibold uppercase ${SEVERITY_STYLES[issue.severity] ?? ''}`}
                    >
                      {issue.severity}
                    </span>{' '}
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-black/10 pt-4">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => void save()} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
}
