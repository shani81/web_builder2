# BUILDR — Project Memory

> Living log of architectural decisions, bug fixes, and hard-won knowledge.
> Read this before starting any phase. Never re-solve a solved problem.

## Architecture Decisions

| Date       | Decision                              | Reason                                                              | Alternatives Considered                          |
| ---------- | ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| 2026-05-30 | Fastify 5 over Express                | ~2x throughput, schema validation, first-class plugins              | Hono (smaller ecosystem), Express (slower)       |
| 2026-05-30 | Zustand over Redux                    | Minimal boilerplate, great TS inference, simple history middleware  | Redux Toolkit (overkill), Jotai (too atomic)     |
| 2026-05-30 | JSON files over SQLite                | Simplest store, mirrors the DB repository pattern, easy to inspect  | SQLite (harder to diff), lowdb (unmaintained)    |
| 2026-05-30 | Next.js 16.2 (App Router)             | Latest stable; typed routes, RSC, modern caching                    | Remix (smaller community), Vite SPA (no SSR/SEO) |
| 2026-05-30 | pnpm workspaces monorepo              | Fast, strict, native workspace protocol for shared packages         | npm workspaces (slower), Turborepo (added layer) |
| 2026-05-30 | Shared packages ship TS source        | No build step in dev; Next `transpilePackages`, API runs via tsx    | Pre-built dist (slower DX, stale builds)         |
| 2026-05-30 | Default AI model = Claude Sonnet 4.6 (was Opus 4.8) | Best quality/cost balance for BYO-key users; per-user override in Settings (Sonnet 4.6 / Opus 4.8 / Haiku 4.5) | Opus default (pricier for everyone) |
| 2026-05-30 | Central `AI_MODEL` config constant + `AI_MODELS` list | Model swaps are a one-line change; `isValidModel` is the single allow-list for the model the user picks; `fast` slot (Haiku) stays fixed for SEO/alt-text | Inline model strings (drift risk) |
| 2026-05-30 | User model threads through generate/improve/chat only | These use the user's chosen model; SEO + alt-text always use the cheap `fast` model regardless | Per-user model for every call (needless cost on cheap tasks) |
| 2026-05-30 | FAQ uses native `<details>`; Countdown is `'use client'` | `<details>` accordion needs no JS (works in published SSR HTML); Countdown must tick, so it's a client island that hydrates in published pages | JS accordion (needless client code), static countdown (stale) |
| 2026-05-30 | Links/buttons are real `<a href>` with configurable hrefs | Nav links + CTAs were `<span>` (non-functional); now `parseLinkList` ("Label \| URL" lines) + `linkAttrs` (external → new tab); CTAs have `*Href` props; AI guide instructs working hrefs. In the editor canvas they don't navigate (content is `pointer-events-none` so clicks select) — they work on published/preview | Hardcoded `#` (dead links), separate links data model (heavier) |
| 2026-05-30 | Visual navbar menu editor; structured `props.menu`, legacy `props.links` kept in sync | `MenuItem[]` (label/linkType page\|url\|anchor/openIn/visible/icon/children) edited via `MenuEditor` (inspector `type:'menu'`); `parseMenu` prefers `menu`, migrates `links` on load; `serializeMenuToLinks` keeps the legacy string for old/AI/template readers. Internal page links resolve via an optional `linkBase` ("/s/{sub}") threaded BlockRenderer→PublishedRenderer→published routes | Replace the links string (breaks AI/templates), thread full site context into every block (invasive) |
| 2026-05-30 | Menu parser lives in `@buildr/utils` with Vitest | Pure + unit-tested (messy legacy input); first test runner in the repo (`pnpm test` → `vitest run` in utils) | Parser in web app (untestable in isolation) |
| 2026-05-30 | Per-page SEO edits reuse the existing save path | `updatePageMeta` mutates `activePage.title/seo` + marks dirty; the normal `savePage` (title+blocks+seo) persists — no new endpoint | A dedicated PATCH /seo endpoint (more surface) |
| 2026-05-30 | Analytics: privacy-light beacon + server aggregation | Published pages fire a fire-and-forget POST; uniques via a per-site localStorage flag (no cookies/PII); device from UA server-side; aggregates in `analytics.json` (totals/byPath/byDevice/byDay, 30-day cap) | Per-event log (storage growth), client-trusted device (spoofable) |
| 2026-05-30 | robots.txt + sitemap.xml served from the published web origin | Next route handlers under `/s/[subdomain]/` (more specific than `[slug]`, so no conflict); correct for crawlers vs the API-only sitemap | API-only SEO files (wrong origin for robots) |
| 2026-05-30 | Contact/Newsletter are `'use client'` submitting forms; honeypot + server validation | Public `POST /public/sites/:sub/submit` stores to `submissions.json`; hidden `website` honeypot dropped silently; in the editor (`pointer-events-none`, no `linkBase`) the form is inert and shows a local success | Third-party form service (dependency), no spam guard |
| 2026-05-30 | Submissions cascade-delete via `purgeSiteData` (repo-level) | Deleting a site/account also removes its published snapshot + submissions; uses the repository (not service) to avoid a site↔submission service cycle | Orphaned submission records |
| 2026-05-30 | Atomic JSON writes (temp + rename)    | Prevents file corruption from overlapping writes in the repo layer  | Naive overwrite (corruption under concurrency)   |
| 2026-05-30 | API port 4001 (spec said 3001)        | Port 3001 is permanently occupied by another local project on this dev machine; on Windows `localhost` prefers IPv6, which silently routed web→API calls to the wrong app | Keep 3001 (collides), bind IPv6 dual-stack (still occupied) |
| 2026-05-30 | Auth via httpOnly cookies (not bearer) | localhost:3000↔4001 is same-site, so SameSite=Lax cookies are sent automatically; no token handling in JS, XSS-safe | localStorage tokens (XSS risk), Authorization header (manual plumbing) |
| 2026-05-30 | `buildr_session` hint cookie for proxy gating | API auth cookies are httpOnly on the API origin, invisible to Next proxy (different origin); a client-set presence flag drives redirect UX while the dashboard layout verifies via /auth/me | Same-origin BFF proxying all API calls (bigger refactor) |
| 2026-05-30 | rememberMe encoded in refresh JWT (`rmb`) | /refresh can reissue with the same persistence policy without server-side session state | Stateful session store (premature) |
| 2026-05-30 | Extensionless relative imports in packages + web | Turbopack can't resolve `.js` specifiers back to `.ts` source in transpiled workspace packages; extensionless works across turbopack, tsx, and tsc-bundler | Build packages to dist (adds watch step), keep `.js` (turbopack breaks) |
| 2026-05-30 | Ownership enforced in the service (`getOwned`) | Single chokepoint returns 404 (not 403) for other users' sites, so existence never leaks; routes stay thin | Per-route checks (duplication, drift risk) |
| 2026-05-30 | TanStack Query for server state, Zustand for client/UI | Caching + invalidation for sites list; Zustand only for auth/editor UI state | Everything in Zustand (manual cache plumbing) |
| 2026-05-30 | Publish = POST `/publish`; unpublish = PATCH `status:draft` | Publish is a distinct action (sets `publishedAt`, snapshots later in Phase 8); status edits go through PATCH | Single PATCH toggle (loses publish semantics) |
| 2026-05-30 | Editor undo/redo via explicit past/future snapshot stacks | `commit(recipe)` applies an immer mutation to the active page, pushes the prior snapshot to `past` (cap 50), clears `future`; undo/redo swap snapshots — simple and predictable | zustand temporal middleware (extra dep), command pattern (overkill) |
| 2026-05-30 | Block registry maps type → {defaultProps, inspector fields, render component, icon} | One source of truth drives the palette, the renderer, the inspector form, and `createBlock`; adding a block (Phase 4+) is one registry entry + component | Separate config per concern (drift) |
| 2026-05-30 | Pages persist inside the parent Site document | Editor saves via `PUT /sites/:siteId/pages/:pageId`; writing the site bumps its `updatedAt` (dashboard "last edited") for free | Separate pages.json store (joins, extra ownership checks) |
| 2026-05-30 | Editor data loads client-side (`useSite` + `initialize`) | httpOnly auth cookie lives on the API origin, unreadable by Next server — so the editor (like the dashboard) fetches on the client | Server components fetching the API (no cookie access cross-origin) |
| 2026-05-30 | List-style blocks use a `"a \| b"` per-line textarea convention | The simple inspector (text/textarea/color/select/toggle/number) can't edit arrays of objects; `parseLines` splits lines on `\|` for features/testimonials | Nested array editor in the inspector (much more UI) |
| 2026-05-30 | Added `cta` to `BlockType` | The spec's "CTA Banner" had no matching enum member; extending the shared union + Zod enum keeps types honest | Reuse an unrelated type (confusing) |
| 2026-05-30 | AI streams over SSE read via `fetch` + ReadableStream (not EventSource) | EventSource is GET-only and can't send the prompt body or credentials easily; fetch streaming supports POST + cookies + a custom event protocol | Vercel AI SDK protocol (heavier, opinionated), EventSource (GET-only) |
| 2026-05-30 | SSE handler hijacks the reply and sets CORS headers manually | `reply.hijack()` bypasses @fastify/cors's reply hooks, so ACAO/ACAC must be written into `writeHead` for the browser to read the cross-origin stream with credentials | Let cors plugin handle it (doesn't run after hijack) |
| 2026-05-30 | AI graceful-disabled: `aiEnabled()` guard → `503 AI_DISABLED` + `/ai/status` | No `ANTHROPIC_API_KEY` returns a clean envelope (checked before hijack) and the UI adapts; never crashes | Hard-require a key (blocks the whole app) |
| 2026-05-30 | AI output is sanitized server-side, never trusted | `generate-site`/`chat` map model JSON through `sanitizeBlock`/`sanitizeTheme` (allow-list of block types, Zod theme) before persisting | Persist raw model JSON (schema/security risk) |
| 2026-05-30 | Chat actions via a fenced ` ```action {json} ``` ` block, parsed after stream | Keeps chat streaming text to the user while supporting structured edits, without Anthropic tool-use streaming complexity | Tool-use streaming (more moving parts) |
| 2026-05-30 | Templates are code-defined seed content (`config/templates.ts`), not a mutable JSON store | Typed, versioned, no seeding step; `useTemplate` clones into a real user Site with fresh page/block ids | templates.json + repo (seeding + drift, untyped) |
| 2026-05-30 | Template recommendation is a keyword heuristic | Deterministic, works with no API key, instant; ranks by category(3)/tag(2)/substring(1) | AI call (needs key, latency, cost) — can layer on later |
| 2026-05-30 | Template preview reuses the block components (BlockRenderer) | One rendering path for editor canvas, previews, and (later) published output — zero drift | A separate preview renderer (duplication) |
| 2026-05-30 | Uploads optimized with sharp → WebP, stored on disk, served at `/uploads/*` | Auto-orient + downscale ≤1600px + WebP shrinks payloads a lot; `@fastify/static` serves them; `PUBLIC_URL` builds absolute URLs for use in published sites | Store originals (large), base64 in JSON (bloats store) |
| 2026-05-30 | Media `<img>` uses raw `<img>` (Next image lint disabled at call sites) | Sources are arbitrary user/Unsplash URLs and the API origin; `next/image` needs per-host config and a loader | Configure remotePatterns for every possible host (impractical) |
| 2026-05-30 | AI alt text is best-effort on upload, never blocks | Generated via Claude vision only when `ANTHROPIC_API_KEY` is set; failures fall back to empty alt so uploads always succeed | Block upload on AI (latency, hard key dependency) |
| 2026-05-30 | Image insertion sets `src` + `alt` together | The inspector `image` field special-cases MediaField to write both props, carrying the generated/Unsplash alt onto the block | src-only (loses alt, worse a11y) |
| 2026-05-30 | Publishing snapshots content into a separate `published.json` (newest-first, max 5 versions) | Keeps the editable Site lean; the live site = `versions[0]`; rollback re-publishes an old snapshot as a new version; draft and live are decoupled | Versions inside Site (bloats editor/list payloads) |
| 2026-05-30 | Published sites render SSR via `/s/[subdomain]` reusing block components | Server components + the same blocks = SEO-correct HTML, zero renderer drift; theme sets `--color-brand` so blocks adopt the brand | Client-rendered (bad SEO), separate HTML renderer (drift) |
| 2026-05-30 | Subdomain routing via proxy host-rewrite to `/s/{sub}` + broad matcher | `{sub}.buildr.app`/`{sub}.localhost` rewrite to the path route; path works everywhere without DNS; matcher excludes `_next`/assets | Host-only routing (no local testing), separate domain app |
| 2026-05-30 | Public read endpoints are unauthenticated (own Fastify plugin, no auth hook) | Published sites must be world-readable; encapsulated plugins mean the auth `preHandler` in sibling route plugins doesn't apply | Global auth hook (would block public reads) |
| 2026-05-30 | Per-user Anthropic API key (Settings), encrypted at rest (AES-256-GCM via JWT_SECRET) | Users bring their own key; resolved per-request (user key → env fallback); stripped from PublicUser; `/ai/status` reflects per-user enablement | Single shared server key only (no BYO-key) |

**AI key note:** a Claude Pro / Claude Code subscription is NOT API access. The Anthropic API needs a separate key from console.anthropic.com (pay-as-you-go billing). Users set it in Settings → "AI (Anthropic API key)". `aiService` methods now take `apiKey` as the first arg; `resolveUserApiKey(userId)` returns the user's decrypted key or the env fallback.

**Import-extension policy:** shared packages and the web app use **extensionless** relative imports (consumed by Turbopack/tsx). The API keeps explicit **`.js`** extensions (its own tsc/Node-ESM emit). Package `build` scripts are `tsc --noEmit` — their dist is never consumed, so emitting Node-unrunnable extensionless ESM would mislead.

## Bug Fixes

- **2026-05-30 — "AI enabled" but generation says disabled.** Settings showed a
  configured key (green) yet `/ai/generate-site` returned `503 AI_DISABLED`. Root
  cause: the at-rest encryption key was derived from `JWT_SECRET`, which wasn't
  stable across dev restarts (schema default vs `.env`), so a key encrypted under
  one secret failed to decrypt under another → `resolveUserAi` returned null. The
  badge lied because `hasAiKey` only checked the field existed, not that it
  decrypts. Fix: encryption key is now a random 256-bit value persisted to
  `<DATA_DIR>/.enc.key` (stable, env-independent); `hasAiKey` verifies decryption
  so the badge is honest and self-healing (a stale key reads "not set" → re-enter
  to re-encrypt). Prevention: never derive at-rest keys from a dev-variable value.
- **2026-05-30 — Orphaned dev workers crash Turbopack.** Editor route →
  "Jest worker child process exceptions" / "paging file too small". Cause: dozens
  of orphaned Node processes (repeated dev start/stops) exhausted the Windows
  commit limit. Fix: `Get-Process node | Stop-Process -Force`, clear
  `apps/web/.next`, restart. Prevention: stop dev with Ctrl+C.
- **2026-05-30 — Dropdown clipped by card.** The site card's `overflow-hidden`
  (for rounding the thumbnail) clipped the ⋯ menu. Fix: drop `overflow-hidden`;
  round the thumbnail directly with `rounded-t-2xl`.

- **2026-05-30 — Bodyless POST returns 415/400.** Symptom: `/auth/refresh` and
  `/auth/logout` (POST, no body) failed with "Unsupported Media Type" / empty-body
  errors when a client sent `Content-Type: application/json` with an empty body —
  which the web `api-client` did on every request. Root cause: Fastify's default
  JSON parser rejects empty bodies. Fix: (1) custom content-type parser that maps
  an empty body to `undefined` ([apps/api/src/plugins/body-parser.ts]); (2)
  `api-client` only sets `Content-Type` when a body is present. Prevention: never
  send a JSON content-type without a body; keep the tolerant parser.

## Known Limitations

- JSON file store serializes writes per-repository-instance but has no
  cross-process locking — fine for single-process dev, revisit before scaling
  the API horizontally.
- No image CDN yet — media will be stored on the local filesystem (Phase 7),
  with an S3-compatible abstraction planned.
- Husky hooks require a git repository (`git init`) — until then `pnpm prepare`
  warns and is a no-op.
- Logout is stateless: it clears cookies but the refresh JWT stays valid until
  it expires (no server-side revocation list). Acceptable for v1; add a token
  version / denylist before handling sensitive data.
- Google OAuth (task 1.10) is deferred — email/password auth ships first.
- Next 16 renamed the `middleware` convention to `proxy` (`apps/web/proxy.ts`,
  `export function proxy`).
- **typedRoutes gotcha:** the typed route union lives in `.next/types` and is
  regenerated by `next build`/`dev`. After adding a new route (e.g. `/settings`),
  a standalone `pnpm typecheck` fails ("not assignable to type 'Route'") until a
  build refreshes the manifest. Run `pnpm --filter @buildr/web build` after
  adding routes, or before typechecking.
- New shared validation lives in `@buildr/schemas`; `react-hooks/refs` (React 19
  lint) rejects `useRef` for "touched"-style flags read in handlers — use
  `useState`.

## Conventions

- All shared types live in `@buildr/types`; all validation in `@buildr/schemas`
  (Zod). Frontend and backend import the same schemas.
- ESM everywhere (`"type": "module"`). Relative imports use explicit `.js`
  extensions so compiled output runs under Node without a resolver shim.
- API never calls the Anthropic SDK directly from routes — always via the
  service layer.
- Reading any JSON store file defensively strips a leading UTF-8 BOM.

## Performance Notes

_(Log performance discoveries here.)_
