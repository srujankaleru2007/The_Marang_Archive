# Tracker.md — Living Project Dashboard
# Marang Archive

**Last Updated:** 2026-08-07
**Current Phase:** Phase 0 — Repository Foundation
**Overall Status:** Pre-development. Documentation foundation complete.

> This is a living document. Update it continuously as work progresses.
> Do NOT track progress in `ImplementationPlan.md` — that is a static specification.
> This file is the ground truth for current state.

---

## Current Phase

**Phase 0 — Repository Foundation**

Goal: A working, properly configured monorepo that every subsequent phase can build on.

See `ImplementationPlan.md §3` for full task list and acceptance criteria.

---

## Current Objective

Set up the monorepo skeleton: pnpm workspaces, root tsconfig, ESLint, Prettier, docker-compose for local Postgres + Redis, and initial git commit.

---

## In Progress

_Nothing in progress yet. Development has not started._

---

## Next

- [ ] Initialize pnpm workspace with `pnpm-workspace.yaml`
- [ ] Create root `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`
- [ ] Set up `docker-compose.yml` (Postgres 16 + Redis 7)
- [ ] Scaffold `packages/types` and `packages/validators` stubs
- [ ] Set up ESLint + Prettier
- [ ] First git commit

---

## Backlog

_Populated from `ImplementationPlan.md`. Only add items here when the phase above them is active or complete._

### Phase 1 — Backend Foundation
- [ ] Fastify server setup
- [ ] Pino logging
- [ ] Config loader (Zod-validated)
- [ ] Error class hierarchy
- [ ] Global error handler
- [ ] `GET /health` endpoint
- [ ] CORS + rate limiting plugins

### Phase 2 — Database
- [ ] Prisma install + schema
- [ ] Initial migration
- [ ] Prisma client singleton
- [ ] Seed script

### Phase 3 — Source SDK
- [ ] `packages/types` — source types
- [ ] `packages/types` — catalog types
- [ ] `packages/types` — user types
- [ ] `packages/types` — API response types
- [ ] Source error subclasses

### Phase 4 — Source Registry + First Adapter
- [ ] `SourceRegistry` implementation
- [ ] `SourceService` (DB-backed source records)
- [ ] First adapter: **[DECISION NEEDED — source not yet chosen]**

### Phase 5 — Search Pipeline
- [ ] `SearchService` with parallel fan-out
- [ ] `ResultNormalizer`
- [ ] `DeduplicationService`
- [ ] `GET /api/v1/search` route
- [ ] Redis search caching

### Phase 6 — Catalog + Matching
- [ ] `CatalogService`
- [ ] `MatchingService`
- [ ] `GET /api/v1/series/:id` route
- [ ] `GET /api/v1/series/:id/chapters` route
- [ ] `GET /api/v1/series/:id/sources` route

### Phase 7 — Authentication
- [ ] `AuthService` (register, login, refresh, logout)
- [ ] `UserService`
- [ ] `RefreshTokenRepository`
- [ ] Fastify auth middleware
- [ ] Auth API routes
- [ ] Mobile: `AuthStore`, `TokenStorage`
- [ ] Mobile: Login + Register screens

### Phase 8 — Library + Tracking
- [ ] `LibraryService` + routes
- [ ] `TrackingService` + routes
- [ ] History cap enforcement

### Phase 9 — Source Resolution
- [ ] `ResolutionService`
- [ ] `GET /api/v1/resolve/series/:id` route
- [ ] `GET /api/v1/resolve/chapter/:id` route

### Phase 10 — RN App Skeleton
- [ ] Expo app init
- [ ] Navigation shell (4 tabs + stacks)
- [ ] `ApiClient`
- [ ] Shared components stubs

### Phase 11 — Mobile: Search + Discovery
- [ ] `SearchScreen`
- [ ] `SearchResultsScreen`
- [ ] `SeriesDetailScreen`
- [ ] Chapter open flow

### Phase 12 — Mobile: Library + Tracking
- [ ] `LibraryScreen`
- [ ] `HomeScreen`
- [ ] `HistoryScreen`
- [ ] Continue reading flow

### Phase 13 — Updates + Notifications
- [ ] `update-check` worker
- [ ] `notification-dispatch` worker
- [ ] `source-health-check` worker
- [ ] `GET /api/v1/updates` route
- [ ] Home screen update feed wired

### Phase 14 — Testing + Hardening
- [ ] Full test coverage pass
- [ ] Security review
- [ ] Performance benchmarks

### Phase 15 — Deployment
- [ ] Hosting provider provisioned
- [ ] CI/CD pipeline
- [ ] Dockerfile
- [ ] EAS build configured
- [ ] First production deployment

---

## Completed

_Nothing completed yet._

---

## Blocked

_Nothing blocked yet._

> When adding a blocker, use this format:
> **[BLOCKED]** Short description — reason — what is needed to unblock

---

## Bugs

_No bugs yet. Development has not started._

> When adding a bug, use this format:
> **[BUG]** Short description — reproduction steps — suspected cause — severity (critical/high/medium/low)

---

## Technical Debt

_None yet._

> Add items here when a known shortcut was taken that needs revisiting.
> Format: **[DEBT]** What was done — why — what the proper fix is

---

## Architecture Decisions

_Decisions made during development (distinct from pre-design decisions in `Memory.md`)._

> Format:
> **[ADR-N]** Decision — Reason — Date

No ADRs recorded yet. See `Memory.md` for initial design-phase decisions.

---

## Ideas

_Unrefined ideas that are not yet requirements. Do not implement without adding to PRD and ImplementationPlan first._

- Keyboard shortcut support for web client (future)
- Series completion celebration UI moment
- "Similar series" section on Series Detail page (based on genre overlap — no ML needed)
- Export library as JSON / CSV
- Import library from AniList GraphQL API
- Source adapter plugin marketplace (very long-term, complex legal considerations)
