'use client';

import { useEffect, useState } from 'react';
import { str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}

/** Live countdown — a client component so it ticks in editor and published. */
export function CountdownBlock({ props, blockId }: BlockComponentProps) {
  const heading = str(props.heading, 'Launching soon');
  const expiredText = str(props.expiredText, "We're live!");
  const target = new Date(str(props.targetDate) || '2026-12-31').getTime();

  const [time, setTime] = useState(() => remaining(target));
  useEffect(() => {
    const id = setInterval(() => setTime(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [number, string][] = [
    [time.days, 'Days'],
    [time.hours, 'Hours'],
    [time.minutes, 'Minutes'],
    [time.seconds, 'Seconds'],
  ];

  return (
    <section className="px-8 py-20 text-center">
      <InlineText
        as="h2"
        blockId={blockId}
        field="heading"
        value={heading}
        className="text-3xl font-semibold"
      />
      {time.done ? (
        <p className="mt-6 text-2xl font-bold text-[var(--color-brand)]">
          {expiredText}
        </p>
      ) : (
        <div className="mt-8 flex justify-center gap-4">
          {units.map(([value, label]) => (
            <div
              key={label}
              className="w-20 rounded-xl border border-black/10 py-4"
            >
              <p className="text-3xl font-bold tabular-nums">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-xs uppercase tracking-wide text-black/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
