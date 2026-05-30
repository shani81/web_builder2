# BUILDR — Roadmap

Phase tracker. Update the status after each phase. Detailed task checklists
live in `BUILDR_CLAUDE_CODE_PROMPT.md`.

| Phase | Name                       | Status         |
| ----- | -------------------------- | -------------- |
| 0     | Foundation                 | ✅ Complete    |
| 1     | Authentication & Users     | ✅ Complete    |
| 2     | Dashboard                  | ✅ Complete    |
| 3     | Editor Foundation          | ✅ Complete    |
| 4     | Core Blocks (8)            | ✅ Complete    |
| 5     | AI Integration             | ✅ Complete    |
| 6     | Template Library           | ✅ Complete    |
| 7     | Media Manager              | ✅ Complete    |
| 8     | Publishing & Preview       | ✅ Complete    |
| 9     | Polish & More Blocks (10)  | ✅ Complete    |
| 10    | Analytics & SEO            | ✅ Complete    |

**Legend:** ⚪ Not Started · 🟢 In Progress · ✅ Complete

---

## Phase 0 — Foundation

**Goal:** Every developer can clone and run in < 5 minutes.
**Done when:** `pnpm dev` starts both apps with no errors.

- [x] 0.1 Initialize pnpm monorepo with workspace config
- [x] 0.2 Create `@buildr/types` with all core types
- [x] 0.3 Create `@buildr/schemas` with Zod schemas
- [x] 0.4 Create `@buildr/utils` (slug, color, responsive, date, id)
- [x] 0.5 Scaffold Next.js 16.2 app (App Router, Tailwind 4, TS strict)
- [x] 0.6 Scaffold Fastify 5 API (cors, helmet, rate-limit, error handler)
- [x] 0.7 ESLint 9 (flat) + Prettier + Husky + lint-staged
- [x] 0.8 `.env.example` for both apps, documented
- [x] 0.9 Initialize `MEMORY.md` and `ROADMAP.md`
- [x] 0.10 Root `README.md` with setup instructions
- [x] Verify: `pnpm install`, `pnpm typecheck`, `pnpm dev`

## Phase 1 — Authentication & Users

**Goal:** Users can register, log in, and have a session.
**Done when:** User can register, log in, refresh, and log out.

- [x] 1.1 JSON user repository with CRUD (+ `findByEmail`)
- [x] 1.2 Password hashing with argon2
- [x] 1.3 JWT access (15m) + refresh (7d) tokens
- [x] 1.4 Auth routes: register, login, logout, me, refresh (httpOnly cookies)
- [x] 1.5 API auth middleware (`authenticate` preHandler)
- [x] 1.6 Next.js proxy (middleware) for protected-route redirect
- [x] 1.7 Register page (name, email, password)
- [x] 1.8 Login page with "remember me"
- [x] 1.9 Auth store (Zustand) with user state + logout
- [ ] 1.10 Google OAuth — **deferred** (optional for v1)

Verified end-to-end against the running API: register → me → refresh → logout →
401, plus bad-password, duplicate-email, and validation paths. Web app builds
and prerenders all auth/dashboard routes.

## Phase 2 — Dashboard

**Goal:** Users can see and manage their sites.
**Done when:** User can create, list, and delete sites from the dashboard.

- [x] 2.1 Dashboard layout (dark sidebar + scrollable main) with auth guard
- [x] 2.2 JSON site repository (`findByUser`, `findBySubdomain`)
- [x] 2.3 Site list API with user filtering (+ create/get/update/delete/duplicate/publish)
- [x] 2.4 Dashboard home with site cards (name, status, subdomain, last edited, thumbnail)
- [x] 2.5 Create site modal (name + auto-slugged subdomain validation)
- [x] 2.6 Site quick actions (rename, duplicate, delete, publish toggle)
- [x] 2.7 Empty state ("Create your first site" CTA)
- [x] 2.8 Settings page (profile, password change, danger zone)

Verified live: create → list → rename → publish → duplicate → delete, ownership
isolation (404 across users), duplicate-subdomain 409; settings profile update,
password change (+ login with new password), and account deletion cascade
(removes the user's sites). Web production build prerenders all 6 routes.

## Phase 3 — Editor Foundation

**Goal:** User can open the editor, see the canvas, and build a page.
**Done when:** User can add, rearrange, and remove blocks and changes persist.

- [x] 3.1 Editor route + isolated, auth-guarded layout
- [x] 3.2 Editor Zustand store with undo/redo history (50-step) + immer mutations
- [x] 3.3 Canvas (centered, scrollable, zoom-aware)
- [x] 3.4 Device preview switcher with responsive canvas sizing
- [x] 3.5 Left block palette (Navbar, Hero, Text, Footer)
- [x] 3.6 Right inspector (context-aware props form)
- [x] 3.7 Block selection (click to select, click canvas to deselect)
- [x] 3.8 Block renderer (renders block components from JSON)
- [x] 3.9 Drag-to-reorder blocks (dnd-kit)
- [x] 3.10 Add block by clicking in palette
- [x] 3.11 Remove block (Delete key + inspector button)
- [x] 3.12 Undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- [x] 3.13 Auto-save (30s interval + dirty-state indicator)
- [x] 3.14 Manual save button with loading state

API: `GET`/`PUT /sites/:siteId/pages/:pageId` (ownership-enforced). Verified
live: save blocks → reload (intact) → reorder (persists) → site `updatedAt`
bumps; malformed blocks rejected (400). Editor routes SSR-render with no crash;
proxy gates `/editor/*`. Build/typecheck/lint green.

## Phase 4 — Core Blocks

**Goal:** Enough blocks to build a real landing page.
**Done when:** User can build a complete, professional landing page.

- [x] 4.1 Navbar — brand, links, CTA, colors, sticky toggle
- [x] 4.2 Hero — headline, subtext, primary/secondary CTA, color or image bg
- [x] 4.3 Features — heading, 2/3/4 columns, "Title | Description" items
- [x] 4.4 Testimonials — quote cards, "Quote | Author | Role" items
- [x] 4.5 CTA Banner — full-width, color or image background
- [x] 4.6 Footer — brand, tagline, link + social columns, copyright
- [x] 4.7 Image — URL, alt, caption, width, rounded (upload deferred to Phase 7)
- [x] 4.8 Text — heading, content, alignment (rich-text WYSIWYG deferred, see note)

Inspector gained `toggle` + `number` field types and a `parseLines` convention
for list-style blocks. Verified live: a 7-block landing page (navbar→hero→
features→testimonials→cta→image→footer) saves and reloads with all props
(booleans/columns) intact; unknown block types rejected (400). Build/types/lint
green.

**Note (4.8):** the Text block stays structured (heading/content/align) rather
than a full bold/italic/link WYSIWYG — that needs a rich-text editor (e.g.
TipTap) and doesn't fit the inspector props-form model. Deferred to Phase 9
polish to avoid a heavy dependency now.

## Phase 5 — AI Integration

**Goal:** AI can generate a site and assist with content.
**Done when:** User can describe a site and have AI generate a full draft.

- [x] 5.1 Anthropic SDK in the service layer (Claude Opus 4.8 via `config/ai.ts`)
- [x] 5.2 SSE streaming infrastructure (`utils/sse.ts`, CORS-aware)
- [x] 5.3 AI Site Generator `POST /ai/generate-site` (streaming → persists → opens)
- [x] 5.4 "Generate with AI" tab in the Create Site dialog
- [x] 5.5 Generation progress UI (streamed status)
- [x] 5.6 AI Content Assistant `POST /ai/improve-content` (streaming)
- [x] 5.7 AI panel in the editor (drawer with Chat + SEO tabs)
- [x] 5.8 Chat with editor context (knows the page's blocks + theme)
- [x] 5.9 AI action executor (addBlock / updateBlock / removeBlock applied live)
- [x] 5.10 AI SEO analyzer (`POST /ai/analyze-seo`): score + suggestions

All endpoints are auth-guarded and degrade gracefully: with no
`ANTHROPIC_API_KEY` they return a clean `503 AI_DISABLED`, and `/ai/status`
reports availability so the UI can adapt. Verified live: status, auth (401),
and the 503-disabled path for all four AI endpoints; build/types/lint green.

**Note:** live generation/chat requires a real `ANTHROPIC_API_KEY` (set it in
`apps/api/.env`). The streaming pipeline, sanitizers, persistence, and UI are in
place and type-safe but were not exercised against the live model here (no key).

## Phase 6 — Template Library

**Goal:** Users can start from a polished template.
**Done when:** User can browse, preview, and start from any template.

- [x] 6.1 Template data structure + catalog store (`config/templates.ts`)
- [x] 6.2 10 seed templates (2 each: Business, Portfolio, Restaurant, SaaS, Event)
- [x] 6.3 Templates gallery page with category filter
- [x] 6.4 Template preview modal (full-screen, device switcher, real BlockRenderer)
- [x] 6.5 "Use Template" → clones pages + blocks (fresh ids) into a new site
- [x] 6.6 Template recommendation from a prompt (keyword/category scoring)

Verified live: list (10), category filter, get-with-pages, use→clone (fresh
block ids, unique subdomain, appears in sites), recommend ranks correctly for
"italian restaurant" → restaurants and "analytics dashboard" → SaaS; unknown
id → 404. Build/types/lint green.

**Notes:** templates are code-defined seed content (typed, versioned) rather
than a mutable JSON file — `usageCount` isn't persisted. Recommendation is a
deterministic keyword heuristic (works with no API key); it can be upgraded to
the AI model later. The gallery reuses the block components for live previews.

## Phase 7 — Media Manager

**Goal:** Users can upload and manage images.
**Done when:** User can upload, search, and insert images from any block.

- [x] 7.1 Upload endpoint (multipart, validation, local storage)
- [x] 7.2 Media list API with pagination + delete
- [x] 7.3 Media picker (grid, search/upload, delete) — opened from image blocks
- [x] 7.4 Unsplash integration (search + insert), graceful when no key
- [x] 7.5 Image optimization (sharp: auto-orient, downscale ≤1600px, WebP)
- [x] 7.6 AI alt text on upload (Claude vision, best-effort)

Static files served at `/uploads/*`. Verified live: upload (PNG→WebP, stored,
served), list+pagination, delete (record + file → 404), unsupported-type 400,
Unsplash disabled → 503. Build/types/lint green.

**Notes:** AI alt text runs only when `ANTHROPIC_API_KEY` is set (best-effort,
never blocks upload). Unsplash search needs `UNSPLASH_ACCESS_KEY`; the picker
shows a clear notice otherwise. Inserting an image sets both `src` and (when
available) `alt` on the block.

## Phase 8 — Publishing & Preview

**Goal:** Users can publish and share their site.
**Done when:** User can publish a site accessible via a URL.

- [x] 8.1 Published site renderer (SSR, reads published JSON, renders blocks)
- [x] 8.2 Subdomain routing (`{sub}.host` → `/s/{sub}` via proxy; path-based too)
- [x] 8.3 Publish endpoint (snapshots current pages into a versioned record)
- [x] 8.4 Publish dialog with confirm + live URL
- [x] 8.5 Live preview (opens the published `/s/{sub}` URL in a new tab)
- [x] 8.6 Version history (last 5 snapshots, newest-first)
- [x] 8.7 Rollback (re-publishes a prior snapshot as a new live version)
- [x] 8.8 SEO output (per-page `<title>`/description/OG/robots + sitemap.xml)

Verified live (API + web): publish v1 → public SSR renders it; publish v2 →
renders v2; rollback→v1 renders v1 again; sitemap has urls; unpublish → public
404 (both API and rendered page). Build/types/lint green.

**Notes:** publishing snapshots the **saved** content (the dialog saves first);
the editor draft and the live version are independent, so rollback changes the
live site without touching the draft. Real `{sub}.buildr.app` routing needs DNS
in production — the proxy rewrite + `/s/[subdomain]` path work today (incl.
`{sub}.localhost`). Theme drives `--color-brand` so blocks adopt the site brand.

## Phase 9 — Polish & More Blocks (10)

**Goal:** Round out the block library to a full toolkit.

- [x] Pricing (tiers + feature lists, highlighted plan)
- [x] FAQ (native `<details>` accordion — works in published HTML)
- [x] Contact form (name/email/message UI)
- [x] Gallery (URL-per-line grid)
- [x] Video (YouTube/Vimeo responsive embed)
- [x] Stats (animated-style number grid)
- [x] Team (member cards with avatar/initials)
- [x] Countdown (live client component, ticks in editor + published)
- [x] Newsletter (email capture band)
- [x] Logo Cloud (names or image URLs)

Block library is now **18 blocks**. Added `faq/stats/team/newsletter/logos` to
`BlockType`, a `date` inspector field, an `advanced` block category, and wired
all 10 into the AI generator's allow-list + block guide. Verified live: all 10
save/reload with props intact; unknown types rejected (400). Build/types/lint
green.

**Notes:** the contact + newsletter forms are visual (no submission backend
yet — a webhook handler is a future task). Countdown is the first client-side
("use client") block; it hydrates in published pages.

## Phase 10 — Analytics & SEO

**Goal:** Per-page SEO control + traffic insight.

- [x] Per-page SEO editor (title, meta title/description, OG image, canonical,
      noIndex) with a live Google-style preview — toolbar "Search" button.
- [x] AI SEO score + apply suggested title/description (reuses `/ai/analyze-seo`).
- [x] Analytics tracking (privacy-light beacon on published pages → aggregation).
- [x] Analytics dashboard (total views, unique visitors, 14-day chart, top
      pages, device breakdown) with a site selector.
- [x] `sitemap.xml` + `robots.txt` served from the published origin.

Verified live: SEO metadata persists via the save path; 3 tracked views →
2 unique, correct top-pages + UA-derived device split; robots/sitemap serve.
Build/types/lint green.

---

## 🎉 Roadmap complete — Phases 0–10 all shipped.

Foundation → Auth → Dashboard → Editor → 18 Blocks → AI (BYO key, model picker)
→ Templates → Media → Publishing/versioning → Polish → Analytics & SEO.

### Post-roadmap enhancements

- [x] **Form submissions** — Contact + Newsletter blocks are real submitting
      forms (honeypot spam guard, validation). Owner **Submissions inbox**
      (`/submissions`) lists/deletes messages + signups; cascades on site/account
      delete. Verified live: submit → inbox, honeypot drop, 400 on bad email,
      delete, cascade.

Remaining follow-ups (intentionally deferred): nested sub-menu children editor +
anchor smooth-scroll, custom-domain connection, password-protected/scheduled
publishing, an image CDN/S3 swap, email notifications for submissions, and
broader automated test coverage (Vitest is set up in `@buildr/utils`).
