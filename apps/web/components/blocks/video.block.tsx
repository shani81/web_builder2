import { Play } from 'lucide-react';
import { str, type BlockComponentProps } from './types';
import { InlineText } from './inline-text';

/** Convert a YouTube/Vimeo watch URL to an embeddable URL. */
function toEmbed(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function VideoBlock({ props, blockId }: BlockComponentProps) {
  const url = str(props.url, '');
  const caption = str(props.caption, '');
  const embed = toEmbed(url);

  return (
    <section className="px-8 py-16">
      <figure className="mx-auto max-w-3xl">
        <div className="aspect-video overflow-hidden rounded-xl bg-black/5">
          {embed ? (
            <iframe
              src={embed}
              title={caption || 'Embedded video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          ) : (
            <div className="grid size-full place-items-center text-black/30">
              <div className="flex flex-col items-center gap-2 text-sm">
                <Play className="size-8" aria-hidden />
                Paste a YouTube or Vimeo URL in the inspector
              </div>
            </div>
          )}
        </div>
        {caption ? (
          <InlineText
            as="figcaption"
            blockId={blockId}
            field="caption"
            value={caption}
            className="mt-3 text-center text-sm text-black/50"
          />
        ) : null}
      </figure>
    </section>
  );
}
