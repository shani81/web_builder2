import {
  linkAttrs,
  num,
  parseLines,
  str,
  type BlockComponentProps,
} from './types';
import { gridColumnsCss } from './responsive-grid';

export function PricingBlock({
  props,
  blockId = 'pricing',
}: BlockComponentProps) {
  const heading = str(props.heading, 'Simple, transparent pricing');
  const subtext = str(props.subtext, '');
  const highlight = num(props.highlightIndex, 1);
  const tiers = parseLines(
    props.items ||
      'Starter | $9 | /mo | 1 project; Email support; 1 GB storage\nPro | $29 | /mo | Unlimited projects; Priority support; 50 GB\nTeam | $99 | /mo | Everything in Pro; SSO; 500 GB',
  );
  // One tier per row on mobile (readable); all tiers across on desktop.
  const desktop = Math.min(6, Math.max(1, tiers.length || 3));

  return (
    <section className="px-8 py-20" style={{ containerType: 'inline-size' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: gridColumnsCss(blockId, { mobile: 1, desktop }),
        }}
      />
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold">{heading}</h2>
          {subtext ? <p className="mt-3 text-black/60">{subtext}</p> : null}
        </div>
        <div data-grid={blockId} className="mt-12 grid gap-6">
          {tiers.map(([name, price, period, features, ctaHref], i) => {
            const feats = (features ?? '')
              .split(';')
              .map((f) => f.trim())
              .filter(Boolean);
            const featured = i === highlight;
            return (
              <div
                key={i}
                className={`flex flex-col rounded-2xl border p-6 ${
                  featured
                    ? 'border-[var(--color-brand)] shadow-md'
                    : 'border-black/10'
                }`}
              >
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-2 text-3xl font-bold">
                  {price}
                  <span className="text-base font-normal text-black/50">
                    {period}
                  </span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-black/70">
                  {feats.map((f, j) => (
                    <li key={j}>✓ {f}</li>
                  ))}
                </ul>
                <a
                  {...linkAttrs(ctaHref ?? '#')}
                  className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-medium ${
                    featured
                      ? 'bg-[var(--color-brand)] text-white'
                      : 'border border-black/15'
                  }`}
                >
                  Choose {name}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
