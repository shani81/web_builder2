import { num, parseLines, str, type BlockComponentProps } from './types';

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function StatsBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, '');
  const columns = num(props.columns, 4);
  const items = parseLines(
    props.items ||
      '10k+ | Active users\n99.9% | Uptime\n4.9/5 | Average rating\n24/7 | Support',
  );

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-5xl">
        {heading ? (
          <h2 className="mb-12 text-center text-3xl font-semibold">{heading}</h2>
        ) : null}
        <div className={`grid gap-8 text-center ${COLS[columns] ?? COLS[4]}`}>
          {items.map(([value, label], i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-[var(--color-brand)]">
                {value}
              </p>
              <p className="mt-1 text-sm text-black/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
