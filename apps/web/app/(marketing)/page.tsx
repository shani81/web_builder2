import Link from 'next/link';

const features = [
  {
    title: 'Describe it',
    body: 'Tell BUILDR what you want in plain language. Our AI drafts a full site — copy, layout, colors, and SEO.',
  },
  {
    title: 'Customize it',
    body: 'Click any element to edit. A visual editor with drag-and-drop blocks, live preview, and responsive controls.',
  },
  {
    title: 'Publish it',
    body: 'Ship to your own subdomain in seconds, connect a custom domain, and roll back any version instantly.',
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
      <span className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-[var(--color-brand)]">
        AI-powered website builder
      </span>

      <h1 className="mt-8 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
        Describe what you want.
        <br />
        <span className="text-[var(--color-brand)]">BUILDR</span> builds it.
      </h1>

      <p className="mt-6 max-w-2xl text-balance text-lg text-black/60">
        Rival commercial platforms in quality without the complexity. Click to
        customize, let AI do the heavy lifting, and publish in seconds.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-[var(--color-brand)] px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          Start building free
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-black/15 px-6 py-3 font-medium transition hover:bg-black/5"
        >
          Log in
        </Link>
      </div>

      <section className="mt-24 grid w-full gap-6 text-left sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-black/10 p-6"
          >
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-black/60">{feature.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
