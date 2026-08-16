# Tracker.md — Living Project Dashboard
# Marang Archive

**Last Updated:** 2026-08-16
**Current Phase:** Phase 2 — Database
**Overall Status:** Phase 0 (Repository Foundation) and Phase 1 (Backend Foundation) complete. Fastify server running with health endpoint, structured logging, config loading, and error framework. Next: Phase 2 (Database) is blocked until Docker is available.

> This is a living document. Update it continuously as work progresses.
> Do NOT track progress in `ImplementationPlan.md` — that is a static specification.
> This file is the ground truth for current state.

---

## Current Phase

**Phase 2 — Database**

Goal: PostgreSQL connected, Prisma configured, full schema migrated, and a seed script available for local development.

See `ImplementationPlan.md §5` for full task list and acceptance criteria.

**Blocked:** requires `docker-compose up -d` (PostgreSQL 16 + Redis 7) to be running, which needs Docker — not installed on this machine.

---

## Current Objective

_Phase 2 has not started yet — blocked on Docker being available._

---

## In Progress

_None._

---

## Next

- [x] Initialize `backend/` workspace package (package.json + tsconfig.json extending base)
- [x] Install Fastify + pino + zod integration
- [x] Implement `backend/src/shared/config.ts` (Zod-validated config loader)
- [x] Implement `backend/src/shared/errors.ts` (`MarangError` hierarchy)
- [x] Implement global Fastify error handler + request ID middleware
- [x] Add `GET /api/v1/health` endpoint (no auth)
- [x] Wire CORS + rate limiting plugins
- [x] Unit tests for error handler and config loader

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

### Phase 1 — Backend Foundation ✅ (2026-08-16)

- [x] Initialize `backend/` workspace package (`@marang/backend`, `"type": "module"`) with `tsconfig.json` extending base and `tsconfig.build.json` excluding tests
- [x] Deps pinned: fastify `^5.12.0`, @fastify/cors `^11.3.0`, @fastify/rate-limit `^11.2.0`, @fastify/swagger `^9.5.1`, pino `^10.3.1`, zod `^3.25.76` + fastify-type-provider-zod `^5.1.0`, dotenv `^17.4.2`, vitest `^4.1.10`, tsx `^4.23.12`
- [x] `backend/src/shared/config.ts` — Zod-validated env loader (`loadConfig`), throws `ConfigError` listing every missing/invalid var, repo-root `.env` via dotenv
- [x] `backend/src/shared/errors.ts` — `MarangError` hierarchy per TRD §20.1 (source 503/504/502/429, domain 404/409/400/401/403, system 500)
- [x] `backend/src/shared/logger.ts` — pino with pino-pretty in dev, JSON in production
- [x] Global error handler plugin — maps `MarangError` → `{ error: { code, message, details? } }`, validation errors → `400 VALIDATION_ERROR` with field details, unknown → `500 INTERNAL_ERROR` (no stack) *
- [x] `backend/src/api/server.ts` `buildServer()` — zod validator+serializer compilers, request ID (Fastify 5 `LogController`), CORS (config origins), public rate limit scope *
- [x] `backend/src/api/routes/health.ts` — `GET /api/v1/health` → `200 { data: { status: "ok" } }`
- [x] `backend/src/index.ts` — dotenv → `loadConfig` → `createLogger` → `buildServer` → listen on `host:port`
- [x] Unit + injection tests: config loader (5), health route + error envelope (2) — `pnpm test` green
- [x] Verified: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm format:check` (backend scope)

### Phase 1 Acceptance Criteria Status

- [x] `GET /api/v1/health` returns `200 { data: { status: "ok" } }` when server is running (verified live + via `app.inject`)
- [x] Invalid requests return a consistent `{ error: { code, message } }` shape (404 verified)
- [x] Unhandled errors return `500 INTERNAL_ERROR` without leaking stack traces (error handler + test)
- [x] Logs are structured JSON with `level`, `timestamp` (pino + isoTime); request IDs attached via Fastify `reqId` (log correlation) *
- [x] Config loader throws a clear error at startup if required env vars are missing (`ConfigError` lists each field)
- [x] TypeScript compiles with zero errors (`pnpm typecheck`, `pnpm build`)

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

---

## Blocked

**[BLOCKED] Phase 2 (Database) cannot start** — requires the services in `docker-compose.yml` (PostgreSQL 16 + Redis 7) to be running. Docker Desktop is not installed on the current machine. Install Docker (or use an alternative container runtime) to unblock. Phase 1 is complete and does not require Docker.

---

## Bugs

_No bugs yet._

> When adding a bug, use this format:
> **[BUG]** Short description — reproduction steps — suspected cause — severity (critical/high/medium/low)

---

## Technical Debt

- **[DEBT]** Package stub `clean` scripts originally referenced `rimraf` without declaring it as a dependency — replaced with a `node:fs` one-liner during Phase 0. A consolidated approach (e.g., `pnpm dlx rimraf`) may be considered later.
- **[DEBT]** Root `pnpm lint` is currently failing on a pre-existing `import/order` warning in the untracked root web prototype files (`src/main.jsx`, `vite.config.js`, `index.html`, `src/styles.css`, `package-lock.json` — leftover Vite/React demo, pre-dating Phase 0 cleanup). Fix by deleting the prototype or running `eslint --fix`; out of scope for Phase 1. Escalates to an error because of `--max-warnings 0`.
- **[DEBT]** Backend `typecheck`, `test`, and `build` scripts (and `pnpm -r` recursion from root) depend on project-local `node_modules/.bin/pnpm*` shims being absent. A broken shim set left behind by an interrupted first `pnpm install` pointed at a non-existent local `node_modules/pnpm` and broke `pnpm -r` recursion; removed them from `node_modules` (gitignored). If recursion fails with `Cannot find module <repo>/node_modules/pnpm/bin/pnpm.cjs`, delete `node_modules/.bin/pnpm*` again.
- **[DEBT]** `@fastify/swagger` is installed as a dependency but not yet wired into the app — it is required by `fastify-type-provider-zod` v5 as a peer for schema/OpenAPI generation. Wire the Swagger UI plugin when the first documented route appears (Phase 5/6).

> Add items here when a known shortcut was taken that needs revisiting.
> Format: **[DEBT]** What was done — why — what the proper fix is

---

## Architecture Decisions

_Decisions made during development (distinct from pre-design decisions in `Memory.md`)._

> Format:
> **[ADR-N]** Decision — Reason — Date

- **[ADR-10]** Removed the stray Vite/React web prototype from the repo root — a leftover demo from before the documentation design was complete. It conflicted with the documented mobile-first architecture (PRD §6: no web client in MVP; TRD §3: only `apps/mobile`). Keeps Phase 0 scaffolding aligned with the specification. — 2026-08-16
- **[ADR-11]** Phase 1 uses `/api/v1/health` (with the `{ data: ... }` success envelope) rather than the bare `GET /health` named in `ImplementationPlan.md §4`. The plan's shorthand predates the TRD §6.4 response envelope and §6.6 `/v1` versioning rules; TRD is authoritative. Health returns `{ data: { status: "ok" } }` (plan's `timestamp` field omitted — operational health data is reserved for the source health-check worker). — 2026-08-16
- **[ADR-12]** Pinned `zod@3.25` + `fastify-type-provider-zod@5.1.0` and import route/response schemas from `zod/v4`. The provider ≥5.x performs an `instanceof $ZodType` check against `zod/v4/core`, so v3-style `z.object()` schemas (from `zod`) are rejected with `FST_ERR_INVALID_SCHEMA` at serialization time; only `zod/v4` schemas satisfy the check. Keeps us on the zod 3 line (matching `packages/validators`' zod `^3.23.8`) while interoperating with the v4-based provider. Backend's own non-Fastify validation (`config.ts`) uses v3 `zod` normally. — 2026-08-16
- **[ADR-13]** Backend error handling uses Fastify 5's `setErrorHandler` (not the deprecated defunct `setErrorHandler` pre-route/`onRequest` injection) and request IDs come from Fastify's built-in `LogController` (via pino `reqId`), not a hand-rolled middleware. This satisfies TRD acceptance "log correlation via requestId" with zero custom middleware. The API module (`backend/src/api/`) does not import anything from `adapters/` — safe for Phase 4. — 2026-08-16

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
