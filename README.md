# BUILDR

> AI-powered SaaS website builder. Describe what you want, click to customize,
> publish in seconds.

A pnpm monorepo with a Next.js 16.2 web app, a Fastify 5 API, and shared
TypeScript packages. The data layer uses JSON files behind a repository
pattern so swapping to a real database later touches only one layer.

## Stack

| Area      | Choice                                                       |
| --------- | ------------------------------------------------------------ |
| Frontend  | Next.js 16.2 (App Router), React 19, Tailwind CSS 4          |
| State     | Zustand + TanStack Query                                     |
| Backend   | Fastify 5, Node 22+, TypeScript (ESM)                        |
| Validation| Zod (shared between frontend and backend)                   |
| AI        | Anthropic SDK — Claude Opus 4.8 (`claude-opus-4-8`)          |
| Store     | JSON files via repository pattern (DB-ready interfaces)      |
| Tooling   | pnpm workspaces, ESLint 9, Prettier, Husky                  |

## Prerequisites

- Node.js **22+** (tested on 24)
- pnpm **9+** (`corepack enable` or `npm i -g pnpm`)

## Setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Create env files from the examples
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 3. (Optional) enable git hooks — requires a git repo
git init        # if not already initialized
pnpm prepare    # installs Husky pre-commit hook

# 4. Start both apps in parallel
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4001 — health check at
  http://localhost:4001/api/v1/health

## Workspace layout

```
buildr/
├── packages/
│   ├── types/      @buildr/types   — shared TypeScript types
│   ├── schemas/    @buildr/schemas — Zod validation schemas
│   └── utils/      @buildr/utils   — pure helpers (slug, color, date, id)
└── apps/
    ├── web/        @buildr/web     — Next.js frontend
    └── api/        @buildr/api     — Fastify backend
```

## Scripts (run from the root)

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `pnpm dev`             | Start web + API together                     |
| `pnpm dev:web`         | Start only the web app                       |
| `pnpm dev:api`         | Start only the API                           |
| `pnpm build`           | Build packages then apps                     |
| `pnpm typecheck`       | Type-check every workspace package           |
| `pnpm lint`            | Lint every workspace package                 |
| `pnpm format`          | Format the repo with Prettier                |

## Project docs

- **`MEMORY.md`** — architectural decisions, bug fixes, conventions. Read first.
- **`ROADMAP.md`** — phase tracker.
- **`BUILDR_CLAUDE_CODE_PROMPT.md`** — full product spec and phase task lists.

## Conventions

- ESM throughout; relative imports use explicit `.js` extensions.
- Shared types/schemas are imported by both apps — never duplicate a type.
- The API calls the Anthropic SDK only through its service layer, never from
  routes directly.
- The default AI model is configured in one place: `apps/api/src/config/ai.ts`.
