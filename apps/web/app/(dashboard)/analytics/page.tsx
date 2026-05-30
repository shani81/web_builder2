'use client';

import { useState } from 'react';
import { Eye, Users } from 'lucide-react';
import { useSites } from '@/hooks/use-sites';
import { useAnalytics } from '@/hooks/use-analytics';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center gap-2 text-sm text-black/50">
        <Icon className="size-4" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: sites } = useSites();
  const [selected, setSelected] = useState('');
  const siteId = selected || sites?.[0]?.id || null;
  const { data, isLoading } = useAnalytics(siteId);

  const maxDay = Math.max(1, ...(data?.byDay.map((d) => d.views) ?? [0]));
  const maxPage = Math.max(1, ...(data?.topPages.map((p) => p.views) ?? [0]));
  const deviceTotal = (data?.devices ?? []).reduce((s, d) => s + d.views, 0) || 1;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-black/60">
            Views and visitors for your published sites.
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
          Create and publish a site to see analytics.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard icon={Eye} label="Total views" value={data?.totalViews ?? 0} />
            <StatCard
              icon={Users}
              label="Unique visitors"
              value={data?.uniqueVisitors ?? 0}
            />
          </div>

          {/* Views over the last 14 days */}
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm font-medium">Last 14 days</p>
            <div className="mt-4 flex h-32 items-end gap-1">
              {(data?.byDay ?? []).map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.views}`}
                  className="flex-1 rounded-t bg-[var(--color-brand)]/80"
                  style={{ height: `${(d.views / maxDay) * 100}%`, minHeight: 2 }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top pages */}
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <p className="text-sm font-medium">Top pages</p>
              <ul className="mt-3 space-y-2">
                {data && data.topPages.length > 0 ? (
                  data.topPages.map((p) => (
                    <li key={p.path}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-mono text-black/70">
                          {p.path}
                        </span>
                        <span className="text-black/50">{p.views}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-[var(--color-brand)]"
                          style={{ width: `${(p.views / maxPage) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-black/40">
                    {isLoading ? 'Loading…' : 'No views yet.'}
                  </li>
                )}
              </ul>
            </div>

            {/* Devices */}
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <p className="text-sm font-medium">Devices</p>
              <ul className="mt-3 space-y-2">
                {data && data.devices.length > 0 ? (
                  data.devices.map((d) => (
                    <li
                      key={d.device}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize text-black/70">{d.device}</span>
                      <span className="text-black/50">
                        {Math.round((d.views / deviceTotal) * 100)}%
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-black/40">No data yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
