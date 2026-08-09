# Rules.md — Development Rules
# Marang Archive

**Version:** 0.1.0
**Last Updated:** 2026-08-07

> These rules govern all development on Marang Archive — by the developer and by AI coding agents.
> They exist to prevent architectural drift, security issues, and maintainability debt.
> When a rule needs to change, update this file with a reason and date.

---

## Table of Contents

1. [Architecture Rules](#1-architecture-rules)
2. [Code Rules](#2-code-rules)
3. [Database Rules](#3-database-rules)
4. [API Rules](#4-api-rules)
5. [Security Rules](#5-security-rules)
6. [Testing Rules](#6-testing-rules)
7. [Git Rules](#7-git-rules)
8. [Legal and Ethical Rules](#8-legal-and-ethical-rules)

---

## 1. Architecture Rules

### A1 — Core is source-agnostic
The `backend/src/catalog`, `backend/src/library`, `backend/src/tracking`, `backend/src/auth`, and `backend/src/api` modules must never import from any source adapter package. Source access goes through `backend/src/sources/registry.ts` only.

### A2 — Source logic belongs in adapters
Any logic specific to how a particular external source works — its URL patterns, authentication method, data structure, error codes, pagination style — belongs inside the adapter package (`adapters/[source-name]/`). It must not leak into backend core modules.

### A3 — Clients communicate through the API only
The React Native app and any future web client must never call source adapters directly, import adapter packages, or replicate source-specific logic. All data flows through the Marang API.

### A4 — Library references canonical IDs
`LibraryEntry.seriesId` and `ReadingProgress.seriesId` must always reference `Series.id` (Marang-internal UUID). Never store an external source series ID in the library or progress tables.

### A5 — Module boundaries are enforced
Modules communicate through their exported service interfaces only. A module must not import another module's repository, database query, or internal implementation. See `Design.md §8.2` for the full dependency matrix.

### A6 — Modular monolith — no premature extraction
Do not split the backend into separate deployable services unless there is a demonstrated, specific reason. The modular monolith is the intended architecture.

### A7 — One source adapter per directory
Each source adapter is an independent workspace package in `adapters/[source-name]/`. Adapters do not share code with each other. Common utilities live in `packages/` only.

### A8 — Capabilities before calls
Before calling an adapter method, the calling code must check that the adapter declares the required capability. Missing capabilities must produce a clear error — never a runtime crash.

---

## 2. Code Rules

### C1 — TypeScript strict mode everywhere
All workspace packages use strict TypeScript. `"strict": true` in `tsconfig.base.json`. No `@ts-ignore`, no `any` without an explicit comment explaining why it is unavoidable.

### C2 — No implicit any
`noImplicitAny: true`. Every function parameter and return value is typed.

### C3 — Zod for runtime validation
All external inputs — API request bodies, query parameters, adapter responses, environment variables — are validated with Zod schemas at the boundary. Do not trust unvalidated external data inside the application.

### C4 — Prefer readable code over clever code
A verbose, clear implementation is preferable to a clever, compact one. Future readers (and AI agents) need to understand code at a glance.

### C5 — No unnecessary abstractions
Do not create a base class, factory, or interface for something that has only one implementation. Introduce abstractions when there is a concrete second use case.

### C6 — No magic strings
Use enums or const objects for values that appear in multiple places (e.g., `ReadingStatus`, `SourceCapability`, error codes). No inline string literals for typed domain values.

### C7 — Explicit over implicit
Prefer explicit function parameters over relying on global state or context threading. Configuration is injected; modules do not read `process.env` directly (use the config module).

### C8 — Error handling is required, not optional
Every function that can fail must either handle the failure or explicitly propagate a typed error. Swallowed exceptions are forbidden. `try/catch` blocks that catch and do nothing are forbidden.

### C9 — Shared utilities belong in packages
If a utility is needed by both frontend and backend, it goes in `packages/` — not duplicated. If it is backend-only, it goes in `backend/src/shared/`.

### C10 — No unrelated refactoring
When implementing a feature or fixing a bug, do not refactor code in unrelated files. Keep changes focused. Separate refactors are separate commits.

---

## 3. Database Rules

### D1 — All schema changes via Prisma migrations
No manual DDL against the database at any time. All changes are made in `prisma/schema.prisma` and applied with `prisma migrate dev` (local) or `prisma migrate deploy` (production).

### D2 — No destructive changes without data handling
Dropping a column, renaming a column, or changing a column's type requires a migration that handles existing data. Do not apply a breaking schema change without a plan for the existing rows.

### D3 — Migrations are committed
Migration files in `backend/prisma/migrations/` are committed to the repository and version-controlled. Never delete or modify an existing migration file.

### D4 — passwordHash is never returned
The `User.passwordHash` field must be excluded from every query result that flows to a service, API response, or any output. Use explicit `select` exclusions or a repository wrapper. This is a security invariant — never relax it.

### D5 — No raw SQL with user input
All queries that incorporate user-provided values must use Prisma's parameterized query mechanisms. Raw SQL is permitted for complex analytical queries only, with no user input interpolated.

### D6 — Indexes are migration-managed
Database indexes are defined in `prisma/schema.prisma` and applied via migration. Never add indexes directly via SQL or `psql`.

### D7 — Seed data is for development only
The `prisma/seed.ts` script creates test data for local development. It must never be run against a production database.

---

## 4. API Rules

### P1 — Consistent response envelope
All API responses use the standard envelope:
```json
{ "data": { ... } }                          // success
{ "data": [...], "meta": { ... } }           // paginated success
{ "error": { "code": "...", "message": "..." } }  // error
```
No bare objects, no bare arrays at the top level.

### P2 — Machine-readable error codes
Every error response includes a `code` string (e.g., `SERIES_NOT_FOUND`). HTTP status codes alone are insufficient. See `TRD.md §6.5` for the error code list.

### P3 — Validate all inputs
Every route has a Zod schema for its request body, query parameters, and path parameters. Validation failures return `400 VALIDATION_ERROR` with field-level details.

### P4 — Authentication is explicit
Routes that require authentication declare it explicitly via the auth middleware. There is no "default auth" assumption. Public routes are intentionally public; protected routes are intentionally protected.

### P5 — No source names in error messages
API error messages shown to the client must not mention specific source names (e.g., do not say "Source A failed"). Use generic language: "Some sources did not respond," "Content not available from connected sources."

### P6 — Pagination on all list endpoints
No endpoint returns an unbounded list. All list endpoints accept `page` and `pageSize` parameters and return `meta.total`.

### P7 — Versioning from the start
All routes are prefixed `/api/v1/`. When a breaking change is needed, `/api/v2/` is introduced. Do not make breaking changes to existing versioned routes.

### P8 — No internal implementation details in responses
API responses must not expose database field names, internal IDs of non-canonical entities, stack traces, file paths, or any other implementation detail.

---

## 5. Security Rules

### S1 — No secrets in the repository
Environment variables, API keys, database passwords, JWT secrets, and any other sensitive values must never appear in committed files — not in `.env`, not in comments, not in test fixtures, not anywhere. Use `.env.example` for key names only.

### S2 — Secure token storage on mobile
JWT refresh tokens must be stored in `expo-secure-store` (Keychain on iOS, Keystore on Android). Never use `AsyncStorage` for any security-sensitive value.

### S3 — JWT secrets meet minimum length
JWT signing secrets must be at least 32 characters of random entropy. Generated with a cryptographically secure method, stored in environment variables.

### S4 — argon2id for passwords
Use argon2id for password hashing. Do not use MD5, SHA-1, or unsalted hashing.

### S5 — HTTPS only
The API must be served over HTTPS in production. HTTP must be disabled or redirect to HTTPS at the infrastructure level.

### S6 — Rate limit public endpoints
The search endpoint and all unauthenticated endpoints must have IP-based rate limiting active. See `TRD.md §6.7` for limits.

### S7 — Sanitize external source data
Data received from source adapters is untrusted. It must be validated by the adapter's Zod schema before entering the application. Unknown fields are stripped. Long strings are truncated to defined limits.

### S8 — Least privilege database access
The production database user should have only the permissions required by the application (SELECT, INSERT, UPDATE, DELETE on application tables). No `CREATE TABLE`, `DROP`, or superuser access.

### S9 — No bypass of access controls
Authentication and authorization checks must never be conditionally bypassed for convenience, debugging, or testing in production code. Test-only bypasses are isolated to test utilities that never reach production.

### S10 — Dependency audit in CI
`pnpm audit` runs in CI and fails on high/critical severity vulnerabilities in production dependencies.

---

## 6. Testing Rules

### T1 — Test important logic, not implementation details
Tests assert behavior, not internal implementation. Testing that a function called another function is not a behavior test.

### T2 — Normalizers must have unit tests
Every source adapter normalizer must have unit tests covering: a successful full response, a response with missing optional fields, and a response with unexpected field types.

### T3 — Adapter tests use fixtures, not live network calls
Adapter unit tests run against recorded fixture responses. They never make real HTTP calls. Live integration tests exist separately and are opt-in (not run in standard CI).

### T4 — Auth flow has integration tests
The full register → login → refresh → logout cycle must be covered by an integration test against a real test database.

### T5 — Tests do not share mutable state
Each test cleans up after itself or runs in an isolated transaction. Tests must not depend on the order they run in.

### T6 — No testing `passwordHash` values in assertions
Tests must not assert the actual value of a hashed password. Test that login succeeds or fails; do not inspect the hash.

### T7 — Tests run in CI
`pnpm test` must pass in CI. Flaky tests must be fixed or explicitly quarantined — not ignored.

---

## 7. Git Rules

### G1 — Branch naming
```
feature/short-description      — new features
fix/short-description          — bug fixes
chore/short-description        — maintenance, deps, tooling
docs/short-description         — documentation only
```

### G2 — Commit message format
```
type: short description (50 chars max)

Optional body explaining why, not what. Wrap at 72 chars.
```
Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`

Examples:
```
feat: implement search service with parallel source fan-out
fix: exclude passwordHash from user queries
chore: add pnpm audit to CI workflow
docs: update TRD with source adapter error types
```

### G3 — Never commit to main directly
All work happens on a branch. Merge to main via pull request (even for a solo project — for a clean history and a point of review).

### G4 — Pull requests must pass CI
Do not merge a PR if CI is failing. Fix the failures first.

### G5 — No force pushes to main
`git push --force` to the main branch is forbidden. Use `--force-with-lease` on feature branches only when necessary to clean up history before merging.

### G6 — Keep PRs focused
One PR = one concern. A PR that adds a feature and refactors unrelated code is two PRs.

### G7 — Tag releases
Use semantic versioning tags (`v0.1.0`, `v0.2.0`, etc.) on the main branch when a meaningful milestone is reached (e.g., end of each implementation phase).

---

## 8. Legal and Ethical Rules

### L1 — Authorized integrations only
Every source adapter must use an officially permitted mechanism: a public API, a licensed API, an authorized data feed, or another explicitly permitted access method. Integration that relies on circumventing restrictions is forbidden.

### L2 — No CAPTCHA bypass
Marang must not implement or use any mechanism intended to bypass or defeat CAPTCHA systems.

### L3 — No DRM circumvention
Marang must not implement, use, or assist in circumventing any digital rights management (DRM) system.

### L4 — No paywall bypass
Marang must not route users around paywalls, subscription requirements, or access controls on any source.

### L5 — No robots.txt violations
Source adapters that use web-accessible endpoints must respect the source's `robots.txt` and any explicit crawling restrictions.

### L6 — Source restrictions are integration requirements
If a source's terms of service or API documentation restricts certain uses, those restrictions are treated as hard requirements — not optional guidelines. Document them in the adapter.

### L7 — No content redistribution
Marang does not store, cache, proxy, or redistribute copyrighted content (chapter images, novel text, etc.). Marang resolves where content is and hands the user off to the legitimate source.

### L8 — User data is private
User library data, reading history, and preferences are never sold, shared with third parties, or used for purposes other than operating the Marang service for that user.
