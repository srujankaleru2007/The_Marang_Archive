# TRD — Technical Requirements Document
# Marang Archive

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2026-08-07

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Client Architecture](#4-client-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [API Architecture](#6-api-architecture)
7. [Database Architecture](#7-database-architecture)
8. [Source Adapter Architecture](#8-source-adapter-architecture)
9. [Source Registry](#9-source-registry)
10. [Search Architecture](#10-search-architecture)
11. [Normalization Pipeline](#11-normalization-pipeline)
12. [Matching and Deduplication](#12-matching-and-deduplication)
13. [Canonical Catalog](#13-canonical-catalog)
14. [Library Architecture](#14-library-architecture)
15. [Reading Tracking](#15-reading-tracking)
16. [Source Resolution](#16-source-resolution)
17. [Background Jobs](#17-background-jobs)
18. [Caching](#18-caching)
19. [Authentication and Authorization](#19-authentication-and-authorization)
20. [Error Handling](#20-error-handling)
21. [Logging and Observability](#21-logging-and-observability)
22. [Testing Strategy](#22-testing-strategy)
23. [Security](#23-security)
24. [Performance](#24-performance)
25. [Deployment](#25-deployment)

---

## 1. System Architecture Overview

Marang Archive uses a layered architecture with strict boundaries between concerns.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS                              │
│                                                          │
│   React Native / Expo App        Future Web App          │
│         (apps/mobile)             (apps/web)             │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTPS / REST + JSON
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   MARANG API                             │
│              (backend/api)                               │
│   REST endpoints, request validation, auth middleware    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  MARANG CORE                             │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Search  │ │ Catalog  │ │ Library  │ │ Tracking  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Matching │ │Resolution│ │  Auth    │ │  Workers  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               SOURCE REGISTRY                            │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
           ▼              ▼              ▼
      Adapter A       Adapter B      Adapter C
           │              │              │
           ▼              ▼              ▼
        Source A       Source B       Source C
```

### Core Principle

> Marang Core is source-agnostic. Source-specific logic lives exclusively in adapters.

The API layer never imports adapter code directly. It calls Core services. Core services call the Source Registry. The Source Registry delegates to adapters.


---

## 2. Technology Stack

All decisions below are [PROPOSED] for a greenfield project. No existing code was found to constrain these choices.

### 2.1 Frontend — Mobile

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React Native | Cross-platform iOS + Android from one codebase |
| Toolchain | Expo (managed workflow initially) | Faster iteration, good DX, OTA updates, handles native config |
| Language | TypeScript | Type safety, better tooling, mandatory for this project |
| Navigation | React Navigation v6+ | De facto standard for React Native navigation |
| State | Zustand (lightweight) | Simple, typed, avoids Redux boilerplate for a personal project |
| Server state | TanStack Query (React Query) | Caching, background refetch, loading/error states |
| HTTP client | Axios or fetch (via TanStack Query) | [DECISION NEEDED] — either is fine; axios has better interceptors |
| Secure storage | expo-secure-store | Keychain/Keystore backed, required for JWT token storage |
| Image caching | expo-image | Built-in caching, better performance than stock Image |
| Styling | StyleSheet API + NativeWind (Tailwind for RN) | [PROPOSED] — NativeWind gives Tailwind ergonomics on RN |

### 2.2 Backend

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Runtime | Node.js (LTS) | Same language as frontend; large ecosystem; good async I/O for aggregation |
| Language | TypeScript | Mandatory; shared types possible between backend and frontend |
| Framework | Fastify | Fast, TypeScript-native, schema validation built in, lower overhead than Express |
| Architecture | Modular Monolith | Appropriate for a personal project; can extract modules later if needed |
| ORM | Prisma | TypeScript-first, excellent DX, migrations, type-safe queries |
| Database | PostgreSQL | Relational integrity for user/library/progress data; JSONB for flexible metadata |
| Cache | Redis | Source response caching, session/rate-limit state, job queues |
| Job queue | BullMQ (Redis-backed) | Update detection background jobs, retry logic, scheduling |
| Auth | JWT (access + refresh tokens) | Stateless, mobile-friendly |
| Password hashing | bcrypt or argon2 | [DECISION NEEDED] — argon2 preferred for new projects |
| Validation | Zod | Runtime validation + TypeScript inference; works in both backend and frontend |
| Testing | Vitest + Supertest | Fast, TypeScript-native, good for unit + integration |

### 2.3 Infrastructure [PROPOSED]

| Concern | Choice |
|---------|--------|
| Containerization | Docker + Docker Compose (local dev) |
| Hosting | [DECISION NEEDED] — Railway, Fly.io, or Render for a personal project |
| Database hosting | Managed PostgreSQL via hosting provider |
| Redis hosting | Managed Redis via hosting provider |
| CI | GitHub Actions |

### 2.4 Shared

| Concern | Choice |
|---------|--------|
| Monorepo tooling | pnpm workspaces | 
| Shared types package | `packages/types` — shared TypeScript interfaces |
| Shared validation package | `packages/validators` — Zod schemas usable on both ends |

> **[DECISION NEEDED]** Confirm monorepo tooling: pnpm workspaces vs Turborepo. For a personal project, plain pnpm workspaces may be sufficient without the added complexity of Turborepo.


---

## 3. Repository Structure

[PROPOSED] Monorepo layout:

```
marang-archive/
│
├── apps/
│   ├── mobile/              # React Native / Expo application
│   └── web/                 # Future web client (do not create yet)
│
├── backend/
│   ├── src/
│   │   ├── api/             # Route handlers, middleware, request/response shapes
│   │   ├── auth/            # Authentication: JWT, sessions, password hashing
│   │   ├── catalog/         # Canonical series, titles, authors, genres
│   │   ├── search/          # Search orchestration, result normalization
│   │   ├── matching/        # Deduplication and cross-source matching logic
│   │   ├── library/         # User library entries and management
│   │   ├── tracking/        # Reading progress, history, status
│   │   ├── sources/         # Source registry and adapter interface
│   │   ├── resolution/      # Source resolution logic
│   │   ├── notifications/   # Notification records and delivery
│   │   ├── workers/         # Background job definitions (BullMQ)
│   │   └── shared/          # Shared utilities, error types, base classes
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma schema
│   │   └── migrations/      # Database migration history
│   └── tests/
│
├── adapters/
│   └── [source-name]/       # One directory per source adapter
│       ├── src/
│       ├── tests/
│       └── package.json
│
├── packages/
│   ├── types/               # Shared TypeScript interfaces and enums
│   └── validators/          # Shared Zod schemas
│
├── docs/                    # Architecture diagrams, ADRs
│
├── .github/
│   └── workflows/           # CI definitions
│
├── docker-compose.yml       # Local dev services (Postgres, Redis)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
│
├── README.md
├── PRD.md
├── TRD.md
├── Design.md
├── Schema.md
├── ImplementationPlan.md
├── Tracker.md
├── Rules.md
├── Agents.md
└── Memory.md
```

> **[DECISION NEEDED]** Whether adapters live inside `backend/src/sources/adapters/` or as separate workspace packages in `adapters/`. Separate packages provide cleaner isolation and independent versioning. Recommend separate packages but confirm before scaffolding.


---

## 4. Client Architecture

### 4.1 Communication

The mobile app communicates with Marang exclusively through the REST API. It never calls source adapters, imports adapter code, or contains source-specific logic.

```
React Native App
      │
      │  HTTPS REST + JSON
      ▼
  Marang API
      │
      ▼
  Marang Core
      │
      ▼
 Source Adapters
```

### 4.2 Mobile App Module Structure [PROPOSED]

```
apps/mobile/src/
├── api/          # API client, typed request functions, error handling
├── auth/         # Login, register, token management
├── navigation/   # React Navigation stack and tab definitions
├── screens/      # One directory per screen
│   ├── Home/
│   ├── Search/
│   ├── SearchResults/
│   ├── SeriesDetail/
│   ├── ChapterList/
│   ├── Library/
│   ├── Updates/
│   ├── History/
│   └── Settings/
├── components/   # Shared reusable components
├── hooks/        # Custom hooks (data fetching, auth state, etc.)
├── store/        # Zustand stores (UI state, user preferences)
├── utils/        # Formatting, constants, helpers
└── types/        # App-local type extensions (re-exports from packages/types)
```

### 4.3 State Management

Two categories of state:

| Category | Tool | Examples |
|----------|------|---------|
| Server state | TanStack Query | Series data, search results, library entries, chapter lists |
| UI / local state | Zustand | Auth state, user preferences, navigation state |

Server state is not duplicated in Zustand. TanStack Query is the source of truth for anything fetched from the API.

### 4.4 Token Storage

JWT tokens must NOT be stored in AsyncStorage (unencrypted). Use `expo-secure-store` which maps to:
- iOS: Keychain Services
- Android: Android Keystore / EncryptedSharedPreferences

Access token stored in memory (or secure store). Refresh token in secure store only.

### 4.5 Network Error Handling

- TanStack Query handles retries for transient failures.
- Explicit error boundaries per screen to prevent full-app crashes.
- Offline state detected; UI communicates clearly when network is unavailable.
- Stale cache displayed with "offline" indicator where possible.


---

## 5. Backend Architecture

### 5.1 Modular Monolith

The backend is a single deployable unit with clearly bounded internal modules. Modules communicate through explicit service interfaces — not by directly importing each other's database queries or internal implementation.

```
backend/src/
│
├── api/           → HTTP layer only. Validates requests, calls services, formats responses.
├── auth/          → User identity, JWT issuance/verification, password management.
├── catalog/       → Canonical series records. The source-independent truth.
├── search/        → Orchestrates parallel source queries, normalizes, returns results.
├── matching/      → Determines if two source results represent the same canonical series.
├── library/       → User library entries. References catalog, not source IDs.
├── tracking/      → Reading progress, chapter read state, history.
├── sources/       → Source registry, adapter interface, source health.
├── resolution/    → Chooses the right source for a given user+series+chapter request.
├── notifications/ → Update records, notification queue entries.
├── workers/       → BullMQ job processors for background tasks.
└── shared/        → Error classes, logger, config, base types.
```

### Module boundary rule

A module may only:
- Call services from other modules via their exported service interface.
- Never import another module's internal database queries, repositories, or implementation details.
- Never reach into `sources/` or adapter code from within `catalog/`, `library/`, etc.

### 5.2 Request Lifecycle

```
HTTP Request
     │
     ▼
Fastify Router
     │
     ▼
Auth Middleware (verify JWT if required)
     │
     ▼
Request Schema Validation (Zod/Fastify schema)
     │
     ▼
Route Handler (api/ module)
     │
     ▼
Service Layer (catalog/, search/, library/, etc.)
     │
     ▼
Repository / Prisma
     │
     ▼
PostgreSQL
```

Source calls happen within Search and Resolution services, never at the API layer.


---

## 6. API Architecture

### 6.1 Style

REST with JSON. No GraphQL in MVP — adds complexity without sufficient benefit at this scale.

Base URL: `/api/v1`

### 6.2 Authentication

All user-specific endpoints require a Bearer JWT in the Authorization header.
Public endpoints (search, series detail) do not require authentication.

### 6.3 Endpoint Groups [PROPOSED]

```
Auth
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/password-reset/request
  POST   /api/v1/auth/password-reset/confirm

Search
  GET    /api/v1/search?q=...&type=...&page=...

Series (Catalog)
  GET    /api/v1/series/:id
  GET    /api/v1/series/:id/chapters
  GET    /api/v1/series/:id/sources

Library  [authenticated]
  GET    /api/v1/library
  POST   /api/v1/library
  GET    /api/v1/library/:seriesId
  PATCH  /api/v1/library/:seriesId
  DELETE /api/v1/library/:seriesId

Reading Progress  [authenticated]
  GET    /api/v1/progress/:seriesId
  PUT    /api/v1/progress/:seriesId/chapters/:chapterId
  DELETE /api/v1/progress/:seriesId

History  [authenticated]
  GET    /api/v1/history
  DELETE /api/v1/history

Updates  [authenticated]
  GET    /api/v1/updates

Resolution
  GET    /api/v1/resolve/series/:seriesId
  GET    /api/v1/resolve/chapter/:chapterId

User  [authenticated]
  GET    /api/v1/user/me
  PATCH  /api/v1/user/preferences
```

### 6.4 Response Format

All responses use a consistent envelope:

```json
// Success
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 }   // optional, for paginated responses
}

// Error
{
  "error": {
    "code": "SERIES_NOT_FOUND",
    "message": "Series with id 12345 was not found.",
    "details": {}   // optional additional context
  }
}
```

### 6.5 Error Codes

Errors use machine-readable string codes (not just HTTP status). Examples:

```
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_UNAUTHORIZED
SERIES_NOT_FOUND
SOURCE_UNAVAILABLE
SEARCH_NO_RESULTS
LIBRARY_ENTRY_EXISTS
VALIDATION_ERROR
INTERNAL_ERROR
```

### 6.6 Versioning

The `/v1` prefix is in place from the start. When breaking changes are needed, `/v2` is introduced alongside `/v1` until clients migrate.

### 6.7 Rate Limiting

- Public search endpoints: 30 requests/minute per IP.
- Authenticated endpoints: 120 requests/minute per user.
- Source resolution: 60 requests/minute per user.
- Implemented via Redis-backed rate limiter in Fastify middleware.


---

## 7. Database Architecture

### 7.1 Database: PostgreSQL

Rationale: Strong relational integrity for user/library/progress data. JSONB support for flexible source metadata. Mature, well-supported, widely hosted.

### 7.2 ORM: Prisma

- Schema-first with `prisma/schema.prisma`.
- All schema changes via migrations (`prisma migrate dev` locally, `prisma migrate deploy` in production).
- Direct SQL is permitted for complex queries but must be documented.
- Never modify the database schema outside of Prisma migrations.

### 7.3 High-Level Entity Relationships

See `Schema.md` for full field-level definitions. Summary:

```
User ──────────────── UserPreference
  │
  ├── LibraryEntry ── Series (canonical)
  │
  ├── ReadingProgress ── Chapter
  │
  └── ReadingHistory ── Series, Chapter

Series ─────────────── SeriesTitle (multiple)
  │                ─── Author (many-to-many)
  │                ─── Genre (many-to-many)
  │
  ├── Chapter
  │
  └── SourceMapping ── Source

Source ─────────────── SourceCapability
  └── SourceHealth
```

### 7.4 Key Design Decisions

- Library entries reference `Series.id` (Marang canonical ID), never a source-specific ID.
- `ReadingProgress` references `Series.id` and `Chapter.id` — both canonical.
- `SourceMapping` is the join between a canonical `Series` and an external source's ID.
- `Chapter` records are canonical; `SourceMapping` maps to source chapter IDs separately.
- JSONB used for `Series.metadata` to hold flexible source-provided data without schema changes.

### 7.5 Connection Pooling

Use PgBouncer or Prisma's built-in connection pool. Default pool size: 10 connections. Adjust based on deployment environment.

[DECISION NEEDED] Whether to use PgBouncer separately or rely on Prisma's pool for MVP.


---

## 8. Source Adapter Architecture

### 8.1 Core Principle

Each external source is wrapped in an adapter that:
- Implements the `SourceAdapter` interface.
- Declares its capabilities.
- Translates source-specific data into Marang's normalized models.
- Handles source-specific errors and translates them to Marang error types.
- Never leaks source-specific types or logic outside the adapter boundary.

### 8.2 SourceAdapter Interface [PROPOSED]

```typescript
interface SourceAdapter {
  readonly id: string;           // Unique source identifier, e.g. "source-a"
  readonly displayName: string;
  readonly capabilities: SourceCapabilitySet;

  // Search this source for series matching the query
  search(query: SearchQuery): Promise<SourceSearchResult[]>;

  // Get full series metadata for a source-specific series ID
  getSeries(sourceSeriesId: string): Promise<SourceSeriesResult>;

  // Get the chapter list for a source-specific series ID
  getChapters(sourceSeriesId: string): Promise<SourceChapterResult[]>;

  // Get a specific chapter's content/access URL
  // Only available if capabilities includes CHAPTER_CONTENT
  getChapter?(sourceChapterId: string): Promise<SourceChapterContent>;

  // Check whether the source is reachable and functioning
  healthCheck(): Promise<SourceHealthStatus>;
}
```

### 8.3 Capabilities

```typescript
enum SourceCapability {
  SEARCH         = "SEARCH",
  METADATA       = "METADATA",
  SERIES         = "SERIES",
  CHAPTERS       = "CHAPTERS",
  CHAPTER_CONTENT = "CHAPTER_CONTENT",
  COVER          = "COVER",
  UPDATES        = "UPDATES",
}

type SourceCapabilitySet = Set<SourceCapability>;
```

A source missing a capability must not cause errors in the core system. The Source Registry and Source Resolver must check capabilities before calling adapter methods.

### 8.4 Source Models vs Canonical Models

Adapters return **Source Models** — types prefixed with `Source*`. These are then passed to the Normalizer which produces **Canonical Models**.

```
Adapter returns:    SourceSeriesResult
Normalizer creates: Series (canonical)
```

Canonical models live in `packages/types`. Source models live inside each adapter package.

### 8.5 Error Handling in Adapters

Adapters must catch all source-specific errors and throw typed Marang errors:

```typescript
class SourceUnavailableError extends MarangError { ... }
class SourceTimeoutError extends MarangError { ... }
class SourceParseError extends MarangError { ... }
class SourceRateLimitError extends MarangError { ... }
```

The core system handles these errors without knowing the source-specific cause.

### 8.6 Adapter Configuration

Each adapter receives a configuration object at instantiation:
- Base URL (if configurable)
- API key or credentials (loaded from environment, never hardcoded)
- Timeout settings
- Rate limit settings

Configuration is injected; adapters do not read environment variables directly.


---

## 9. Source Registry

The Source Registry is the single point of access to all adapters from within Marang Core.

```typescript
interface SourceRegistry {
  // Get all registered adapters
  getAll(): SourceAdapter[];

  // Get adapters that support a specific capability
  getByCapability(capability: SourceCapability): SourceAdapter[];

  // Get a specific adapter by ID
  getById(sourceId: string): SourceAdapter | null;

  // Get current health of all sources
  getHealth(): Promise<Map<string, SourceHealthStatus>>;
}
```

### Registry Initialization

Adapters are registered at application startup. The registry is built from configuration — not discovered dynamically at runtime.

```typescript
const registry = new SourceRegistry([
  new SourceAAdapter(config.sourceA),
  new SourceBAdapter(config.sourceB),
]);
```

### Registry Access Rule

Only the following modules may access the Source Registry:
- `search/` — to fan out search queries
- `resolution/` — to resolve the best source for a request
- `workers/` — to check for updates
- `catalog/` — to refresh canonical metadata

The `library/`, `tracking/`, `auth/`, and `api/` modules must never import the Source Registry.


---

## 10. Search Architecture

### 10.1 Search Pipeline

```
User Query String
       │
       ▼
  Query Normalization
  (trim, lowercase, remove special chars, extract filters)
       │
       ▼
  Search Service
       │
       ▼
  Source Registry → getByCapability(SEARCH)
       │
       ▼
  Parallel Source Queries (Promise.allSettled)
  [Timeout: 5s per source]
       │
  ┌────┴────┐
  │         │
fulfilled  rejected
  │         │
  ▼         ▼
Source    Logged,
Results   Skipped
  │
  ▼
Per-Source Result Normalization
(SourceSearchResult → NormalizedSearchResult)
       │
       ▼
Matching / Deduplication
(group results that represent the same series)
       │
       ▼
Ranking
(title match score, source count, metadata completeness)
       │
       ▼
Catalog Upsert
(create/update canonical Series records for new results)
       │
       ▼
Paginated Unified Results
```

### 10.2 Parallelism and Fault Tolerance

- `Promise.allSettled` — all sources queried simultaneously; failures do not block others.
- Per-source timeout enforced via `AbortController` or `Promise.race` with a timeout promise.
- Failed sources are logged with error type and excluded from results.
- Response includes metadata about which sources responded and which failed.

### 10.3 Query Normalization

- Strip leading/trailing whitespace.
- Normalize Unicode (NFD → NFC).
- Remove excess punctuation for matching purposes.
- Detect and preserve meaningful tokens (author name patterns, year, type hints).

### 10.4 Result Caching

- Completed search results cached in Redis by normalized query string.
- TTL: 10 minutes (configurable).
- Cache keyed by: `search:{normalizedQuery}:{page}`.
- Cache is advisory — a cache miss triggers a live search.

### 10.5 Pagination

- Marang paginates its own results — not the underlying sources.
- Default page size: 20.
- Sources return up to their own maximum; Marang slices after deduplication.


---

## 11. Normalization Pipeline

Every piece of data received from an external source passes through a normalization step before it enters Marang's canonical model.

```
External Source Response
          │
          ▼
    Source Adapter
    (parses raw response, validates structure)
          │
          ▼
    Source Model (SourceSeriesResult, SourceChapterResult, etc.)
          │
          ▼
    Normalizer
    (maps source fields to canonical fields,
     applies defaults, cleans strings,
     resolves enumerations)
          │
          ▼
    Canonical Model (Series, Chapter, etc.)
```

### Normalization Responsibilities

- Map source-specific field names to canonical field names.
- Normalize title strings (trim, consistent Unicode).
- Map source-specific status values to `SeriesStatus` enum.
- Map source-specific content type to `ContentType` enum.
- Parse and normalize chapter numbers (handle volume prefixes, decimals, specials).
- Extract cover URL; mark as provisional if source CDN is external.
- Assign a canonical `contentType` (manga, manhwa, manhua, webtoon, webNovel, lightNovel, other).

### Normalizer Location

Each adapter contains its own normalizer for source-specific mappings. A shared `NormalizationUtils` module in `backend/src/shared/` provides common utilities (string normalization, enum mapping helpers) that all adapters can use.


---

## 12. Matching and Deduplication

When multiple sources return results for the same query, some results will represent the same real-world series. Marang must detect this and present a single deduplicated result.

### 12.1 Matching Signals (Priority Order)

| Signal | Weight | Notes |
|--------|--------|-------|
| Exact normalized title match | High | Most reliable |
| Alternative title overlap | High | Many series have romanized + native titles |
| Author name match + title proximity | Medium | Guards against title collisions |
| MAL/AniList/external ID match | High | If source provides external cross-references |
| Publication year match | Low | Supplementary signal |
| Content type match | Medium | manga ≠ novel of same name |

### 12.2 Matching Algorithm [PROPOSED — Deterministic]

Start with a deterministic, rule-based approach:

1. Normalize all titles (lowercase, remove punctuation, normalize Unicode).
2. Build an inverted index of normalized titles from all results.
3. Group results that share a normalized title OR a normalized alternative title.
4. Within each group, apply secondary signals (author, type, year) to confirm or split the group.
5. Each group becomes one canonical result with multiple `SourceMapping` entries.

Do not introduce ML-based similarity matching in MVP. Leave this as a documented future improvement.

### 12.3 Deduplication at Storage Level

When a new search result produces a canonical series that may match an existing catalog entry:

1. Check `SourceMapping` for an existing mapping with the same source + source series ID → definitive match.
2. Check normalized primary title + content type → probable match, flag for review.
3. No match → create a new canonical `Series` record.

Ambiguous matches are logged as `MatchCandidate` records for future resolution rather than automatically merged.

### 12.4 Limitations

- Title-only deduplication will have false positives (different series, same translated title).
- This is acceptable at MVP scale. Improve matching quality as the catalog grows.
- Mismatched canonical records can be manually corrected; the data model supports it.


---

## 13. Canonical Catalog

The catalog is Marang's source-independent representation of all known series.

### 13.1 Canonical Series Record

```
Series
├── id                    (Marang-internal UUID)
├── slug                  (URL-friendly identifier)
├── primaryTitle          (canonical display title)
├── titles[]              (all known titles including alternatives)
├── contentType           (manga | manhwa | manhua | webtoon | webNovel | lightNovel | other)
├── status                (ongoing | completed | hiatus | cancelled | unknown)
├── synopsis
├── coverUrl              (best available cover)
├── authors[]
├── artists[]
├── genres[]
├── tags[]
├── chapters[]            (canonical chapter list)
├── sourceMappings[]      (links to external source records)
└── metadata              (JSONB — flexible additional data)
```

### 13.2 Catalog Population

Catalog records are created or updated when:
1. A search query returns a new series not yet in the catalog.
2. A user opens a series detail page (refreshes metadata from source).
3. A background update job finds new chapters.
4. An explicit catalog refresh is triggered.

### 13.3 Catalog vs Source

The catalog holds the best available aggregated data. It does not try to stay perfectly in sync with all sources at all times. Freshness is maintained on-demand and through background jobs.

### 13.4 Cover Images

Cover URLs point to the source CDN. Marang does not proxy or host cover images in MVP. If a source CDN becomes unavailable, the cover simply fails to load — the catalog record remains intact.

[PROPOSED — Post-MVP] Consider storing cover images in an object store (S3-compatible) to remove dependence on source CDNs.


---

## 14. Library Architecture

### 14.1 Design

Library entries reference Marang's canonical `Series` record, not external source IDs. This ensures:
- Source going offline does not remove the library entry.
- User can switch preferred source without losing their library.
- Progress and status data remains stable across source changes.

### 14.2 Library Entry Structure

```
LibraryEntry
├── id
├── userId
├── seriesId          (→ canonical Series.id)
├── status            (reading | completed | onHold | planToRead | dropped)
├── preferredSourceId (optional override; null = use system resolution)
├── addedAt
└── updatedAt
```

### 14.3 Library Operations

| Operation | Description |
|-----------|-------------|
| Add | Create LibraryEntry for user + series |
| Update status | Change reading status |
| Remove | Delete entry; reading progress is retained by default |
| Get | Return entry with embedded series metadata and progress summary |
| List | Return all entries for user, with pagination and filtering |

### 14.4 Relationship to Progress

Library entries and reading progress are separate records. A user can have reading progress without a library entry (from history). The library entry stores status and preferences; progress is stored in `ReadingProgress`.


---

## 15. Reading Tracking

### 15.1 Progress Model

```
ReadingProgress
├── id
├── userId
├── seriesId
├── lastReadChapterId     (→ canonical Chapter.id)
├── lastReadAt
└── chapterReadState[]    → ChapterReadRecord

ChapterReadRecord
├── chapterId
├── readAt
└── (optional) progressPercent  [Post-MVP]
```

### 15.2 Tracking Operations

| Operation | Trigger |
|-----------|---------|
| Mark chapter read | User explicitly marks a chapter, or returns from source |
| Mark chapter unread | User explicitly unmarks |
| Mark all previous as read | Bulk convenience action |
| Update lastReadChapter | Whenever a chapter is opened via Marang resolution |

### 15.3 Continue Reading Logic

```
GET /api/v1/resolve/series/:seriesId

1. Load ReadingProgress for user + series
2. Find lastReadChapterId
3. Find the next chapter in the canonical chapter list (by chapter number)
4. If no progress: return first chapter
5. Run Source Resolution on the next chapter
6. Return resolved URL or source info
```

### 15.4 History

`ReadingHistory` records when a user accessed a series or chapter through Marang, regardless of library membership. It is a chronological event log, capped at 100 entries per user by default.

```
ReadingHistory
├── id
├── userId
├── seriesId
├── chapterId      (optional)
├── accessedAt
└── sourceId       (which source was used)
```


---

## 16. Source Resolution

Source resolution decides which source to use for a given series or chapter request.

### 16.1 Resolution Algorithm

```
Input: seriesId, chapterId (optional), userId (optional)

1. Load canonical Series and its SourceMappings
2. Filter to sources that are registered and have required capability
3. Filter out unhealthy sources (health status: UNHEALTHY)
4. If userId provided: check user's preferredSourceId for this series → promote to top
5. Score remaining sources:
   - Source health score (HEALTHY > DEGRADED)
   - Capability completeness (has CHAPTER_CONTENT > metadata-only)
   - Language match against user preference
   - Historical response time [future improvement]
6. Return top-ranked source with source-specific series/chapter IDs
```

### 16.2 Resolution Response

```typescript
interface ResolutionResult {
  sourceId: string;
  sourceSeriesId: string;
  sourceChapterId?: string;
  url?: string;            // Direct URL if source provides it
  capability: SourceCapability;
  fallbackAvailable: boolean;
}
```

### 16.3 Resolution Failures

If no viable source exists:
- Return `RESOLUTION_NO_SOURCE_AVAILABLE` error with context.
- Do not silently return an empty result.
- Client shows a clear "not available from connected sources" state.

### 16.4 Source Health

```typescript
enum SourceHealthStatus {
  HEALTHY   = "HEALTHY",
  DEGRADED  = "DEGRADED",   // Responding but with errors/slowness
  UNHEALTHY = "UNHEALTHY",  // Not responding or repeatedly failing
  UNKNOWN   = "UNKNOWN",    // Not yet checked
}
```

Source health is checked:
- By the health check background job (runs every N minutes).
- Proactively during a failed request (failure recorded, health degraded).
- Health state stored in Redis for fast access; persisted to DB for history.


---

## 17. Background Jobs

All background jobs run via BullMQ backed by Redis.

### 17.1 Defined Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `update-check` | Every 30–60 min (configurable) | For each series in any user's library with status "reading" or "following", check for new chapters |
| `source-health-check` | Every 10 min | Ping each registered source, update health status |
| `catalog-refresh` | On-demand + daily | Refresh metadata for catalog entries that are stale |

### 17.2 Job Design

- Jobs are idempotent where possible.
- Failures are retried with exponential backoff.
- Maximum retry count: 3 (configurable per job type).
- Failed jobs after max retries are moved to a dead-letter queue and logged.
- Jobs do not share state through global variables.
- Long-running jobs process in batches to avoid holding locks.

### 17.3 Update Check Flow

```
update-check job
  │
  ▼
Load series IDs with active library entries
  │
  ▼
For each series:
  Load SourceMappings
  For each HEALTHY source with CHAPTERS capability:
    getChapters(sourceSeriesId)
    Compare against stored Chapter records
    If new chapters found:
      Insert Chapter records
      Create Update record (seriesId, chapterId, discoveredAt)
  │
  ▼
Notifications worker picks up new Update records
→ Creates Notification records per user who follows the series
```


---

## 18. Caching

### 18.1 Cache Layer: Redis

Redis is the single caching layer. Cache is advisory — a cache miss triggers a live operation. A cache failure must never block a user request.

### 18.2 Cache Keys and TTLs

| Cache Item | Key Pattern | TTL |
|-----------|-------------|-----|
| Search results | `search:{normalizedQuery}:{page}` | 10 min |
| Series metadata | `series:{seriesId}` | 30 min |
| Series chapters | `series:{seriesId}:chapters` | 15 min |
| Source health | `source:{sourceId}:health` | 10 min |
| Resolution result | `resolve:{seriesId}:{userId}` | 5 min |

### 18.3 Cache Invalidation

- Library updates do not invalidate search cache (library is user-specific).
- New chapters discovered by update-check job invalidate `series:{seriesId}:chapters`.
- Source health changes invalidate `source:{sourceId}:health`.
- Explicit catalog refresh invalidates `series:{seriesId}`.

### 18.4 Mobile-Side Caching

TanStack Query handles mobile-side caching of API responses:
- `staleTime`: 5 minutes for series metadata; 1 minute for library.
- `gcTime` (cache time): 30 minutes.
- Background refetch on window focus (configurable — may be disabled to reduce source load).

---

## 19. Authentication and Authorization

### 19.1 Authentication Flow

```
Register:
  POST /auth/register { email, password }
  → bcrypt/argon2 hash password
  → create User record
  → return access token + refresh token

Login:
  POST /auth/login { email, password }
  → verify password hash
  → issue access token (15 min TTL) + refresh token (30 days TTL)
  → refresh token stored in DB (hashed)

Token Refresh:
  POST /auth/refresh { refreshToken }
  → verify refresh token against DB
  → issue new access token
  → optionally rotate refresh token

Logout:
  POST /auth/logout
  → invalidate refresh token in DB
```

### 19.2 Token Structure (JWT)

Access token payload:
```json
{
  "sub": "user-uuid",
  "iat": 1234567890,
  "exp": 1234568790,
  "type": "access"
}
```

No sensitive data in token payload. User details fetched from DB when needed.

### 19.3 Authorization

MVP has two levels:
- **Public**: Search, series detail, source health.
- **Authenticated user**: Library, progress, history, preferences, notifications.

There are no admin roles in MVP.

### 19.4 Mobile Token Storage

- Access token: In-memory (React state or Zustand). Clears on app close.
- Refresh token: `expo-secure-store` (Keychain / Keystore).
- On app open: If refresh token exists, silently obtain a new access token before rendering protected screens.


---

## 20. Error Handling

### 20.1 Error Classification

```typescript
// Base
class MarangError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
}

// Source errors
class SourceUnavailableError extends MarangError { }  // 503
class SourceTimeoutError extends MarangError { }       // 504
class SourceParseError extends MarangError { }         // 502
class SourceRateLimitError extends MarangError { }     // 429

// Domain errors
class NotFoundError extends MarangError { }            // 404
class ConflictError extends MarangError { }            // 409
class ValidationError extends MarangError { }          // 400
class UnauthorizedError extends MarangError { }        // 401
class ForbiddenError extends MarangError { }           // 403

// System errors
class InternalError extends MarangError { }            // 500
```

### 20.2 Error Handling Rules

- Source errors are caught at the adapter boundary and never propagate as raw exceptions.
- The API layer has a global error handler that maps `MarangError` subclasses to HTTP responses.
- Unexpected errors (not `MarangError`) are logged as critical and returned as `500 INTERNAL_ERROR` — no stack trace in response.
- Validation errors include field-level detail for the client to display.

### 20.3 Partial Failure in Search

When multiple sources are queried and some fail:
- Available results are returned.
- Response includes `meta.sourcesQueried`, `meta.sourcesFailed` with error codes.
- Client may surface a subtle indicator that not all sources responded.

---

## 21. Logging and Observability

### 21.1 Structured Logging

Use `pino` (fast, JSON-native) for backend logging.

Log levels:
- `error`: Unexpected failures, source errors, job failures.
- `warn`: Recoverable issues, source degradation, cache failures.
- `info`: Request lifecycle, job start/completion, source health changes.
- `debug`: Detailed flow tracing (disabled in production by default).

Every log entry includes:
- `timestamp`
- `level`
- `requestId` (for API requests — injected via Fastify request context)
- `module` (which module emitted the log)
- `message`
- `data` (structured context, no sensitive values)

### 21.2 What Not to Log

- Passwords, password hashes.
- JWT tokens or refresh tokens.
- Full request bodies that may contain credentials.
- User reading history in plain form.

### 21.3 Error Tracking [PROPOSED]

For a personal project, structured logs to stdout/file are sufficient initially. Post-MVP, consider Sentry (free tier) for error tracking and alerting.

### 21.4 Source Health Dashboard [Future]

A simple admin endpoint or log query showing source health over time would be valuable once multiple adapters exist.


---

## 22. Testing Strategy

### 22.1 Test Levels

```
Unit Tests          → Pure functions, normalizers, matching logic, utilities
Integration Tests   → Service layer with a real test database (Postgres in Docker)
Adapter Tests       → Each adapter tested against a mock/recorded source response
API Tests           → HTTP-level tests via Supertest
Mobile Tests        → Component tests via React Native Testing Library
E2E Tests           → Critical paths only (login → search → library → continue reading)
```

### 22.2 Test Priorities

| Area | Priority | Rationale |
|------|----------|-----------|
| Normalizers | Critical | Incorrect normalization corrupts the catalog silently |
| Matching logic | Critical | Wrong deduplication pollutes the library |
| Source adapters | Critical | Adapter bugs affect all users of that source |
| Auth (token flow) | Critical | Security boundary |
| Library operations | High | Core user value |
| Progress tracking | High | Core user value |
| Search pipeline | High | Primary user entry point |
| API endpoints | High | Contract validation |
| Resolution logic | High | Affects every content access |
| Background jobs | Medium | Tested via integration tests |
| Mobile components | Medium | Interaction and accessibility tests |

### 22.3 Test Infrastructure

- **Vitest** — test runner for backend and shared packages.
- **React Native Testing Library** — component testing for mobile.
- **MSW (Mock Service Worker)** — mock API calls in mobile tests.
- **Testcontainers** — spin up real Postgres + Redis for integration tests.
- **Test fixtures** — factories for User, Series, LibraryEntry, etc.

### 22.4 Adapter Testing

Each adapter must have:
- Tests with recorded (fixture) source responses to verify normalization.
- Tests for error paths: timeout, 404, malformed response, rate limit response.
- These tests do not make real network calls (fixtures only).

A separate optional integration test suite can test against a live source, clearly marked and not run in CI unless explicitly opted in.

---

## 23. Security

| Concern | Approach |
|---------|----------|
| Password storage | argon2id hashing [PROPOSED] |
| Token signing | JWT with HS256; secret from environment, minimum 32 chars |
| Token storage (mobile) | expo-secure-store; never AsyncStorage |
| Secrets management | Environment variables; never committed to repo |
| Input validation | Zod schemas at every API boundary |
| External data | Source responses validated before processing; unknown fields stripped |
| SQL injection | Prisma parameterized queries; no raw SQL with user input |
| HTTPS | Required for all traffic; enforce at deployment level |
| CORS | Explicitly configured; not wildcard in production |
| Rate limiting | Per-IP for public endpoints; per-user for authenticated |
| Dependency audit | `pnpm audit` run in CI |
| Source permissions | Adapters only use officially permitted mechanisms |

---

## 24. Performance

| Concern | Approach |
|---------|----------|
| Search latency | Parallel source queries; 5s per-source timeout; cached results |
| Database queries | Indexed on userId, seriesId, status; avoid N+1 with Prisma `include` |
| API response time | P95 target: < 500ms for cached; < 3s for uncached search |
| Image loading (mobile) | expo-image with caching; lazy loading in lists |
| List rendering (mobile) | FlashList (Shopify) for virtualized large lists |
| Concurrent source requests | `Promise.allSettled` parallelism; no sequential source queries |
| Background jobs | Batch processing; configurable concurrency limits |
| Redis | In-memory; failures gracefully bypass cache (never block request) |

---

## 25. Deployment

### 25.1 Local Development

```bash
docker-compose up       # starts Postgres + Redis
pnpm install            # install all workspace dependencies
pnpm db:migrate         # run Prisma migrations
pnpm dev                # start backend in watch mode
# mobile: cd apps/mobile && npx expo start
```

### 25.2 Production [PROPOSED]

| Component | Hosting |
|-----------|---------|
| Backend | Railway / Fly.io / Render (single container) [DECISION NEEDED] |
| PostgreSQL | Managed instance from hosting provider |
| Redis | Managed Redis from hosting provider |
| Mobile app | Expo EAS Build → App Store + Google Play |
| CI/CD | GitHub Actions |

### 25.3 Environment Variables

Required variables (never committed to repo):

```
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
ARGON2_PEPPER          (optional additional secret)
NODE_ENV
PORT
CORS_ORIGIN
# Per-adapter:
SOURCE_A_API_KEY       (if applicable)
SOURCE_A_BASE_URL      (if configurable)
```

### 25.4 Deployment Pipeline

```
Push to main
  → GitHub Actions
  → pnpm install
  → TypeScript compile check
  → pnpm test
  → pnpm lint
  → Docker build
  → Deploy to hosting provider
  → prisma migrate deploy (production migration)
```

[DECISION NEEDED] Whether to use Expo EAS for OTA updates or stick with full App Store builds. EAS provides faster iteration for non-native changes.
