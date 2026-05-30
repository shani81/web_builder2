'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

/** Visitor password prompt shown for a password-protected published site. */
export function PasswordGate({
  subdomain,
  name,
}: {
  subdomain: string;
  name: string;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/s/${subdomain}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError('Incorrect password. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-neutral-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-black/5">
          <Lock className="size-5 text-black/60" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold">{name}</h1>
        <p className="mt-1 text-sm text-black/50">
          This site is password protected.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="mt-5 w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
