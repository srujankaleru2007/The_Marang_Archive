# Memory.md — Architectural Decisions and Constraints
# Marang Archive

**Version:** 0.1.0
**Last Updated:** 2026-08-16

> This file stores only **durable** information: architectural decisions, important assumptions, rejected alternatives, and major constraints.
>
> It is NOT a progress log. Progress lives in `Tracker.md`.
> It is NOT a specification. Specifications live in `PRD.md`, `TRD.md`, `Design.md`, `Schema.md`.
>
> Keep this file small and navigable. Every entry should be something that would change how a developer or AI agent approaches the codebase if they didn't know it.

---

## Format

Each entry uses:

```
### [ADR-N] Title
Decision: What was decided.
Reason: Why this decision was made.
Alternatives considered: What else was evaluated.
Trade-offs: What was given up.
Date: YYYY-MM-DD
Status: Active | Superseded by ADR-N
```

---

## Architectural Decisions

---

### [ADR-1] Modular Monolith over Microservices

**Decision:** The Marang backend is a modular monolith — a single deployable unit with clear internal module boundaries.

**Reason:** This is a personal project. Microservices would add deployment complexity, network overhead, distributed tracing requirements, and operational burden with no benefit at current scale. A well-structured monolith can be extracted into services later if there is a concrete reason.

**Alternatives considered:** Microservices (rejected — premature), serverless functions (rejected — poor fit for stateful adapter fan-out and background jobs).

**Trade-offs:** Modules share a process and a deployment unit. A severe bug in one module can affect the whole process. Mitigated by clear module boundaries and good error handling.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-2] Source-Agnostic Core with Pluggable Adapters

**Decision:** All source-specific logic lives in adapter packages (`adapters/[source-name]/`). The core backend modules (`catalog/`, `library/`, `tracking/`, `search/`, etc.) are completely source-agnostic. The only path from core to a source is through `sources/SourceRegistry`.

**Reason:** Sources are unreliable external dependencies. Their APIs change, their availability fluctuates, and new sources need to be added without touching core logic. Isolating source logic in adapters prevents source-specific concerns from corrupting the canonical data model and business logic.

**Alternatives considered:** Direct source calls inside search/catalog services (rejected — creates tight coupling), plugin system loaded at runtime (rejected — unnecessary complexity for a small number of known sources).

**Trade-offs:** Requires disciplined adherence to the adapter interface. More initial setup per new source. Worth it.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-3] Canonical Catalog as the Library Anchor

**Decision:** User library entries and reading progress reference Marang's canonical `Series.id`, not any external source ID.

**Reason:** External source IDs are fragile. A source can go offline, change its URL structure, remove content, or be removed from Marang entirely. If the library referenced source IDs, losing a source would corrupt user libraries. The canonical catalog insulates user data from source changes.

**Alternatives considered:** Storing source IDs in the library (rejected — fragile, source-dependent), using a composite key of multiple source IDs (rejected — complex and still fragile).

**Trade-offs:** Requires maintaining the canonical catalog with accurate `SourceMapping` records. A series that has no canonical record cannot be added to a library — which is a feature, not a bug.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-4] PostgreSQL + Prisma for Persistence

**Decision:** The primary data store is PostgreSQL, accessed exclusively via Prisma ORM. Redis is used for caching and job queues only — never for primary data storage.

**Reason:** PostgreSQL provides the relational integrity, foreign key constraints, and JSONB flexibility the schema requires. Prisma provides type-safe queries, migration management, and TypeScript-native DX. Redis is appropriate for ephemeral state (cache TTLs, job queues) but not for durable user data.

**Alternatives considered:** MongoDB (rejected — relational integrity is important for the library/progress/catalog model), SQLite (rejected — not suitable for a deployed server with multiple connections), Drizzle ORM (close second; Prisma chosen for migration tooling maturity).

**Trade-offs:** Prisma's generated client adds a build step. Schema changes require migration files. Both are acceptable trade-offs for a managed, type-safe schema.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-5] React Native + Expo as the Primary Client

**Decision:** The primary client is a React Native application using the Expo managed workflow (initially).

**Reason:** React Native enables iOS + Android from one codebase in TypeScript, sharing type definitions with the backend. Expo managed workflow reduces native configuration overhead, which is appropriate for a solo developer project. Expo EAS enables builds and OTA updates without a separate CI infrastructure.

**Alternatives considered:** Flutter (rejected — different language, no type sharing with backend), native iOS/Android (rejected — two codebases, too much overhead), web-only PWA (rejected — does not meet mobile-first goal).

**Trade-offs:** Expo managed workflow has limitations for some native APIs. If a hard native requirement emerges, the app can be ejected to a bare workflow. This is a known escape hatch, not a concern for MVP.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-6] Fastify over Express for the Backend HTTP Framework

**Decision:** The backend HTTP server is Fastify.

**Reason:** Fastify is TypeScript-native, has built-in schema validation integration, is significantly faster than Express, and has first-class plugin support for the concerns needed (CORS, rate limiting, auth). Express remains viable but requires more boilerplate for TypeScript type safety.

**Alternatives considered:** Express (rejected — weaker TypeScript integration, no built-in validation), Hono (considered — excellent performance and TypeScript support, but smaller ecosystem; Fastify is more established for Node.js servers), NestJS (rejected — heavy framework with significant opinionated structure that adds complexity for a personal project).

**Trade-offs:** Smaller community than Express. Plugin ecosystem is smaller but sufficient. TypeScript-first DX is worth it.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-7] BullMQ for Background Jobs

**Decision:** Background jobs (update detection, source health checks) run via BullMQ backed by Redis.

**Reason:** BullMQ provides reliable job queuing with retries, backoff, dead-letter queues, and scheduling. It uses Redis, which is already in the stack for caching. Alternatives would add another infrastructure component.

**Alternatives considered:** Node-cron with in-process execution (rejected — no retry, no dead-letter queue, jobs lost on restart), dedicated job queue service (rejected — unnecessary complexity for a personal project), Agenda (rejected — MongoDB-backed, adds another DB).

**Trade-offs:** Requires Redis to be available for background jobs to function. Redis is already required for caching, so this adds no new infrastructure.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-8] pnpm Workspaces as Monorepo Tooling

**Decision:** The monorepo uses pnpm workspaces without Turborepo or Nx.

**Reason:** For a project with a small number of packages, pnpm workspaces provide the necessary functionality (cross-package dependencies, shared scripts) without the complexity of a build orchestration tool. Turborepo or Nx can be added later if build performance becomes an issue.

**Alternatives considered:** Turborepo (deferred — adds build caching and parallelism, useful if build times grow; can be added later), Nx (rejected — heavyweight for a personal project), Lerna (deprecated in its original form; pnpm workspaces cover the same ground).

**Trade-offs:** No build caching between packages. Acceptable at current scale.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-9] JWT Access + Refresh Token Authentication

**Decision:** Authentication uses short-lived JWT access tokens (15 min) and long-lived refresh tokens (30 days) stored server-side (hashed) in the database.

**Reason:** Stateless access tokens are appropriate for mobile API authentication. Server-side refresh token storage allows revocation (logout invalidates the token). Storing only the hash means a leaked database does not expose live refresh tokens.

**Alternatives considered:** Session-based auth (rejected — stateful, less mobile-friendly), access tokens only (rejected — no revocation path), third-party auth service (deferred to post-MVP — adds external dependency).

**Trade-offs:** Refresh tokens in the database add a DB read on every refresh operation. At personal-project scale this is not a concern.

**Date:** 2026-08-07
**Status:** Active

---

### [ADR-10] No Web Client in MVP — Remove Stray Prototype

**Decision:** The repo root contained a stray Vite/React web prototype (a "personal archive" demo) predating the design phase. It was removed during Phase 0. The MVP ships the React Native app only; no web application exists.

**Reason:** PRD §6 explicitly excludes a web client from MVP scope. TRD §3 and ImplementationPlan reserve `apps/web` as future. The prototype's presence in the root conflicted with the documented monorepo structure (`apps/mobile` is the only app) and contaminated the root `package.json` with Vite/React dependencies and scripts.

**Alternatives considered:** Relocating the prototype into `apps/web/` (rejected — a half-built demo does not justify an app scaffold), leaving it in place (rejected — pollutes the workspace and violates documented structure).

**Trade-offs:** A working prototype demo was discarded. It was not committed to git and had no relationship to the documented architecture, so nothing of the planned product was lost.

**Date:** 2026-08-16
**Status:** Active

---

### [ADR-11] zod 3.25 + fastify-type-provider-zod v5, schemas from `zod/v4`

**Decision:** The backend pins `zod@^3.25.76` with `fastify-type-provider-zod@^5.1.0`. All Fastify route/response schemas are created with `import { z } from "zod/v4"` (the v4-compat subpath shipped by zod 3.25). Plain v3 `z` is used everywhere else (e.g., `shared/config.ts`).

**Reason:** The provider ≥5.x validates schemas with `instanceof $ZodType` against `zod/v4/core`. Schemas built from the regular v3 `z` do **not** pass that check and fail at serialization time with `FST_ERR_INVALID_SCHEMA`. Using the `zod/v4` import interops cleanly with the provider while staying on the zod 3.x line (matching `packages/validators`' `zod@^3.23.8`). The v4-native provider (7.x) requires zod 4, which would fork the workspace's zod major.

**Alternatives considered:** zod 4 + provider 7.x (rejected — splits the monorepo on zod major versions), provider 4.x with v3 schemas (rejected — does not support Fastify 5).

**Trade-offs:** Route schemas must import from `zod/v4`, which is a subtle source of confusion; a route that imports `z` from `zod` compiles fine but 500s at runtime. Worth the single zod major across the workspace.

**Date:** 2026-08-16
**Status:** Active

---

### [ADR-12] Phase 1 endpoint is `GET /api/v1/health` with data envelope

**Decision:** Phase 1 exposes `GET /api/v1/health` returning `200 { data: { status: "ok" } }`. No auth. Request IDs and structured logging come from Fastify 5's built-in `LogController`/pino `reqId` — no hand-rolled middleware.

**Reason:** `ImplementationPlan.md §4` names `GET /health`, but TRD §6.4 (response envelope) and §6.6 (`/v1` prefix for all routes) are authoritative. Fastify 5's error handler is `setErrorHandler` (the old `setErrorHandler` on the instance in pre-5 versions), and request IDs are native — adding custom middleware would duplicate framework behavior.

**Alternatives considered:** Bare `GET /health` (rejected — violates versioning), custom request-id middleware (rejected — Fastify already provides `reqId`).

**Trade-offs:** `/api/v1/health` is longer than the plan's `GET /health`; a deploy-time healthcheck URL is cosmetic and can be aliased later. No functional downside.

**Date:** 2026-08-16
**Status:** Active

---

## Important Assumptions

### [ASM-1] First Source Integration Mechanism
**Assumption:** At least one external source with a publicly accessible, permitted API or metadata feed exists and will be used for the first adapter.
**Risk:** If no suitable permitted source exists, the MVP cannot be demonstrated with real data. A mock adapter can be used for development but must be clearly identified as synthetic.
**Resolution needed:** Before Phase 4, identify and document the first source with its access mechanism in this file.

---

### [ASM-2] Single Developer Operation
**Assumption:** Marang Archive is operated by a single developer for personal use. Multi-tenancy, team collaboration, and enterprise concerns are out of scope.
**Impact:** Architecture and operational complexity is calibrated for one developer maintaining and running this system. Do not add features or infrastructure suited for a team-operated SaaS product.

---

### [ASM-3] No Content Hosting
**Assumption:** Marang will never host, proxy, or store chapter content (images, text). It is a gateway and organizer only.
**Impact:** No CDN, no media storage, no content delivery infrastructure. Cover images link to source CDNs. Chapter reading happens on the source.

---

## Rejected Alternatives Log

| # | Alternative | Rejected For | Date |
|---|-------------|--------------|------|
| R1 | Microservices architecture | Premature complexity for a personal project | 2026-08-07 |
| R2 | MongoDB as primary database | Relational integrity needed for library/progress model | 2026-08-07 |
| R3 | Express as HTTP framework | Weaker TypeScript DX vs Fastify | 2026-08-07 |
| R4 | Flutter for mobile | Different language, no type sharing with backend | 2026-08-07 |
| R5 | NestJS backend framework | Too opinionated and heavy for a personal project | 2026-08-07 |
| R6 | GraphQL API | Adds complexity without sufficient benefit at this scale | 2026-08-07 |
| R7 | Source IDs in library table | Fragile — source changes corrupt user data | 2026-08-07 |
| R8 | AsyncStorage for tokens | Insecure — unencrypted on device | 2026-08-07 |

---

## Open Decisions (requiring developer input)

| # | Decision | Context | Document |
|---|----------|---------|----------|
| OD-1 | Which source to implement first | Must be a permitted integration; determines Phase 4 | TRD §4, ImplementationPlan §7 |
| OD-2 | argon2 vs bcrypt for password hashing | argon2id preferred for new projects; confirm | TRD §2.2 |
| OD-3 | Adapter packages in `adapters/` vs `backend/src/sources/adapters/` | Separate packages give better isolation | TRD §3 |
| OD-4 | Backend hosting provider | Railway, Fly.io, or Render for personal project | TRD §2.3 |
| OD-5 | Expo EAS Build vs bare workflow | EAS is simpler; bare needed for specific native modules | TRD §2.1 |
| OD-6 | Merge Author and Artist into single Person table | Separate is simpler at MVP; merge if overhead is low | Schema §4.7 |

> When a decision above is made, move it to the Architecture Decisions section above and remove it from this table.
