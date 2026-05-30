import { num, parseLines, str, type BlockComponentProps } from './types';
import { autoGridColumns } from './responsive-grid';
import { InlineText } from './inline-text';
import { fmtOf } from './text-format';

export function StatsBlock({ props, blockId }: BlockComponentProps) {
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
          <InlineText
            as="h2"
            blockId={blockId}
            field="heading"
            value={heading}
            formattable
            fmt={fmtOf(props, 'heading')}
            className="mb-12 text-center text-3xl font-semibold"
          />
        ) : null}
        <div
          className="grid gap-8 text-center"
          style={{ gridTemplateColumns: autoGridColumns(columns) }}
        >
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
