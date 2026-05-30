'use client';

import { useEffect, useState } from 'react';
import { Check, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api-client';
import {
  apiGetStockKey,
  apiRemoveStockKey,
  apiSetStockKey,
} from '@/lib/auth';

export function StockKeySection() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGetStockKey()
      .then((r) => setHasKey(r.hasKey))
      .catch(() => setHasKey(false));
  }, []);

  const save = async () => {
    if (value.trim().length < 20) {
      setError('Paste your Pixabay API key.');
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const r = await apiSetStockKey(value.trim());
      setHasKey(r.hasKey);
      setValue('');
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : 'Could not save the key.',
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const r = await apiRemoveStockKey();
      setHasKey(r.hasKey);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-5 text-[var(--color-brand)]" aria-hidden />
        <h2 className="text-lg font-semibold">Stock photos (Pixabay)</h2>
      </div>
      <p className="mt-1 text-sm text-black/60">
        Search and insert free stock photos from Pixabay — in the editor and via
        the AI assistant. Paste your Pixabay API key to enable it. It&apos;s
        encrypted at rest and never shown again.
      </p>

      {hasKey ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-green-600">
          <Check className="size-4" aria-hidden /> A key is configured — stock
          photos are enabled.
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-600">
          No key set — stock photos are disabled.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 12345678-abcdef…"
          autoComplete="off"
          className="rounded-lg border border-black/15 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-brand)]"
        />
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {saved ? <p className="text-sm text-green-600">Key saved.</p> : null}

        <div className="flex gap-2">
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : hasKey ? 'Replace key' : 'Save key'}
          </Button>
          {hasKey ? (
            <Button variant="ghost" onClick={remove} disabled={busy}>
              Remove
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-black/45">
          Get a free key from{' '}
          <a
            href="https://pixabay.com/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-brand)]"
          >
            pixabay.com/api/docs
          </a>
          . You are responsible for checking the{' '}
          <a
            href="https://pixabay.com/service/license-summary/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-brand)]"
          >
            Pixabay License
          </a>{' '}
          for your use — especially printing, merchandise, or other commercial
          use, and for images with people, logos, or brands. BUILDR is not
          responsible for how stock images are used.
        </p>
      </div>
    </section>
  );
}
