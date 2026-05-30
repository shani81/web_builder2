import { ImageIcon } from 'lucide-react';
import { bool, linkAttrs, str, type BlockComponentProps } from './types';

export function ImageBlock({ props }: BlockComponentProps) {
  const src = str(props.src, '');
  const alt = str(props.alt, '');
  const caption = str(props.caption, '');
  const link = str(props.link, '');
  const width = str(props.width, 'contained') as 'full' | 'contained';
  const rounded = bool(props.rounded, true);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary user URLs; Next/Image needs config per host
    <img
      src={src}
      alt={alt}
      className={`w-full object-cover ${rounded ? 'rounded-xl' : ''}`}
    />
  );

  return (
    <figure className="px-8 py-10">
      <div className={width === 'contained' ? 'mx-auto max-w-3xl' : ''}>
        {src ? (
          link ? (
            <a {...linkAttrs(link)} className="block">
              {img}
            </a>
          ) : (
            img
          )
        ) : (
          <div
            className={`grid aspect-video w-full place-items-center bg-black/5 text-black/30 ${
              rounded ? 'rounded-xl' : ''
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-sm">
              <ImageIcon className="size-8" aria-hidden />
              Add an image URL in the inspector
            </div>
          </div>
        )}
        {caption ? (
          <figcaption className="mt-3 text-center text-sm text-black/50">
            {caption}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
