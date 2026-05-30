'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useSite } from '@/hooks/use-sites';

/** Entry point: resolves a site's home page and redirects into the editor. */
export default function EditorEntryPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const { data: site, isError } = useSite(siteId);

  useEffect(() => {
    if (!site) return;
    const home = site.pages.find((p) => p.isHome) ?? site.pages[0];
    if (home) router.replace(`/editor/${siteId}/${home.id}` as Route);
  }, [site, siteId, router]);

  return (
    <div className="grid h-dvh place-items-center text-sm text-black/50">
      {isError ? "Couldn't open the editor." : 'Opening editor…'}
    </div>
  );
}
