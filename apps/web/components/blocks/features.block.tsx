import { num, parseLines, str, type BlockComponentProps } from './types';
import { gridColumnsCss } from './responsive-grid';
import { InlineText } from './inline-text';
import { fmtOf } from './text-format';

export function FeaturesBlock({
  props,
  blockId = 'features',
}: BlockComponentProps) {
  const heading = str(props.heading, 'Everything you need');
  const subtext = str(props.subtext, '');
  const columns = num(props.columns, 3);
  const items = parseLines(
    props.items ||
      'Fast | Built for speed and reliability.\nSimple | An interface anyone can use.\nFlexible | Adapts to whatever you build.',
  );

  return (
    <section className="px-8 py-20" style={{ containerType: 'inline-size' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: gridColumnsCss(blockId, { mobile: 1, desktop: columns }),
        }}
      />
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <InlineText
            as="h2"
            blockId={blockId}
            field="heading"
            value={heading}
            formattable
            fmt={fmtOf(props, 'heading')}
            className="text-3xl font-semibold"
          />
          {subtext ? (
            <InlineText
              as="p"
              blockId={blockId}
              field="subtext"
              value={subtext}
              multiline
              formattable
              fmt={fmtOf(props, 'subtext')}
              className="mt-3 text-black/60"
            />
          ) : null}
        </div>
        <div data-grid={blockId} className="mt-12 grid gap-8">
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
