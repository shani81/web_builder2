import { str, type BlockComponentProps } from './types';

const isUrl = (s: string) => /^https?:\/\//.test(s);

export function LogosBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, 'Trusted by leading teams');
  const items = str(props.items, 'Acme, Globex, Initech, Umbrella, Hooli, Vehement')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="border-y border-black/5 bg-black/[0.02] px-8 py-14">
      <div className="mx-auto max-w-5xl text-center">
        {heading ? (
          <p className="text-sm font-medium uppercase tracking-wide text-black/40">
            {heading}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {items.map((item, i) =>
            isUrl(item) ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary logo URL
              <img
                key={i}
                src={item}
                alt="Logo"
                className="h-8 w-auto opacity-60 grayscale"
              />
            ) : (
              <span key={i} className="text-xl font-semibold text-black/40">
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
