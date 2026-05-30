import { parseLines, str, type BlockComponentProps } from './types';

export function TeamBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, 'Meet the team');
  const members = parseLines(
    props.items ||
      'Alex Rivera | Founder & CEO |\nSam Chen | Head of Product |\nJordan Lee | Lead Engineer |',
  );

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold">{heading}</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map(([name, role, image], i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary avatar URL
                <img
                  src={image}
                  alt={name}
                  className="size-24 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-24 place-items-center rounded-full bg-[var(--color-brand)]/10 text-2xl font-semibold text-[var(--color-brand)]">
                  {(name ?? '?').charAt(0)}
                </span>
              )}
              <h3 className="mt-4 font-semibold">{name}</h3>
              {role ? <p className="text-sm text-black/55">{role}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
