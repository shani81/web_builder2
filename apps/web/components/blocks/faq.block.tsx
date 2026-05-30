import { parseLines, str, type BlockComponentProps } from './types';

export function FaqBlock({ props }: BlockComponentProps) {
  const heading = str(props.heading, 'Frequently asked questions');
  const items = parseLines(
    props.items ||
      'How does the free trial work? | You get full access for 14 days, no card required.\nCan I cancel anytime? | Yes — cancel in one click from your dashboard.\nDo you offer refunds? | We offer a 30-day money-back guarantee.',
  );

  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-semibold">{heading}</h2>
        <div className="mt-10 divide-y divide-black/10 rounded-2xl border border-black/10">
          {items.map(([question, answer], i) => (
            // Native accordion — no JS, works in published HTML.
            <details key={i} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {question}
                <span className="ml-4 text-black/40 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-black/60">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
