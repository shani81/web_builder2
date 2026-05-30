# Pixabay Image Library — Build Plan & Task List

> Planning artifact (no code yet). Decided scope: **Pixabay, photos only in v1,
> local storage but S3-swappable later.** Customers may use images on websites
> **and in print** → legal/clearance is a first-class requirement, not a footnote.
>
> Full feasibility study lives in chat; this file is the actionable task list.

## Non-negotiables (apply to every phase)
- **Server-side API key only** — never sent to the browser.
- **Cache Pixabay responses 24h**; human-initiated requests only (no mass scraping).
- **Download-on-pick** — store an optimized copy on our storage; **never permanently
  hotlink** Pixabay URLs.
- **`safesearch=true`** by default.
- **Provenance** stored for every imported asset (source, Pixabay id, author,
  pageURL, license, retrievedAt, contentHash).
- **Clearance notice** shown to users, explicitly covering **print/merchandise +
  identifiable people/logos/brands**; plus a **ToS clause** putting clearance
  responsibility on the user (mirrors Pixabay's indemnification).

---

## Phase 1 — MVP ✅ COMPLETE (2026-05-30) · size **M**
*Goal: AI/search → Pixabay photos → pick → permanent, legal-safe image in the page.*

**Backend**
- [x] `PIXABAY_API_KEY` env (server-only) + config. → `apps/api/src/config/env.ts`
- [x] **Storage adapter** interface (`put`/`delete`) with a **Local impl now**, S3 as a
      future drop-in; media writes behind it. → `apps/api/src/config/storage.ts`
- [x] Pixabay **provider**: typed `search(query, {orientation?, type=photo, safesearch})`
      → slim `StockPhoto`. → `apps/api/src/services/pixabay.service.ts`
- [x] **24h search cache** keyed by normalized query params. → `utils/cache.ts` (`TTLCache`)
- [x] **Import-on-pick**: download `largeImageURL` → `sharp`→WebP → store via adapter →
      `MediaAsset` + provenance; **per-user dedup** by `provenance.sourceId`.
      → `apps/api/src/services/stock.service.ts`
- [x] Routes: `GET /media/stock/status|search` (auth), `POST /media/stock/import` (auth);
      **429**/**503** handling. → `apps/api/src/routes/media/index.ts`
- [x] Extend `MediaAsset` type with `provenance`. → `packages/types/src/media.types.ts`

**Frontend**
- [x] `MediaPicker`: **"Stock photos"** tab (search box + results grid, import-on-pick).
- [x] On pick → import → insert via existing image-block path (sets `src` + `alt`).
- [x] **Clearance notice** in the tab (web **+ print/merch**, people/logos/brands).
- [x] **AI hook**: chat `findImages` action → AI drawer opens stock picker pre-filled.
      → `apps/web/components/editor/ai-drawer.tsx`

**Legal**
- [x] User-facing clearance notice copy (print-aware, "BUILDR is not responsible").
- [x] Provenance saved for traceability on every import.
- [ ] ToS clause: user responsible for clearance (add when ToS page exists).

**Verified 2026-05-30:** typecheck ✅ · lint ✅ · web build ✅ · disabled-path live test ✅
(status→`enabled:false`, search/import→`503 STOCK_DISABLED`, missing `q`→`400`, auth→`401`).
Key never reaches the browser.

**Key configuration (added 2026-05-30):** the Pixabay key is now set in **Settings →
"Stock photos (Pixabay)"** (mirrors the Anthropic key UI) — **per-user, encrypted at
rest** (`pixabayApiKey` on the user record), resolved **own key → platform `PIXABAY_API_KEY`
env fallback**. Routes `GET/PUT/DELETE /auth/stock-key`. So you can either paste a key in
Settings or set a platform-wide `PIXABAY_API_KEY` in `apps/api/.env` — either enables it.
*(Fix: an empty `PIXABAY_API_KEY=` line must read as "no key" — `pixabayEnvKey()` trims and
returns null for blank, so `enabled` isn't a false positive.)*

---

## Phase 2 — Enhancements · size **M** (~5–8 dev-days)

### Slice A ✅ COMPLETE (2026-05-30) — filters, dedup, AI alt-text
- [x] **Filters UI**: orientation (any/landscape/portrait), **color** (13 Pixabay
      colors + any), **sort** (popular/latest). Threaded query→provider→24h cache
      key (`q|orientation|color|order`). Picker re-runs on filter change.
      (`image_type` stays `photo` in v1; category deferred.)
- [x] **Content-hash dedup**: `contentHash` (sha256 of optimized bytes) on
      `MediaAsset`; `upload` **and** `importExternal` reuse an existing identical
      image per-user instead of re-storing. *(Cross-user file refcounting deferred
      — risky on delete; per-user dedup covers re-import/re-upload + cross-provider.)*
- [x] **AI auto alt-text** on stock import: Claude vision describes the image
      (best-effort, needs the user's Anthropic key), falling back to Pixabay tags.
- **Verified 2026-05-30:** typecheck/lint green; filter enums validate (bad
  color/order → 400, missing q → 400); disabled path → 503; **dedup proven live**
  (same image uploaded twice → one asset reused).

### Slice B ✅ COMPLETE (2026-05-30) — provider-agnostic + Unsplash retrofit
- [x] **`StockProvider` interface** (`services/stock/provider.ts`) implemented by
      `pixabay.provider.ts` + `unsplash.provider.ts`; `stock.service` is now a
      provider registry (`statuses`/`search`/`import` take a provider name).
- [x] **Unsplash folded in**: one **Stock photos** tab with a Pixabay/Unsplash
      toggle (the separate Unsplash tab is gone). Unified routes: `GET
      /media/stock/status` → `{pixabay, unsplash}`; `search`/`import` take a
      `provider` param. Old `/media/unsplash*` routes removed.
- [x] **Unsplash now download-on-pick** (no more hotlinking): picks download the
      image to our storage with provenance (source/author/sourceUrl/Unsplash
      License) + content-hash dedup, and fire a best-effort **download-tracking
      ping** (`links.download_location`) per Unsplash ToS. Orientation maps
      (horizontal→landscape, vertical→portrait); color/sort are Pixabay-only.
- **Verified 2026-05-30:** typecheck/lint green; `status` → `{pixabay:false,
  unsplash:false}`; per-provider 503 messages; default provider = pixabay; bad
  provider → 400; unsplash import (no key) → 503. Live download needs a real
  `UNSPLASH_ACCESS_KEY`.
- *Follow-up:* show photographer attribution on published pages (Unsplash
  "should"); provenance is already stored, just not yet rendered.

### Slice C — later
- [ ] **AI upgrades**: query expansion, optional result re-ranking to page theme.
- [ ] **Rate-limit hardening**: central token-bucket/queue, request higher Pixabay
      limit, basic metrics.

---

## Phase 3 — Later / optional
- [ ] **Activate S3** storage adapter (env switch) + CDN.
- [ ] **Video** (Pixabay video API) — only once a video block exists.
- [ ] **Retention/cleanup** of unused stock assets + takedown path.
- [ ] Optional **attribution display** toggle (Pixabay doesn't require it).
- [ ] **Pexels** as a third provider behind the same interface.

---

## Open questions to confirm before/at build
1. One **platform** Pixabay key (simplest, central caching) vs per-user keys?
2. Expected search volume (decides if we request a rate-limit increase)?
3. OK to add the **clearance/indemnity clause** to user ToS (quick legal sign-off)?
4. Storage target for v1: confirmed **local now, S3-ready** (adapter handles it).
