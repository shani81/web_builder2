'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { str, type BlockComponentProps } from './types';
import { ApiClientError } from '@/lib/api-client';
import { submitForm, subdomainFromBase } from '@/lib/forms';

export function NewsletterBlock({ props, linkBase = '' }: BlockComponentProps) {
  const heading = str(props.heading, 'Stay in the loop');
  const subtext = str(props.subtext, 'Get product updates and tips in your inbox.');
  const placeholder = str(props.placeholder, 'you@example.com');
  const buttonLabel = str(props.buttonLabel, 'Subscribe');
  const background = str(props.background, '#0F0F12');
  const textColor = str(props.textColor, '#FFFFFF');
  const subdomain = subdomainFromBase(linkBase);

  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const style: CSSProperties = { background, color: textColor };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) {
      setStatus('done');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await submitForm(subdomain, 'newsletter', { email }, website);
      setStatus('done');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiClientError ? err.message : 'Could not subscribe.');
    }
  };

  return (
    <section style={style} className="px-8 py-20 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">{heading}</h2>
        <p className="opacity-80">{subtext}</p>
        {status === 'done' ? (
          <p className="mt-2 font-medium opacity-90">
            🎉 You’re subscribed — thanks!
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-2 flex w-full max-w-md flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={placeholder}
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-black outline-none"
              />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {status === 'sending' ? '…' : buttonLabel}
              </button>
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </form>
        )}
      </div>
    </section>
  );
}
