# Marang Archive

A unified discovery, cataloging, library, and reading-gateway platform for serialized digital works — manga, manhwa, manhua, webtoons, web novels, and light novels.

---

## What It Does

Marang Archive is a **personal aggregation and organization layer** over multiple external content sources. It does not host content. Instead, it:

- Searches across connected sources simultaneously and returns normalized, deduplicated results
- Maintains a source-independent catalog of series and chapters
- Lets you save series to a personal library with reading status tracking
- Tracks your progress at the chapter level
- Resolves the best available source when you want to read
- Detects new chapter releases for series you follow

The result is a single place to manage your entire reading list, regardless of which sources carry the content.

---

## Current Status

**Phase 1 (Backend Foundation) complete. Version 0.1.0.**

| Component | Status |
|-----------|--------|
| Documentation | ✅ Complete |
| Monorepo skeleton | ✅ Complete |
| Backend foundation | ✅ Complete |
| Database | ⬜ Not started |
| Source SDK | ⬜ Not started |
| First source adapter | ⬜ Not started |
| Search pipeline | ⬜ Not started |
| Catalog + matching | ⬜ Not started |
| Authentication | ⬜ Not started |
| Library + tracking | ⬜ Not started |
| Source resolution | ⬜ Not started |
| React Native app | ⬜ Not started |
| Updates + notifications | ⬜ Not started |

See `Tracker.md` for the living status dashboard.

---

## Architecture Overview

```
┌──────────────────────────────────┐
│         React Native App         │
│        (apps/mobile/)            │
└─────────────┬────────────────────┘
              │  HTTPS REST + JSON
              ▼
┌──────────────────────────────────┐
│           Marang API             │
│        (backend/src/api/)        │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│          Marang Core             │
│  Search · Catalog · Library      │
│  Tracking · Auth · Resolution    │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│        Source Registry           │
└───────┬──────────┬───────────────┘
        │          │
        ▼          ▼
   Adapter A   Adapter B  ...
        │          │
     Source A   Source B
```

**Core principle:** Marang Core is source-agnostic. Source-specific logic lives exclusively in adapter packages. The user's library references Marang's canonical catalog — never a source-specific ID.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (TypeScript) |
| Navigation | React Navigation v6 |
| Server state | TanStack Query |
| UI state | Zustand |
| Backend | Fastify + Node.js (TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| Validation | Zod |
| Monorepo | pnpm workspaces |
| Testing | Vitest + Supertest + React Native Testing Library |
| CI | GitHub Actions |

---

## Repository Structure

```
marang-archive/
├── apps/
│   └── mobile/              # React Native / Expo app
├── backend/
│   ├── src/
│   │   ├── api/             # HTTP routes and middleware
│   │   ├── auth/            # Authentication and tokens
│   │   ├── catalog/         # Canonical series records
│   │   ├── search/          # Search orchestration
│   │   ├── matching/        # Cross-source deduplication
│   │   ├── library/         # User library management
│   │   ├── tracking/        # Reading progress and history
│   │   ├── sources/         # Source registry
│   │   ├── resolution/      # Source resolution logic
│   │   ├── notifications/   # Notification records
│   │   ├── workers/         # Background jobs (BullMQ)
│   │   └── shared/          # Utilities, errors, logger, config
│   └── prisma/              # Schema and migrations
├── adapters/
│   └── [source-name]/       # One package per source adapter
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── validators/          # Shared Zod schemas
├── docs/                    # Architecture diagrams, ADRs
└── [documentation files]    # PRD, TRD, Design, Schema, etc.
```

---

## Local Development Setup

> Prerequisites: Node.js 20+, pnpm 9+, Docker Desktop

Verified as working in Phase 0:

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Start local services (PostgreSQL + Redis)
docker-compose up -d
```

The remaining commands below are the intended setup flow for the database and mobile app:

```bash
# 3. Copy environment template and fill in values
cp .env.example .env

# 4. Run database migrations
pnpm --filter backend db:migrate

# 5. Seed development data
pnpm --filter backend db:seed

# 6. Start the backend (health endpoint: /api/v1/health)
pnpm --filter backend dev

# 7. Start the mobile app (in a separate terminal)
pnpm --filter mobile start
```

---

## Development Workflow

1. Check `Tracker.md` for the current phase and next tasks.
2. Check `Memory.md` for key architectural decisions before starting.
3. Read `Rules.md` — especially architecture and security rules.
4. AI agents: follow `Agents.md` completely before touching code.
5. Work on a feature branch: `feature/short-description`.
6. Run `pnpm typecheck && pnpm lint && pnpm test` before merging.
7. Update `Tracker.md` after completing tasks.

---

## Testing

```bash
# All tests
pnpm test

# Backend only
pnpm --filter backend test

# Mobile only
pnpm --filter mobile test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

---

## Documentation Map

| Document | Purpose |
|----------|---------|
| `README.md` | This file. Project overview and setup. |
| `PRD.md` | Product requirements. What Marang is and why. |
| `TRD.md` | Technical requirements. How it works. Architecture decisions. |
| `Design.md` | UX architecture, screen specs, data flow diagrams. |
| `Schema.md` | Database schema. Prisma models. ER diagram. |
| `ImplementationPlan.md` | Phased development roadmap with acceptance criteria. |
| `Tracker.md` | Living dashboard. Current phase, progress, bugs, debt. |
| `Rules.md` | Development rules for code, architecture, security, git. |
| `Agents.md` | Instructions for AI coding agents working on this project. |
| `Memory.md` | Durable architectural decisions and open questions. |

---

## Legal and Ethical Boundaries

Marang Archive integrates only with external sources through officially permitted mechanisms — public APIs, licensed APIs, authorized feeds, or other explicitly permitted access methods.

Marang does not and will not:
- Host, proxy, or redistribute copyrighted content
- Bypass CAPTCHAs, DRM, paywalls, or authentication systems
- Violate any source's terms of service or access restrictions

All source adapters must document their integration mechanism and relevant usage restrictions. See `Rules.md §8` for the full legal and ethical requirements.
