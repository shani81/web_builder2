import { linkAttrs, parseLinkList, str, type BlockComponentProps } from './types';

export function FooterBlock({ props }: BlockComponentProps) {
  const brand = str(props.brand, 'Brand');
  const tagline = str(props.tagline, '');
  const text = str(
    props.text,
    `© ${new Date().getFullYear()} All rights reserved.`,
  );
  const links = parseLinkList(props.links || 'Privacy, Terms, Contact');
  const social = parseLinkList(props.social || 'Twitter, GitHub, LinkedIn');

  return (
    <footer className="border-t border-black/10 bg-black/[0.02] px-8 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <span className="text-lg font-semibold">{brand}</span>
            {tagline ? (
              <p className="mt-1 text-sm text-black/50">{tagline}</p>
            ) : null}
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2 text-black/60">
              {links.map((link, i) => (
                <a key={i} {...linkAttrs(link.href)} className="hover:text-black">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-black/60">
              {social.map((link, i) => (
                <a key={i} {...linkAttrs(link.href)} className="hover:text-black">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-black/10 pt-6 text-sm text-black/40">
          {text}
        </p>
      </div>
    </footer>
  );
}
