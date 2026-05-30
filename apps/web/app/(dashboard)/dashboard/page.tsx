'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteCard } from '@/components/dashboard/site-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CreateSiteModal } from '@/components/dashboard/create-site-modal';
import { useSites } from '@/hooks/use-sites';

export default function DashboardPage() {
  const { data: sites, isLoading, isError } = useSites();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your sites</h1>
          <p className="mt-1 text-sm text-black/60">
            Create, edit, and publish your websites.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          New site
        </Button>
      </header>

      <section className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border border-black/10 bg-black/[0.03]"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load your sites. Please refresh and try again.
          </p>
        ) : sites && sites.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        ) : (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        )}
      </section>

      <CreateSiteModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
