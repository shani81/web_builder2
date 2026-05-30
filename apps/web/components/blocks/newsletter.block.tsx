'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { str, type BlockComponentProps } from './types';
import { alignCss, toAlign, type AlignValue } from './responsive-grid';
import { InlineText } from './inline-text';
import { fmtOf } from './text-format';
import { ApiClientError } from '@/lib/api-client';
import { submitForm, subdomainFromBase } from '@/lib/forms';

export function NewsletterBlock({
  props,
  linkBase = '',
  blockId = 'newsletter',
}: BlockComponentProps) {
  const heading = str(props.heading, 'Stay in the loop');
  const subtext = str(
    props.subtext,
    'Get product updates and tips in your inbox.',
  );
  const placeholder = str(props.placeholder, 'you@example.com');
  const buttonLabel = str(props.buttonLabel, 'Subscribe');
  const background = str(props.background, '#0F0F12');
  const textColor = str(props.textColor, '#FFFFFF');
  const align = toAlign(str(props.align, 'center'));
  const alignMobile = toAlign(str(props.alignMobile, 'center'));
  const subdomain = subdomainFromBase(linkBase);

  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle',
  );
  const [error, setError] = useState('');

  const style: CSSProperties = {
    background,
    color: textColor,
    containerType: 'inline-size',
  };

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
      setError(
        err instanceof ApiClientError ? err.message : 'Could not subscribe.',
      );
    }
  };

  // On mobile the input + button stack (input full-width, button aligned per
  // the mobile setting); on desktop (≥768 container) they sit inline.
  const selfOf = (a: AlignValue) =>
    a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
  const rowSel = `[data-nlrow="${blockId}"]`;
  const rowCss = [
    `${rowSel}{display:flex;flex-direction:column;gap:8px;}`,
    `${rowSel} .nl-input{width:100%;}`,
    `${rowSel} .nl-button{align-self:${selfOf(alignMobile)};}`,
    `@container (min-width:768px){`,
    `${rowSel}{flex-direction:row;}`,
    `${rowSel} .nl-input{flex:1 1 auto;width:auto;}`,
    `${rowSel} .nl-button{align-self:auto;}`,
    `}`,
  ].join('');

  return (
    <section style={style} className="px-8 py-20">
      <style
        dangerouslySetInnerHTML={{
          __html: alignCss(blockId, alignMobile, align) + rowCss,
        }}
      />
      <div data-align={blockId} className="flex max-w-xl flex-col gap-4">
        <InlineText
          as="h2"
          blockId={blockId}
          field="heading"
          value={heading}
          formattable
          fmt={fmtOf(props, 'heading')}
          className="text-3xl font-bold"
        />
        <InlineText
          as="p"
          blockId={blockId}
          field="subtext"
          value={subtext}
          multiline
          formattable
          fmt={fmtOf(props, 'subtext')}
          className="opacity-80"
        />
        {status === 'done' ? (
          <p className="mt-2 font-medium opacity-90">
            🎉 You’re subscribed — thanks!
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-2 flex w-full max-w-md flex-col gap-2"
          >
            <div data-nlrow={blockId}>
              <input
                type="email"
                placeholder={placeholder}
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="nl-input rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[var(--color-brand)]"
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
                className="nl-button rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
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
