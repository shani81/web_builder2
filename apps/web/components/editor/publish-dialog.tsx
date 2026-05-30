'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, ExternalLink, Lock, RotateCcw } from 'lucide-react';
import type { PublishedVersionMeta } from '@buildr/types';
import { timeAgo } from '@buildr/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/stores/editor.store';
import { env } from '@/lib/env';
import {
  getPublishStatus,
  publishSite,
  rollbackSite,
  setPublishPassword,
} from '@/lib/sites';

/** A `datetime-local` value (local time) → ISO string, or undefined if empty. */
function toIso(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const t = new Date(localValue);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
}

/** Now + 1 hour as a `datetime-local` value, used as a sensible default/min. */
function defaultScheduleValue(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  // Trim to "YYYY-MM-DDTHH:mm" in local time.
  const tzOffset = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

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
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(defaultScheduleValue);
  const [isProtected, setIsProtected] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const liveUrl = site ? `${env.NEXT_PUBLIC_SITE_URL}/s/${site.subdomain}` : '';

  const refresh = async (siteId: string) => {
    const status = await getPublishStatus(siteId);
    setVersions(status.versions);
    setScheduledAt(status.scheduledAt);
    setIsProtected(status.protected);
  };

  useEffect(() => {
    if (!open || !site) return;
    getPublishStatus(site.id)
      .then((status) => {
        setVersions(status.versions);
        setScheduledAt(status.scheduledAt);
        setIsProtected(status.protected);
        setError(null);
      })
      .catch(() => {
        setVersions([]);
        setScheduledAt(null);
        setIsProtected(false);
      });
  }, [open, site]);

  if (!site) return null;

  const doPublish = async () => {
    setBusy(true);
    setError(null);
    try {
      await save();
      await publishSite(
        site.id,
        scheduleMode ? toIso(scheduleValue) : undefined,
      );
      await refresh(site.id);
      setScheduleMode(false);
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
      setScheduledAt(null);
    } catch {
      setError('Could not restore that version.');
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    if (pwValue.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await setPublishPassword(site.id, pwValue);
      setIsProtected(r.protected);
      setPwValue('');
    } catch {
      setError('Could not set the password.');
    } finally {
      setBusy(false);
    }
  };

  const removePassword = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await setPublishPassword(site.id, null);
      setIsProtected(r.protected);
    } catch {
      setError('Could not remove the password.');
    } finally {
      setBusy(false);
    }
  };

  const isLive = versions.length > 0;
  const publishLabel = scheduleMode
    ? 'Schedule'
    : isLive
      ? 'Publish changes'
      : 'Publish now';

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

        {scheduledAt ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Scheduled to go live{' '}
              <strong>{new Date(scheduledAt).toLocaleString()}</strong>. It
              stays hidden until then. Publishing now goes live immediately.
            </span>
          </div>
        ) : isLive ? (
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

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.checked)}
              className="size-4"
            />
            Schedule for later
          </label>
          {scheduleMode ? (
            <input
              type="datetime-local"
              value={scheduleValue}
              min={defaultScheduleValue()}
              onChange={(e) => setScheduleValue(e.target.value)}
              className="rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
            />
          ) : null}
        </div>

        <Button onClick={doPublish} disabled={busy}>
          {busy ? 'Working…' : publishLabel}
        </Button>

        {isLive ? (
          <div className="border-t border-black/10 pt-4">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-black/50" aria-hidden />
              <h3 className="text-sm font-medium">Visitor password</h3>
            </div>
            {isProtected ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm text-green-600">
                  Password protected.
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={removePassword}
                  disabled={busy}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={pwValue}
                  onChange={(e) => setPwValue(e.target.value)}
                  placeholder="Set a password"
                  className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                />
                <Button size="sm" onClick={savePassword} disabled={busy}>
                  Set
                </Button>
              </div>
            )}
            <p className="mt-1 text-[11px] text-black/40">
              Visitors must enter this password to view the site.
            </p>
          </div>
        ) : null}

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
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          scheduledAt
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {scheduledAt ? 'scheduled' : 'live'}
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
