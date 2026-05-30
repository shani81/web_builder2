'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import type { PublishedVersionMeta } from '@buildr/types';
import { timeAgo } from '@buildr/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor.store';
import { env } from '@/lib/env';
import { listSiteVersions, publishSite, rollbackSite } from '@/lib/sites';

export function PublishDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const site = useEditorStore((s) => s.site);
  const save = useEditorStore((s) => s.save);

  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<PublishedVersionMeta[]>([]);
  const [error, setError] = useState<string | null>(null);

  const liveUrl = site
    ? `${env.NEXT_PUBLIC_SITE_URL}/s/${site.subdomain}`
    : '';

  useEffect(() => {
    if (!open || !site) return;
    listSiteVersions(site.id)
      .then((v) => {
        setVersions(v);
        setError(null);
      })
      .catch(() => setVersions([]));
  }, [open, site]);

  if (!site) return null;

  const doPublish = async () => {
    setBusy(true);
    setError(null);
    try {
      await save();
      await publishSite(site.id);
      setVersions(await listSiteVersions(site.id));
    } catch {
      setError('Could not publish. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const doRollback = async (version: number) => {
    setBusy(true);
    setError(null);
    try {
      setVersions(await rollbackSite(site.id, version));
    } catch {
      setError('Could not restore that version.');
    } finally {
      setBusy(false);
    }
  };

  const isLive = versions.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish site"
      description="Snapshot your current pages and make them live."
    >
      <div className="flex flex-col gap-4">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {isLive ? (
          <div className="rounded-lg border border-black/10 p-3">
            <p className="text-xs text-black/50">Your site is live at</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium text-[var(--color-brand)]"
              >
                {liveUrl}
              </a>
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open published site"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-black/50 hover:bg-black/5"
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        ) : null}

        <Button onClick={doPublish} disabled={busy}>
          {busy ? 'Publishing…' : isLive ? 'Publish changes' : 'Publish now'}
        </Button>

        {isLive ? (
          <div>
            <h3 className="text-sm font-medium">Version history</h3>
            <ul className="mt-2 space-y-1">
              {versions.map((v, i) => (
                <li
                  key={v.version}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-black/[0.03]"
                >
                  <span>
                    v{v.version}{' '}
                    <span className="text-black/40">
                      · {timeAgo(v.publishedAt)}
                    </span>
                    {i === 0 ? (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        live
                      </span>
                    ) : null}
                  </span>
                  {i !== 0 ? (
                    <button
                      type="button"
                      onClick={() => doRollback(v.version)}
                      disabled={busy}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] disabled:opacity-50"
                    >
                      <RotateCcw className="size-3.5" aria-hidden />
                      Restore
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
