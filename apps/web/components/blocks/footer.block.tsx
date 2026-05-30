import {
  linkAttrs,
  num,
  parseLinkList,
  str,
  type BlockComponentProps,
} from './types';
import { gridColumnsCss } from './responsive-grid';
import { InlineText } from './inline-text';

export function FooterBlock({
  props,
  blockId = 'footer',
}: BlockComponentProps) {
  const brand = str(props.brand, 'Brand');
  const tagline = str(props.tagline, '');
  const text = str(
    props.text,
    `© ${new Date().getFullYear()} All rights reserved.`,
  );
  const links = parseLinkList(props.links || 'Privacy, Terms, Contact');
  const social = parseLinkList(props.social || 'Twitter, GitHub, LinkedIn');
  const columns = Math.min(6, Math.max(1, num(props.columns, 3)));
  const columnsMobile = Math.min(2, Math.max(1, num(props.columnsMobile, 2)));

  return (
    <footer
      className="border-t border-black/10 bg-black/[0.02] px-8 py-12"
      style={{ containerType: 'inline-size' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: gridColumnsCss(blockId, {
            mobile: columnsMobile,
            desktop: columns,
          }),
        }}
      />
      <div className="mx-auto max-w-4xl">
        <div data-grid={blockId} className="grid gap-8">
          <div>
            <InlineText
              as="span"
              blockId={blockId}
              field="brand"
              value={brand}
              className="text-lg font-semibold"
            />
            {tagline ? (
              <InlineText
                as="p"
                blockId={blockId}
                field="tagline"
                value={tagline}
                className="mt-1 text-sm text-black/50"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-2 text-sm text-black/60">
            {links.map((link, i) => (
              <a key={i} {...linkAttrs(link.href)} className="hover:text-black">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm text-black/60">
            {social.map((link, i) => (
              <a key={i} {...linkAttrs(link.href)} className="hover:text-black">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <InlineText
          as="p"
          blockId={blockId}
          field="text"
          value={text}
          className="mt-8 border-t border-black/10 pt-6 text-sm text-black/40"
        />
      </div>
    </footer>
  );
}
