'use client';

import { useState } from 'react';
import { str, type BlockComponentProps } from './types';
import { ApiClientError } from '@/lib/api-client';
import { submitForm, subdomainFromBase } from '@/lib/forms';

const inputCls =
  'w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]';

export function ContactBlock({ props, linkBase = '' }: BlockComponentProps) {
  const heading = str(props.heading, 'Get in touch');
  const subtext = str(props.subtext, 'We usually reply within one business day.');
  const buttonLabel = str(props.buttonLabel, 'Send message');
  const subdomain = subdomainFromBase(linkBase);

  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) {
      // Editor / preview context — show the success state without sending.
      setStatus('done');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await submitForm(
        subdomain,
        'contact',
        { name: form.name, email: form.email, message: form.message },
        form.website,
      );
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiClientError ? err.message : 'Could not send your message.');
    }
  };

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">{heading}</h2>
          {subtext ? <p className="mt-3 text-black/60">{subtext}</p> : null}
        </div>

        {status === 'done' ? (
          <p className="mt-10 rounded-xl bg-green-50 px-4 py-6 text-center font-medium text-green-700">
            Thanks! Your message has been sent.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
            <input
              className={inputCls}
              placeholder="Your name"
              aria-label="Your name"
              value={form.name}
              onChange={set('name')}
              required
            />
            <input
              className={inputCls}
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              value={form.email}
              onChange={set('email')}
              required
            />
            <textarea
              className={`${inputCls} resize-y`}
              rows={4}
              placeholder="Your message"
              aria-label="Your message"
              value={form.message}
              onChange={set('message')}
              required
            />
            {/* Honeypot: hidden from humans, tempting to bots. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
              value={form.website}
              onChange={set('website')}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="rounded-lg bg-[var(--color-brand)] px-5 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
