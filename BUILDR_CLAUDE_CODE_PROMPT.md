# BUILDR — AI-Powered SaaS Website Builder
## Master Build Prompt for Claude Code

---

> **You are acting as a Senior Full-Stack Architect, UX Director, and Project Manager simultaneously.**
> Your audience includes non-technical customers who expect polished, production-grade results.
> Think outside the box. Build for today, design for tomorrow.

---

## PROJECT OVERVIEW

Build **BUILDR** — an industry-level, AI-integrated SaaS website builder inspired by Wix, Shopify, and WordPress. The product must rival commercial platforms in UX quality, be extensible to enterprise scale, and deeply leverage AI for every aspect of the design/build experience.

**Core Promise to the User:**
> "Describe what you want, and BUILDR builds it. Click to customize. Publish in seconds."

---

## ABSOLUTE RULES — READ BEFORE EVERY FILE YOU CREATE

1. **Clean, future-secure code** — no hacks, no shortcuts, no magic strings. Every decision must be defensible at scale.
2. **Strict frontend/backend separation** — no business logic in the UI, no UI concerns in the API.
3. **JSON file store** (no database yet) — use structured JSON files with a clean repository pattern so swapping to PostgreSQL/MongoDB later requires changing only one layer.
4. **Modular, platform-agnostic components** — every component must work standalone and be embeddable in external platforms.
5. **TypeScript + JavaScript only** — TypeScript for all source files; pure JavaScript only for config files that require it.
6. **Plan before you code** — create an architecture decision record (ADR) before implementing any non-trivial feature.
7. **Reusable everything** — DRY principle enforced. Token budget matters: shared types, shared utils, shared hooks.
8. **Living memory** — maintain `MEMORY.md` in the project root. Log every bug fix, every architectural decision, every "why we did it this way." Never rethink solved problems.
9. **Web standards first** — semantic HTML, WCAG 2.2 AA accessibility, Core Web Vitals targets (LCP < 2.5s, CLS < 0.1, INP < 200ms).
10. **Expandable from day one** — plugin architecture, feature flags, and tenant isolation baked in from the start.

---

## TECHNOLOGY STACK

### Frontend
```
Framework:      Next.js 15 (App Router)
Language:       TypeScript 5.x
Styling:        Tailwind CSS 4.x + CSS custom properties
State:          Zustand (global) + React Query v5 (server state)
Canvas Engine:  Fabric.js + custom React wrapper
AI Client:      Vercel AI SDK (streaming)
Animations:     Framer Motion
Icons:          Lucide React
Forms:          React Hook Form + Zod
Testing:        Vitest + Playwright
```

### Backend
```
Runtime:        Node.js 22 LTS
Framework:      Fastify 5 (not Express — performance matters)
Language:       TypeScript 5.x
Validation:     Zod (shared schemas with frontend)
Auth:           Better Auth (sessions + OAuth)
AI:             Anthropic SDK (Claude claude-sonnet-4-20250514)
File Store:     JSON files via repository pattern (DB-ready interfaces)
Storage:        Local filesystem → S3-compatible (abstracted)
Queue:          BullMQ-compatible interface (in-memory for now)
Testing:        Vitest
```

### Shared
```
Monorepo:       pnpm workspaces
Packages:       @buildr/types, @buildr/schemas, @buildr/utils
Linting:        ESLint 9 (flat config) + Prettier
Git hooks:      Husky + lint-staged
```

---

## PROJECT STRUCTURE

```
buildr/
├── MEMORY.md                    ← Living bug/decision log — ALWAYS UPDATE
├── ROADMAP.md                   ← Phase tracker — update after each phase
├── package.json                 ← Root pnpm workspace
├── pnpm-workspace.yaml
├── .env.example
│
├── packages/
│   ├── types/                   ← @buildr/types — all shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── site.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── template.types.ts
│   │   │   ├── ai.types.ts
│   │   │   └── editor.types.ts
│   │   └── package.json
│   │
│   ├── schemas/                 ← @buildr/schemas — Zod schemas (shared validation)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── site.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── ai.schema.ts
│   │   └── package.json
│   │
│   └── utils/                   ← @buildr/utils — pure utility functions
│       ├── src/
│       │   ├── index.ts
│       │   ├── color.utils.ts
│       │   ├── slug.utils.ts
│       │   └── responsive.utils.ts
│       └── package.json
│
├── apps/
│   ├── web/                     ← Next.js frontend
│   │   ├── app/
│   │   │   ├── (marketing)/     ← Public marketing pages
│   │   │   │   ├── page.tsx     ← Landing page
│   │   │   │   ├── pricing/
│   │   │   │   └── templates/
│   │   │   ├── (auth)/          ← Auth pages (login, register, etc.)
│   │   │   ├── (dashboard)/     ← Authenticated dashboard
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx     ← Dashboard home
│   │   │   │   ├── sites/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   └── (editor)/        ← Visual editor (isolated layout)
│   │   │       ├── layout.tsx
│   │   │       └── [siteId]/
│   │   │           └── [pageId]/
│   │   ├── components/
│   │   │   ├── ui/              ← Headless primitives (Button, Input, Modal…)
│   │   │   ├── editor/          ← Editor-specific components
│   │   │   │   ├── Canvas/
│   │   │   │   ├── Toolbar/
│   │   │   │   ├── Inspector/
│   │   │   │   ├── LayerPanel/
│   │   │   │   └── AIAssistant/
│   │   │   ├── dashboard/       ← Dashboard widgets
│   │   │   ├── blocks/          ← Draggable content blocks (Hero, Feature, CTA…)
│   │   │   └── preview/         ← Live preview renderer
│   │   ├── hooks/               ← Custom React hooks
│   │   ├── stores/              ← Zustand stores
│   │   ├── lib/                 ← Client-side utilities
│   │   ├── styles/              ← Global CSS
│   │   └── public/
│   │
│   └── api/                     ← Fastify backend
│       ├── src/
│       │   ├── server.ts        ← Entry point
│       │   ├── config/          ← Env, feature flags
│       │   ├── plugins/         ← Fastify plugins (auth, cors, rate-limit)
│       │   ├── routes/          ← Route handlers (thin controllers)
│       │   │   ├── auth/
│       │   │   ├── sites/
│       │   │   ├── pages/
│       │   │   ├── templates/
│       │   │   ├── media/
│       │   │   └── ai/
│       │   ├── services/        ← Business logic lives here
│       │   │   ├── site.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── template.service.ts
│       │   │   └── media.service.ts
│       │   ├── repositories/    ← Data access layer (swap DB here only)
│       │   │   ├── base.repository.ts
│       │   │   ├── site.repository.ts
│       │   │   └── user.repository.ts
│       │   ├── middleware/
│       │   └── utils/
│       └── data/                ← JSON file store (gitignored except seeds)
│           ├── users.json
│           ├── sites.json
│           ├── templates.json
│           └── seed/            ← Seed data for development
```

---

## CORE DATA MODELS

Define these in `@buildr/types` first. Every other file depends on these.

```typescript
// site.types.ts

export type SiteStatus = 'draft' | 'published' | 'archived';
export type DevicePreview = 'desktop' | 'tablet' | 'mobile';
export type BlockType =
  | 'hero' | 'navbar' | 'features' | 'pricing' | 'testimonials'
  | 'gallery' | 'contact' | 'footer' | 'text' | 'image'
  | 'video' | 'embed' | 'spacer' | 'divider' | 'countdown'
  | 'form' | 'map' | 'social' | 'code' | 'ai-generated';

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontHeading: string;
  fontBody: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  spacing: 'compact' | 'normal' | 'relaxed';
}

export interface BlockProps {
  [key: string]: unknown;
}

export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
  styles: Record<string, string | number>;
  children?: Block[];
  locked: boolean;
  visible: boolean;
  responsive: {
    desktop: Partial<BlockProps>;
    tablet: Partial<BlockProps>;
    mobile: Partial<BlockProps>;
  };
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  blocks: Block[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage?: string;
    noIndex: boolean;
  };
  isHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  userId: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: SiteStatus;
  theme: SiteTheme;
  pages: Page[];
  settings: SiteSettings;
  analytics: SiteAnalytics;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

---

## FEATURE MODULES

Build these modules in order. Each module is self-contained with its own components, hooks, and API routes.

### Module 1: Authentication & Onboarding
- Email/password registration with email verification
- Google OAuth
- Onboarding wizard: "What type of site are you building?" → AI suggests templates
- User profile with avatar, timezone, plan tier
- Session management with refresh tokens

### Module 2: Dashboard
- Site card grid with thumbnail previews
- "Create New Site" flow: blank | from template | AI-generated
- Site status badges (Draft / Published / Archived)
- Quick-actions: Edit, Preview, Publish, Duplicate, Delete
- Usage stats: pages, storage, visits
- Global search (sites, pages, blocks)

### Module 3: Visual Editor (Core)
The heart of the product. Build this with extreme care.

**Canvas:**
- Drag-and-drop block reordering (dnd-kit)
- Multi-select with Shift+click
- Click-to-select any element
- Resize handles on selection
- Undo/redo (50-step history) via Zustand middleware
- Grid/guide snapping
- Device preview toggle (desktop/tablet/mobile)
- Real-time zoom control (25%–200%)

**Left Panel — Block Library:**
- Categorized block palette
- Search blocks
- Drag from palette onto canvas
- Saved custom blocks

**Right Panel — Inspector:**
- Context-aware: shows props for selected block
- Typography controls (font, size, weight, color, alignment)
- Spacing (margin/padding sliders)
- Background (color, gradient, image)
- Border & shadow
- Animation settings
- Responsive overrides toggle

**Top Toolbar:**
- Undo / Redo
- Device preview switcher
- Zoom controls
- AI Assistant button (opens side drawer)
- Preview (opens new tab)
- Save (auto-save every 30s + manual)
- Publish button

**AI Assistant Drawer:**
See AI Integration section below.

### Module 4: AI Integration (Deep)

Every AI feature streams responses using the Vercel AI SDK. Never block the UI.

**AI Site Generator:**
```
User input: "I need a website for my Italian restaurant in Stockholm"
AI outputs:
  → Suggested site name + tagline
  → Color palette (primary, secondary, accent)
  → Font pairing
  → Full page structure with populated blocks
  → SEO meta tags
  → Placeholder images (described for later Unsplash fetch)
```

**AI Content Assistant (in-editor drawer):**
- "Write hero section copy for a SaaS product"
- "Make this paragraph more professional"
- "Generate 3 testimonials for a dental clinic"
- "Suggest a better CTA for this button"
- "Translate all page content to Swedish"

**AI Design Suggestions:**
- "This section looks crowded — here's how to fix it"
- Color contrast warnings with AI-suggested fixes
- "Your hero image and text color clash — switch to white text?"

**AI SEO Optimizer:**
- Analyze current page, return score (0-100)
- Specific improvement suggestions
- Auto-generate meta descriptions

**AI Image Alt Text Generator:**
- On image upload, generate descriptive alt text automatically

**AI Chat Interface:**
- Persistent chat in editor sidebar
- Context-aware: knows the current page structure
- Can execute actions: "Make the navbar sticky", "Change primary color to #FF6B35"
- Streaming responses with action confirmation UI

**Backend AI Service (`ai.service.ts`):**
```typescript
// All AI calls go through this service — never call Anthropic SDK directly from routes
export class AIService {
  async generateSite(prompt: string, options: GenerateSiteOptions): AsyncGenerator<SiteGenerationChunk>
  async improveContent(content: string, instruction: string): AsyncGenerator<string>
  async analyzeSEO(page: Page): Promise<SEOAnalysis>
  async generateAltText(imageDescription: string): Promise<string>
  async executeEditorAction(action: string, context: EditorContext): Promise<EditorAction>
}
```

### Module 5: Template Library
- 50+ pre-built templates across categories:
  - Business, Portfolio, Restaurant, E-commerce, Blog, Agency, SaaS, Event, Medical, Education
- Template preview (full-screen modal with device toggle)
- "Use Template" → clones all pages and blocks into new site
- AI template recommendation based on user description
- Template tagging and filtering
- Community templates (future: user submissions)

### Module 6: Media Manager
- Upload images (drag-drop or file picker)
- Unsplash integration (free stock photos, search + insert)
- Image optimization on upload (Next.js Image API)
- Folder organization
- Image editor: crop, resize, brightness/contrast, filters
- Usage tracking (which blocks use which images)
- Bulk operations

### Module 7: SEO & Analytics
- Per-page SEO editor (title, description, OG image, canonical)
- Sitemap.xml auto-generation
- Robots.txt editor
- Analytics dashboard (visits, unique visitors, top pages, devices)
- AI SEO score with recommendations
- Google Search Console integration (future)

### Module 8: Publishing & Domains
- One-click publish to `{subdomain}.buildr.app`
- Custom domain connection (CNAME instructions)
- SSL auto-provisioning status
- Version history (last 10 publishes, rollback)
- Scheduled publishing
- Password-protected sites

### Module 9: E-commerce (Phase 2)
- Product catalog management
- Shopping cart block
- Stripe checkout integration
- Order management dashboard
- Inventory tracking
- Discount codes

---

## BLOCK LIBRARY — DETAILED SPEC

Each block is a standalone component in `apps/web/components/blocks/`. Every block must:
- Accept a typed `props` object
- Emit change events to the editor store
- Support responsive variants
- Have a preview thumbnail (SVG, not screenshot)
- Be documented with JSDoc

### Blocks to Build (Priority Order)

```
Phase 1 (Core):
  ✓ Navbar          — Logo, links, CTA button, mobile hamburger
  ✓ Hero            — Headline, subtext, CTA, background (image/video/gradient)
  ✓ Features        — 3-column grid with icons, titles, descriptions
  ✓ Footer          — Links, social icons, copyright
  ✓ Text            — Rich text editor (prose)
  ✓ Image           — Single image with caption, link, alt text
  ✓ Spacer          — Configurable height gap
  ✓ Divider         — Horizontal rule with style options

Phase 2 (Growth):
  ✓ Pricing         — 2-3 tier pricing table with feature lists
  ✓ Testimonials    — Quote cards with avatar, name, role
  ✓ CTA Banner      — Full-width call-to-action with background
  ✓ Gallery         — Masonry or grid photo gallery
  ✓ Contact Form    — Name, email, message, submit → webhook
  ✓ FAQ             — Accordion-style questions and answers
  ✓ Team            — Grid of team member cards
  ✓ Stats           — Animated number counters with labels

Phase 3 (Power):
  ✓ Video           — YouTube/Vimeo embed or direct upload
  ✓ Map             — Google Maps embed
  ✓ Countdown       — Event countdown timer
  ✓ Social Feed     — Instagram/Twitter embed
  ✓ Code            — Syntax-highlighted code block
  ✓ Embed           — Generic iframe embed
  ✓ Newsletter      — Email capture with Mailchimp/ConvertKit integration
  ✓ Blog Grid       — Latest posts grid (for blog sites)
  ✓ Logo Cloud      — Client/partner logo strip
  ✓ Before/After    — Split image comparison slider
```

---

## EDITOR STATE ARCHITECTURE

Use Zustand with immer middleware. This is the most complex part — get it right.

```typescript
// stores/editor.store.ts

interface EditorState {
  // Site data
  site: Site | null;
  activePage: Page | null;

  // UI state
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  devicePreview: DevicePreview;
  zoom: number;
  isAIPanelOpen: boolean;
  isSaving: boolean;
  isDirty: boolean;

  // History (undo/redo)
  history: Page[];
  historyIndex: number;

  // Actions
  selectBlock: (id: string | null) => void;
  updateBlock: (id: string, changes: Partial<Block>) => void;
  addBlock: (block: Block, afterId?: string) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  duplicateBlock: (id: string) => void;
  setDevicePreview: (device: DevicePreview) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  savePage: () => Promise<void>;
}
```

---

## API DESIGN

RESTful with consistent response envelopes. All routes prefixed with `/api/v1`.

```
AUTH
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  GET    /api/v1/auth/me
  POST   /api/v1/auth/refresh

SITES
  GET    /api/v1/sites                    ← list user's sites
  POST   /api/v1/sites                    ← create site
  GET    /api/v1/sites/:id
  PATCH  /api/v1/sites/:id
  DELETE /api/v1/sites/:id
  POST   /api/v1/sites/:id/publish
  POST   /api/v1/sites/:id/duplicate

PAGES
  GET    /api/v1/sites/:siteId/pages
  POST   /api/v1/sites/:siteId/pages
  GET    /api/v1/sites/:siteId/pages/:pageId
  PUT    /api/v1/sites/:siteId/pages/:pageId
  DELETE /api/v1/sites/:siteId/pages/:pageId
  POST   /api/v1/sites/:siteId/pages/:pageId/reorder-blocks

TEMPLATES
  GET    /api/v1/templates
  GET    /api/v1/templates/:id
  POST   /api/v1/templates/:id/use        ← clone into new site

MEDIA
  GET    /api/v1/media
  POST   /api/v1/media/upload
  DELETE /api/v1/media/:id
  GET    /api/v1/media/unsplash?q=...

AI
  POST   /api/v1/ai/generate-site         ← streaming SSE
  POST   /api/v1/ai/improve-content       ← streaming SSE
  POST   /api/v1/ai/analyze-seo
  POST   /api/v1/ai/generate-alt-text
  POST   /api/v1/ai/chat                  ← streaming SSE with context

Response envelope:
{
  success: true,
  data: { ... },
  meta: { page, limit, total }  // for paginated responses
}

Error envelope:
{
  success: false,
  error: {
    code: 'SITE_NOT_FOUND',
    message: 'Human-readable message',
    details?: { field: 'name', issue: 'too long' }
  }
}
```

---

## JSON REPOSITORY PATTERN

This abstraction is critical. The database swap later must require zero changes outside `repositories/`.

```typescript
// repositories/base.repository.ts

export abstract class BaseRepository<T extends { id: string }> {
  protected abstract filePath: string;

  protected async readAll(): Promise<T[]>
  protected async writeAll(items: T[]): Promise<void>
  async findById(id: string): Promise<T | null>
  async findMany(filter?: Partial<T>): Promise<T[]>
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  async update(id: string, data: Partial<T>): Promise<T | null>
  async delete(id: string): Promise<boolean>
}

// When moving to Postgres: replace this class with a Prisma/Drizzle implementation.
// Service layer never changes. Route layer never changes.
```

---

## UI/UX DESIGN PRINCIPLES

You are designing for **non-technical users**. Every interaction must feel obvious.

**Visual Design:**
- Design language: Modern, clean, professional. Think Notion + Linear + Vercel dashboard.
- Color palette: Dark sidebar (`#0F0F12`), white canvas, electric blue accent (`#4F6EF7`), green success (`#22C55E`).
- Typography: Geist Sans for UI, Inter for editor content.
- Spacing: 8px grid system throughout.
- Animations: Subtle, 150-200ms. Never animation for animation's sake.

**Editor UX Rules:**
1. Always show what you clicked on — blue selection ring with handles
2. Hover previews before dropping — ghost block at drop target
3. Auto-save indicator in top bar ("Saved 2 minutes ago")
4. Undo confirmation: "Your last change was undone. Redo?"
5. Empty canvas state: "Drag a block here, or let AI build for you →"
6. Block settings open instantly (no loading states on selection)
7. Color pickers show brand colors first, then recent, then full wheel
8. "?" tooltips on every inspector control
9. Keyboard shortcuts panel accessible from Help menu

**Accessibility:**
- All interactive elements keyboard navigable
- Focus indicators always visible (never `outline: none` without replacement)
- Screen reader announcements for drag-and-drop operations
- Color contrast ratio ≥ 4.5:1 for all text
- Skip links for editor regions

---

## MEMORY.md — INITIAL TEMPLATE

Create this file immediately and update it continuously:

```markdown
# BUILDR — Project Memory

## Architecture Decisions
| Date | Decision | Reason | Alternatives Considered |
|------|----------|--------|------------------------|
| [today] | Fastify over Express | 2x throughput, built-in schema validation | Hono (less ecosystem), Express (too slow) |
| [today] | Zustand over Redux | Less boilerplate, better TS inference | Redux Toolkit (overkill), Jotai (too atomic) |
| [today] | JSON files over SQLite | Simplest possible, mirrors DB repository pattern | SQLite (harder to inspect), lowdb (abandoned) |

## Bug Fixes
(Log every bug here: date, symptom, root cause, fix)

## Known Limitations
- JSON file store has no concurrent write safety — acceptable for single-user dev, fix before multi-user launch
- No image CDN — files stored locally

## Performance Notes
(Log any performance discoveries here)
```

---

## PHASE PLAN & TASK BREAKDOWN

### ✅ PHASE 0 — Foundation (Start Here)
*Goal: Every developer can clone and run in < 5 minutes*

- [ ] **0.1** Initialize pnpm monorepo with workspace config
- [ ] **0.2** Create `@buildr/types` package with all core types
- [ ] **0.3** Create `@buildr/schemas` package with Zod schemas
- [ ] **0.4** Create `@buildr/utils` package with slug, color, date utils
- [ ] **0.5** Scaffold Next.js 15 app with App Router, Tailwind CSS 4, TypeScript strict mode
- [ ] **0.6** Scaffold Fastify API with TypeScript, plugins (cors, helmet, rate-limit)
- [ ] **0.7** Set up ESLint + Prettier + Husky pre-commit hooks
- [ ] **0.8** Create `.env.example` with all required variables documented
- [ ] **0.9** Initialize `MEMORY.md` and `ROADMAP.md`
- [ ] **0.10** Write root `README.md` with setup instructions

**Phase 0 Complete When:** `pnpm dev` starts both apps with no errors

---

### ✅ PHASE 1 — Authentication & User Management
*Goal: Users can register, log in, and have a session*

- [ ] **1.1** JSON user repository with CRUD operations
- [ ] **1.2** Password hashing with argon2
- [ ] **1.3** JWT session tokens (access 15min + refresh 7d)
- [ ] **1.4** Auth routes: `/register`, `/login`, `/logout`, `/me`, `/refresh`
- [ ] **1.5** Auth middleware (verify token on protected routes)
- [ ] **1.6** Next.js middleware for protected route redirect
- [ ] **1.7** Register page (email, password, name)
- [ ] **1.8** Login page with "remember me"
- [ ] **1.9** Auth store (Zustand) with user state + logout action
- [ ] **1.10** Google OAuth flow (optional for v1)

**Phase 1 Complete When:** User can register, log in, refresh, and log out

---

### ✅ PHASE 2 — Dashboard
*Goal: Users can see and manage their sites*

- [ ] **2.1** Dashboard layout (sidebar nav + main content area)
- [ ] **2.2** JSON site repository
- [ ] **2.3** Site list API route with user filtering
- [ ] **2.4** Dashboard homepage with site cards (name, status, last edited, thumbnail placeholder)
- [ ] **2.5** Create site modal (name + subdomain validation)
- [ ] **2.6** Site quick actions (rename, duplicate, delete, publish toggle)
- [ ] **2.7** Empty state (illustration + "Create your first site" CTA)
- [ ] **2.8** User settings page (profile, password change, danger zone)

**Phase 2 Complete When:** User can create, list, and delete sites from dashboard

---

### ✅ PHASE 3 — Editor Foundation
*Goal: User can open editor, see canvas, add a basic block*

- [ ] **3.1** Editor route and isolated layout (no dashboard chrome)
- [ ] **3.2** Editor Zustand store with history middleware
- [ ] **3.3** Canvas component (center, scrollable, zoom-aware)
- [ ] **3.4** Device preview switcher with responsive canvas sizing
- [ ] **3.5** Left panel: Block palette (first 4 blocks: Navbar, Hero, Text, Footer)
- [ ] **3.6** Right panel: Inspector (renders props form for selected block)
- [ ] **3.7** Block selection (click to select, click canvas to deselect)
- [ ] **3.8** Block renderer (renders block components from JSON data)
- [ ] **3.9** Drag-to-reorder blocks (dnd-kit)
- [ ] **3.10** Add block by clicking in palette
- [ ] **3.11** Remove block (delete key + inspector button)
- [ ] **3.12** Undo/redo (keyboard shortcuts: Cmd+Z, Cmd+Shift+Z)
- [ ] **3.13** Auto-save (30s interval + dirty-state indicator)
- [ ] **3.14** Manual save button with loading state

**Phase 3 Complete When:** User can add, rearrange, and remove blocks and changes persist

---

### ✅ PHASE 4 — Core Blocks (8 blocks)
*Goal: Enough blocks to build a real landing page*

- [ ] **4.1** Navbar block — logo, nav links, CTA button, sticky option
- [ ] **4.2** Hero block — headline (editable), subtext, CTA button, bg options
- [ ] **4.3** Features block — 3-column layout, icon picker, editable text
- [ ] **4.4** Testimonials block — quote cards, author info
- [ ] **4.5** CTA Banner block — full-width, background color/image
- [ ] **4.6** Footer block — columns of links + social icons + copyright
- [ ] **4.7** Image block — upload, Unsplash picker, alt text, link
- [ ] **4.8** Text block — rich text (bold, italic, link, heading levels)

Each block requires: TypeScript props interface, inspector form, responsive variants, preview thumbnail

**Phase 4 Complete When:** User can build a complete, professional landing page

---

### ✅ PHASE 5 — AI Integration
*Goal: AI can generate a site and assist with content*

- [ ] **5.1** Anthropic SDK setup in API service layer
- [ ] **5.2** SSE streaming endpoint infrastructure
- [ ] **5.3** AI Site Generator: `/api/v1/ai/generate-site` (streaming)
- [ ] **5.4** "Generate with AI" flow in dashboard Create Site dialog
- [ ] **5.5** AI generation progress UI (streamed JSON → live preview)
- [ ] **5.6** AI Content Assistant endpoint: `/api/v1/ai/improve-content`
- [ ] **5.7** AI panel in editor (floating drawer, chat interface)
- [ ] **5.8** AI chat with editor context (knows current page structure)
- [ ] **5.9** AI action executor (AI can trigger: changeColor, updateText, addBlock)
- [ ] **5.10** AI SEO analyzer: score + suggestions

**Phase 5 Complete When:** User can describe a site and have AI generate a full draft

---

### ✅ PHASE 6 — Template Library
*Goal: Users can start from a polished template*

- [ ] **6.1** Template data structure + JSON store
- [ ] **6.2** 10 seed templates (2 per category: Business, Portfolio, Restaurant, SaaS, Event)
- [ ] **6.3** Templates gallery page with category filter
- [ ] **6.4** Template preview modal (full-screen, device switcher)
- [ ] **6.5** "Use Template" → fork all pages + blocks into new site
- [ ] **6.6** AI template recommendation (based on user prompt)

**Phase 6 Complete When:** User can browse, preview, and start from any template

---

### ✅ PHASE 7 — Media Manager
*Goal: Users can upload and manage images*

- [ ] **7.1** File upload endpoint (multipart, validation, local storage)
- [ ] **7.2** Media list API with pagination
- [ ] **7.3** Media manager panel (grid view, search, delete)
- [ ] **7.4** Unsplash API integration (search + insert)
- [ ] **7.5** Image optimization (resize on upload, WebP conversion)
- [ ] **7.6** AI alt text generation on upload

**Phase 7 Complete When:** User can upload, search, and insert images from any block

---

### ✅ PHASE 8 — Publishing & Preview
*Goal: Users can publish and share their site*

- [ ] **8.1** Published site renderer (reads JSON, renders blocks as HTML)
- [ ] **8.2** Subdomain routing (`*.buildr.app` → site lookup by subdomain)
- [ ] **8.3** Publish API endpoint (snapshot current pages to published version)
- [ ] **8.4** Publish button with confirmation dialog
- [ ] **8.5** Live preview (opens published URL in new tab)
- [ ] **8.6** Version history (store last 5 published snapshots)
- [ ] **8.7** Rollback to previous version
- [ ] **8.8** SEO tags in rendered output (meta, OG, sitemap)

**Phase 8 Complete When:** User can publish a site accessible via URL

---

### ✅ PHASE 9 — Polish & More Blocks (10 more blocks)
- Pricing, FAQ, Contact Form, Gallery, Video, Stats, Team, Countdown, Newsletter, Logo Cloud

---

### ✅ PHASE 10 — Analytics & SEO
- Analytics dashboard, SEO editor per page, AI SEO scorer

---

## DEVELOPMENT WORKFLOW

### Starting a New Phase
1. Read `MEMORY.md` — don't re-solve solved problems
2. Update `ROADMAP.md` — mark phase as "In Progress"
3. Write types/schemas first, then service, then routes, then UI
4. Run type-check (`pnpm typecheck`) before considering any task done

### Completing a Task
1. Test it manually (and with unit tests if logic is complex)
2. Update `MEMORY.md` if you hit and fixed a non-obvious problem
3. Check off the task in this prompt
4. Run `pnpm lint && pnpm typecheck` — fix all errors before moving on

### Code Quality Gates
- TypeScript strict mode — no `any` without a comment explaining why
- No unused imports
- All async functions have error handling
- All API routes validate input with Zod before processing
- All components have prop types (no inferred `any` from spread)

---

## ENVIRONMENT VARIABLES

```bash
# API (.env)
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
UNSPLASH_ACCESS_KEY=...
CORS_ORIGIN=http://localhost:3000
DATA_DIR=./data

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## QUALITY CHECKLIST (Run Before Each Phase Sign-Off)

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] All new routes have Zod input validation
- [ ] All new components have TypeScript prop types
- [ ] No hardcoded strings that should be constants/env vars
- [ ] MEMORY.md is up to date
- [ ] README.md reflects new setup steps if any added
- [ ] No `console.log` left in production code (use a logger)
- [ ] Accessibility: new UI elements are keyboard navigable
- [ ] Mobile: new UI works at 375px viewport

---

## BEGIN HERE — PHASE 0, TASK 0.1

Start with: **"Initialize the pnpm monorepo."**

Create the root `package.json`, `pnpm-workspace.yaml`, and the three package skeletons (`@buildr/types`, `@buildr/schemas`, `@buildr/utils`). Then scaffold the two apps.

After each task, tell me:
1. What you built
2. What decisions you made (and why)
3. What the next task is
4. Any risks or things I should know

Let's build something extraordinary.
