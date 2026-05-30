import { parseLines, str, type BlockComponentProps } from './types';
import { gridColumnsCss } from './responsive-grid';

export function TestimonialsBlock({
  props,
  blockId = 'testimonials',
}: BlockComponentProps) {
  const heading = str(props.heading, 'Loved by teams everywhere');
  const items = parseLines(
    props.items ||
      'This product changed how we work. | Jane Doe | CEO, Acme\nThe best tool we have adopted in years. | John Smith | CTO, Globex',
  );

  return (
    <section
      className="bg-black/[0.02] px-8 py-20"
      style={{ containerType: 'inline-size' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: gridColumnsCss(blockId, { mobile: 1, desktop: 2 }),
        }}
      />
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold">{heading}</h2>
        <div data-grid={blockId} className="mt-12 grid gap-6">
          {items.map(([quote, author, role], i) => (
            <figure
              key={`${author}-${i}`}
              className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6"
            >
              <blockquote className="text-black/80">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[var(--color-brand)]/10 text-sm font-semibold text-[var(--color-brand)]">
                  {(author ?? '?').charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="block font-medium">{author}</span>
                  {role ? (
                    <span className="block text-black/50">{role}</span>
                  ) : null}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
