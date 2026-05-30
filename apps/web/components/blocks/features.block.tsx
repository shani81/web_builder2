import { num, parseLines, str, type BlockComponentProps } from './types';

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function FeaturesBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, 'Everything you need');
  const subtext = str(props.subtext, '');
  const columns = num(props.columns, 3);
  const items = parseLines(
    props.items ||
      'Fast | Built for speed and reliability.\nSimple | An interface anyone can use.\nFlexible | Adapts to whatever you build.',
  );

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold">{heading}</h2>
          {subtext ? (
            <p className="mt-3 text-black/60">{subtext}</p>
          ) : null}
        </div>
        <div
          className={`mt-12 grid gap-8 ${COLS[columns] ?? COLS[3]}`}
        >
          {items.map(([title, description], i) => (
            <div key={`${title}-${i}`} className="flex flex-col gap-2">
              <div className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand)]/10 font-semibold text-[var(--color-brand)]">
                {i + 1}
              </div>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="text-sm text-black/60">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
