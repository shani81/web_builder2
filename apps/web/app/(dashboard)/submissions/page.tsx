'use client';

import { useState } from 'react';
import { Download, Mail, Trash2 } from 'lucide-react';
import type { FormSubmission, FormType } from '@buildr/types';
import { slugify, timeAgo, toCsv } from '@buildr/utils';
import { useSites } from '@/hooks/use-sites';
import { useDeleteSubmission, useSubmissions } from '@/hooks/use-submissions';

const CSV_COLUMNS: Record<FormType, { key: string; label: string }[]> = {
  contact: [
    { key: 'date', label: 'Date' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'message', label: 'Message' },
  ],
  newsletter: [
    { key: 'date', label: 'Date' },
    { key: 'email', label: 'Email' },
  ],
};

function exportCsv(
  items: FormSubmission[],
  formType: FormType,
  siteName: string,
): void {
  const rows = items.map((s) => ({ date: s.createdAt, ...s.data }));
  const csv = toCsv(CSV_COLUMNS[formType], rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(siteName) || 'site'}-${formType}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SubmissionsPage() {
  const { data: sites } = useSites();
  const [selected, setSelected] = useState('');
  const [tab, setTab] = useState<FormType>('contact');
  const siteId = selected || sites?.[0]?.id || null;

  const { data: submissions, isLoading } = useSubmissions(siteId);
  const del = useDeleteSubmission(siteId ?? '');

  const items = (submissions ?? []).filter((s) => s.formType === tab);
  const siteName = sites?.find((s) => s.id === siteId)?.name ?? 'site';

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Form submissions</h1>
          <p className="mt-1 text-sm text-black/60">
            Messages and signups from your published sites.
          </p>
        </div>
        {sites && sites.length > 0 ? (
          <select
            value={siteId ?? ''}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : null}
      </header>

      {!sites || sites.length === 0 ? (
        <p className="mt-10 text-sm text-black/50">
          Publish a site with a contact or newsletter block to collect
          submissions.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {(['contact', 'newsletter'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                    tab === t
                      ? 'bg-[var(--color-sidebar)] text-white'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  {t === 'contact' ? 'Contact messages' : 'Newsletter signups'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => exportCsv(items, tab, siteName)}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-1.5 text-sm font-medium text-black/70 hover:bg-black/5 disabled:opacity-40"
            >
              <Download className="size-4" aria-hidden />
              Export CSV
            </button>
          </div>

          <section className="mt-6 space-y-3">
            {isLoading ? (
              <p className="text-sm text-black/40">Loading…</p>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 px-6 py-16 text-center">
                <Mail className="mx-auto size-6 text-black/30" aria-hidden />
                <p className="mt-3 text-sm text-black/50">
                  No {tab === 'contact' ? 'messages' : 'signups'} yet.
                </p>
              </div>
            ) : tab === 'contact' ? (
              items.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl border border-black/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.data.name}</p>
                      <a
                        href={`mailto:${s.data.email}`}
                        className="text-sm text-[var(--color-brand)]"
                      >
                        {s.data.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-black/40">
                        {timeAgo(s.createdAt)}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete submission"
                        onClick={() => del.mutate(s.id)}
                        className="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-black/70">
                    {s.data.message}
                  </p>
                </article>
              ))
            ) : (
              <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3 last:border-0"
                  >
                    <a
                      href={`mailto:${s.data.email}`}
                      className="text-sm text-[var(--color-brand)]"
                    >
                      {s.data.email}
                    </a>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-black/40">
                        {timeAgo(s.createdAt)}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete signup"
                        onClick={() => del.mutate(s.id)}
                        className="grid size-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
