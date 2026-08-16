# Tracker.md — Living Project Dashboard
# Marang Archive

**Last Updated:** 2026-08-16
**Current Phase:** Phase 2 — Database
**Overall Status:** Phase 1 (Backend Foundation) complete. Fastify server and acceptance checks verified.

> This is a living document. Update it continuously as work progresses.
> Do NOT track progress in `ImplementationPlan.md` — that is a static specification.
> This file is the ground truth for current state.

---

## Current Phase

**Phase 2 — Database**

Goal: PostgreSQL connected, Prisma configured, full schema migrated, and a seed script available for local development.

See `ImplementationPlan.md §4` for full task list and acceptance criteria.

---

## Current Objective

Initialize Prisma and the database layer according to `Schema.md`.

---

## In Progress

_Phase 2 has not started yet._

---

## Next

- [ ] Install Prisma in `backend/`
- [ ] Create the Prisma schema and initial migration
- [ ] Add the Prisma client singleton
- [ ] Add the development seed script

---

## Backlog

_Populated from `ImplementationPlan.md`. Only add items here when the phase above them is active or complete._

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

### Phase 0 — Repository Foundation ✅ (2026-08-16)

- [x] Monorepo root directory structure created (`apps/`, `backend/`, `adapters/`, `packages/`, `docs/`)
- [x] `pnpm-workspace.yaml` with workspace definitions (`apps/*`, `backend`, `adapters/*`, `packages/*`)
- [x] Root `package.json` with workspace scripts (`dev`, `build`, `test`, `lint`, `typecheck`) — removed stray Vite/web-prototype deps
- [x] `tsconfig.base.json` with strict mode, target ES2022, module NodeNext
- [x] `packages/types` stub initialized (`@marang/types` — builds, typechecks)
- [x] `packages/validators` stub initialized (`@marang/validators` — builds, typechecks)
- [x] ESLint configured at root (TypeScript support, no-explicit-any enforced, empty-catch banned)
- [x] Prettier configured at root
- [x] `.gitignore` covering `node_modules`, `dist`, `.env*`, build artifacts, Expo local files
- [x] `docker-compose.yml` for local dev (PostgreSQL 16 + Redis 7) with healthchecks
- [x] `.env.example` with key names only — no values, no secrets
- [x] README local setup section updated to confirm Phase 0 works
- [x] Git repo initialized (initial commit created)

### Phase 0 Acceptance Criteria Status

- [x] `pnpm install` succeeds from repo root with no errors
- [~] `docker-compose up -d` starts Postgres + Redis — **config validated as valid YAML** (postgres:16-alpine, redis:7-alpine); could not run live because Docker is not installed on this machine
- [x] TypeScript compiles with zero errors across all workspace packages (`pnpm typecheck`, `pnpm build`)
- [x] ESLint runs without configuration errors (`pnpm lint`)
- [x] No secrets in `.env.example` — key names only

### Phase 1 — Backend Foundation ✅ (2026-08-16)

- [x] Initialized the `@marang/backend` workspace package with TypeScript scripts
- [x] Added Fastify, pino, Zod integration, CORS, rate limiting, Vitest, and development tooling
- [x] Added validated application configuration with clear startup errors
- [x] Added the `MarangError` hierarchy and global error response mapping
- [x] Added request ID correlation to structured logs and `x-request-id` responses
- [x] Added `GET /api/v1/health` returning `{ data: { status: "ok", timestamp } }`
- [x] Added configuration and API health tests

### Phase 1 Acceptance Criteria ✅

- [x] Live server returned `200` from `GET /api/v1/health`
- [x] Validation and unexpected errors use the documented response envelope
- [x] Unhandled errors return `500 INTERNAL_ERROR` without stack traces
- [x] Structured logs include request IDs and module context
- [x] TypeScript compilation, lint, and all 4 backend tests pass

---

## Blocked

_Phase 2 requires the services in `docker-compose.yml` to be running. Docker Desktop is not installed on the current machine — install Docker (or use an alternative container runtime) before starting the database phase._

> When adding a blocker, use this format:
> **[BLOCKED]** Short description — reason — what is needed to unblock

---

## Bugs

_No bugs yet._

> When adding a bug, use this format:
> **[BUG]** Short description — reproduction steps — suspected cause — severity (critical/high/medium/low)

---

## Technical Debt

- **[DEBT]** Package stub `clean` scripts originally referenced `rimraf` without declaring it as a dependency — replaced with a `node:fs` one-liner during Phase 0. A consolidated approach (e.g., `pnpm dlx rimraf`) may be considered later.

> Add items here when a known shortcut was taken that needs revisiting.
> Format: **[DEBT]** What was done — why — what the proper fix is

---

## Architecture Decisions

_Decisions made during development (distinct from pre-design decisions in `Memory.md`)._

> Format:
> **[ADR-N]** Decision — Reason — Date

- **[ADR-10]** Removed the stray Vite/React web prototype from the repo root — a leftover demo from before the documentation design was complete. It conflicted with the documented mobile-first architecture (PRD §6: no web client in MVP; TRD §3: only `apps/mobile`). Keeps Phase 0 scaffolding aligned with the specification. — 2026-08-16

No further ADRs recorded yet. See `Memory.md` for initial design-phase decisions.

---

## Ideas

_Unrefined ideas that are not yet requirements. Do not implement without adding to PRD and ImplementationPlan first._

- Keyboard shortcut support for web client (future)
- Series completion celebration UI moment
- "Similar series" section on Series Detail page (based on genre overlap — no ML needed)
- Export library as JSON / CSV
- Import library from AniList GraphQL API
- Source adapter plugin marketplace (very long-term, complex legal considerations)
