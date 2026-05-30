import type { Block } from '@buildr/types';
import { num, parseLines, str } from './types';
import { gridColumnsCss } from './responsive-grid';
import { InlineText } from './inline-text';
import { fmtOf } from './text-format';

/**
 * Features is a container: each card is a real `feature-item` child block, so
 * its title/description are inline-editable and reorderable like any block.
 * Legacy blocks that still hold the old `items` string (e.g. never opened in
 * the editor since the change) render from it as a fallback — read-only, since
 * those cells have no block id.
 */
export function FeaturesBlock({ block }: { block: Block; linkBase?: string }) {
  const props = block.props;
  const blockId = block.id;
  const heading = str(props.heading, 'Everything you need');
  const subtext = str(props.subtext, '');
  const columns = num(props.columns, 3);

  // Prefer structured children; fall back to the legacy items string.
  const cards: { id?: string; title: string; description: string }[] =
    block.children && block.children.length
      ? block.children.map((c) => ({
          id: c.id,
          title: str(c.props.title),
          description: str(c.props.description),
        }))
      : parseLines(str(props.items)).map(([title, description]) => ({
          title: title ?? '',
          description: description ?? '',
        }));

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
          {cards.map((card, i) => (
            <div key={card.id ?? i} className="flex flex-col gap-2">
              <div className="grid size-10 place-items-center rounded-lg bg-[var(--color-brand)]/10 font-semibold text-[var(--color-brand)]">
                {i + 1}
              </div>
              <InlineText
                as="h3"
                blockId={card.id}
                field="title"
                value={card.title}
                className="mt-2 font-semibold"
              />
              <InlineText
                as="p"
                blockId={card.id}
                field="description"
                value={card.description}
                multiline
                className="text-sm text-black/60"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
