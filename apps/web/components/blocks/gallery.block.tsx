import { num, str, type BlockComponentProps } from './types';
import { gridColumnsCss } from './responsive-grid';

export function GalleryBlock({
  props,
  blockId = 'gallery',
}: BlockComponentProps) {
  const heading = str(props.heading, '');
  const columns = num(props.columns, 3);
  const columnsMobile = num(props.columnsMobile, 2);
  const images = str(props.images)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="px-8 py-16" style={{ containerType: 'inline-size' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: gridColumnsCss(blockId, {
            mobile: columnsMobile,
            desktop: columns,
          }),
        }}
      />
      <div className="mx-auto max-w-5xl">
        {heading ? (
          <h2 className="mb-8 text-center text-3xl font-semibold">{heading}</h2>
        ) : null}
        {images.length > 0 ? (
          <div data-grid={blockId} className="grid gap-3">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary gallery URLs
              <img
                key={i}
                src={src}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="grid h-48 place-items-center rounded-xl border border-dashed border-black/15 text-sm text-black/30">
            Add image URLs (one per line) in the inspector
          </div>
        )}
      </div>
    </section>
  );
}
