'use client';

import { useEffect, useState } from 'react';
import { Check, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api-client';
import {
  apiGetAiKey,
  apiGetAiModel,
  apiRemoveAiKey,
  apiSetAiKey,
  apiSetAiModel,
  type AiModelOption,
} from '@/lib/auth';

export function AiKeySection() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState<AiModelOption[]>([]);
  const [model, setModel] = useState('');
  const [modelSaved, setModelSaved] = useState(false);

  useEffect(() => {
    apiGetAiKey()
      .then((r) => setHasKey(r.hasKey))
      .catch(() => setHasKey(false));
    apiGetAiModel()
      .then((r) => {
        setModels(r.models);
        setModel(r.model);
      })
      .catch(() => setModels([]));
  }, []);

  const changeModel = async (next: string) => {
    setModel(next);
    setModelSaved(false);
    try {
      await apiSetAiModel(next);
      setModelSaved(true);
    } catch {
      /* keep the selection; surfaced on next AI call if invalid */
    }
  };

  const save = async () => {
    if (value.trim().length < 10) {
      setError('Paste your API key (starts with sk-ant-).');
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const r = await apiSetAiKey(value.trim());
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
      const r = await apiRemoveAiKey();
      setHasKey(r.hasKey);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-[var(--color-brand)]" aria-hidden />
        <h2 className="text-lg font-semibold">AI (Anthropic API key)</h2>
      </div>
      <p className="mt-1 text-sm text-black/60">
        BUILDR&apos;s AI features (site generation, the editor assistant, SEO,
        and image alt text) use the Anthropic API. Paste your own key to enable
        them. It&apos;s encrypted at rest and never shown again.
      </p>

      {hasKey ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-green-600">
          <Check className="size-4" aria-hidden /> A key is configured — AI is
          enabled.
        </p>
      ) : (
        <p className="mt-3 text-sm text-amber-600">No key set — AI is disabled.</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-api03-…"
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
          Get a key from{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-brand)]"
          >
            console.anthropic.com
          </a>
          . Note: a Claude Pro/Claude&nbsp;Code subscription is separate from API
          access — the API is pay-as-you-go and billed separately.
        </p>
      </div>

      {models.length > 0 ? (
        <div className="mt-6 border-t border-black/10 pt-5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="ai-model" className="text-sm font-medium">
              Model
            </label>
            {modelSaved ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="size-3.5" aria-hidden /> Saved
              </span>
            ) : null}
          </div>
          <select
            id="ai-model"
            value={model}
            onChange={(e) => void changeModel(e.target.value)}
            className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-black/45">
            {models.find((m) => m.id === model)?.description ??
              'Used for site generation and the editor assistant.'}
          </p>
        </div>
      ) : null}
    </section>
  );
}
