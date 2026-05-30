/**
 * Phase 3 — Generate pages with the BUILDER'S OWN AI assistant.
 *
 * The orchestrator authors nothing: each page is produced by calling the
 * project's /ai/generate-site endpoint. Output is validated against
 * builder-capabilities.json; on violations we send them BACK to the assistant
 * (max 3 retries) — we never hand-patch the result. Validated pages are saved
 * to /generated/<page>.json and a report is written.
 *
 * Run: tsx --tsconfig apps/web/tsconfig.json apps/web/scripts/generate-pages.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageErrors, validatePage, type Violation } from './validate-page';

const API = 'http://127.0.0.1:4001/api/v1';
const ROOT = resolve(import.meta.dirname, '../../..');
const OUT = resolve(ROOT, 'generated');
const MAX_RETRIES = 3;

const PAGES: { name: string; brief: string }[] = [
  {
    name: 'landing',
    brief:
      'A landing page for FlowSpace, a project-management SaaS: hero, value proposition, feature highlights, social proof, and a primary call-to-action.',
  },
  {
    name: 'contact',
    brief:
      'A Contact Us page: a short intro, a contact form (name, email, message), contact details, and opening hours.',
  },
  {
    name: 'gallery',
    brief:
      'A photo gallery page for a design studio: a heading and a grouped image grid with captions.',
  },
  {
    name: 'news',
    brief:
      'A news page: a heading and a grid of article cards, each with a title, date, short excerpt, and a link.',
  },
];

interface Chunk {
  type: string;
  page?: { title: string; blocks: unknown[] };
}

async function registerCookie(): Promise<string> {
  const sub = 'gen' + Date.now().toString().slice(-6);
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Gen',
      email: `${sub}@b.app`,
      password: 'supersecret123',
    }),
  });
  const setCookie = res.headers.getSetCookie();
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

/** Call the assistant; return the first generated page (it builds one page). */
async function generate(
  cookie: string,
  prompt: string,
): Promise<{ title: string; blocks: unknown[] } | null> {
  const res = await fetch(`${API}/ai/generate-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    throw new Error(
      `generate-site ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  const text = await res.text();
  const chunks: Chunk[] = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t.startsWith('data:')) continue;
    try {
      chunks.push(JSON.parse(t.slice(5).trim()) as Chunk);
    } catch {
      /* ignore keep-alives / partial lines */
    }
  }
  const page = chunks.find((c) => c.type === 'page')?.page;
  return page ?? null;
}

function violationText(v: Violation[]): string {
  return v.map((x) => `- [${x.code}] ${x.path}: ${x.message}`).join('\n');
}

interface Result {
  name: string;
  producedByAssistant: boolean;
  retries: number;
  errors: Violation[];
  warnings: Violation[];
  pass: boolean;
  blockTypes: string[];
}

const REVALIDATE = process.argv.includes('--revalidate');

async function run(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const cookie = REVALIDATE ? '' : await registerCookie();
  const results: Result[] = [];

  for (const { name, brief } of PAGES) {
    let prompt = brief;
    let retries = 0;
    let page: { title: string; blocks: unknown[] } | null = null;
    let violations: Violation[] = [];

    if (REVALIDATE) {
      // Re-check the assistant's already-generated output (no new model calls).
      page = JSON.parse(readFileSync(resolve(OUT, `${name}.json`), 'utf8')) as {
        title: string;
        blocks: unknown[];
      };
      violations = validatePage({ blocks: page.blocks });
    } else {
      for (;;) {
        console.log(
          `[${name}] generating${retries ? ` (retry ${retries})` : ''}…`,
        );
        page = await generate(cookie, prompt);
        if (!page) {
          violations = [
            {
              path: 'page',
              code: 'malformed',
              severity: 'error',
              message: 'assistant returned no page',
            },
          ];
          break;
        }
        violations = validatePage({ blocks: page.blocks });
        // Retry only on real errors — warnings (harmless extra props) are fine.
        if (pageErrors(violations).length === 0 || retries >= MAX_RETRIES)
          break;
        retries++;
        // Send the errors BACK to the assistant — do not patch by hand.
        prompt = `${brief}\n\nYour previous attempt produced an invalid page. Fix EXACTLY these problems and regenerate, using only allowed block types and prop values:\n${violationText(pageErrors(violations))}`;
      }
    }

    const errors = pageErrors(violations);
    const warnings = violations.filter((v) => v.severity === 'warning');
    const blockTypes = page
      ? (page.blocks as { type?: string }[]).map((b) => b.type ?? '?')
      : [];
    const pass = Boolean(page) && errors.length === 0;
    if (page && !REVALIDATE) {
      writeFileSync(
        resolve(OUT, `${name}.json`),
        JSON.stringify(page, null, 2) + '\n',
      );
    }
    results.push({
      name,
      producedByAssistant: true,
      retries,
      errors,
      warnings,
      pass,
      blockTypes,
    });
    console.log(
      `[${name}] ${pass ? 'PASS' : 'FAIL'} — retries ${retries}, ${errors.length} error(s), ${warnings.length} warning(s)`,
    );
  }

  // ---- Report ----
  const lines: string[] = [
    '# Phase 3 — Generation Report',
    '',
    '> All four pages were generated by the project’s AI assistant (`/ai/generate-site`); the orchestrator authored none of the page content.',
    '',
    '| Page | By assistant | Retries | Result | Errors | Warnings | Blocks |',
    '|------|------|---------|--------|--------|----------|--------|',
  ];
  for (const r of results) {
    lines.push(
      `| ${r.name} | ✅ | ${r.retries} | ${r.pass ? '✅ valid' : '❌ invalid'} | ${r.errors.length} | ${r.warnings.length} | ${r.blockTypes.length} |`,
    );
  }
  lines.push('');
  for (const r of results) {
    if (!r.errors.length && !r.warnings.length) continue;
    lines.push(`### ${r.name}`, '');
    lines.push(`Blocks: ${[...new Set(r.blockTypes)].join(', ')}`, '');
    if (r.errors.length) lines.push('**Errors:**', violationText(r.errors), '');
    if (r.warnings.length)
      lines.push('**Warnings (advisory):**', violationText(r.warnings), '');
  }
  writeFileSync(resolve(OUT, 'REPORT.md'), lines.join('\n') + '\n');

  const passed = results.filter((r) => r.pass).length;
  console.log(
    `\nDone: ${passed}/${results.length} pages valid. Report → generated/REPORT.md`,
  );
}

run().catch((err) => {
  console.error('Phase 3 failed:', err);
  process.exit(1);
});
