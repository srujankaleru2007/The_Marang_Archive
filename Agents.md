# Agents.md — AI Coding Agent Instructions
# Marang Archive

**Version:** 0.1.0
**Last Updated:** 2026-08-07

> This file is the operating manual for AI coding agents working on Marang Archive.
> Read it completely before touching any code.
> It supplements `Rules.md` — both files apply.

---

## Table of Contents

1. [Before You Start Any Task](#1-before-you-start-any-task)
2. [Understanding the Architecture](#2-understanding-the-architecture)
3. [During Implementation](#3-during-implementation)
4. [After Implementation](#4-after-implementation)
5. [Working with Source Adapters](#5-working-with-source-adapters)
6. [Working with the Database](#6-working-with-the-database)
7. [Working with the API](#7-working-with-the-api)
8. [Working with the Mobile App](#8-working-with-the-mobile-app)
9. [What You Must Never Do](#9-what-you-must-never-do)
10. [Handling Uncertainty](#10-handling-uncertainty)
11. [Quick Reference Checklist](#11-quick-reference-checklist)

---

## 1. Before You Start Any Task

Complete every step below before writing or modifying any code.

### Step 1 — Read the current state
- Read `Tracker.md`. Know the current phase, current objective, what is in progress, what is blocked.
- Read `Memory.md`. Know the key architectural decisions already made.

### Step 2 — Read the relevant specification
- For product questions: read the relevant section of `PRD.md`.
- For technical questions: read the relevant section of `TRD.md`.
- For UX/screen questions: read `Design.md`.
- For data model questions: read `Schema.md`.
- For sequencing questions: read `ImplementationPlan.md`.

### Step 3 — Read the rules
- Read `Rules.md` completely if you have not already this session.
- Pay particular attention to the architecture rules (§1) and security rules (§5).

### Step 4 — Inspect the existing code
- Read the files you are about to modify or depend on.
- Check what modules already exist and how they are structured.
- Identify what utilities and types are already available. Do not reinvent them.

### Step 5 — Identify affected architecture
- Which modules does this task touch?
- Which module boundaries does this task cross?
- Check `Design.md §8.2` to confirm you are not violating a module dependency rule.
- If the task requires a new cross-module dependency that the rules do not permit, stop and ask before proceeding.

### Step 6 — Check open decisions
- Search for `[DECISION NEEDED]` in the relevant documents.
- If the task depends on an unresolved decision, do not invent an answer. Surface the decision to the developer.

---

## 2. Understanding the Architecture

These are the highest-priority architectural facts to internalize:

### The canonical series is sacred
The `Series` table is the source-independent truth about a work. `LibraryEntry` and `ReadingProgress` reference `Series.id`. Never reference an external source ID from user data tables.

### The adapter boundary is a hard wall
Code inside `backend/src/catalog/`, `backend/src/library/`, `backend/src/tracking/`, `backend/src/auth/`, and `backend/src/api/` must not import or call anything from `adapters/`. The only path to a source is: `api → service → sources/registry → adapter`.

### Canonical models vs source models
Adapters return `Source*` types (e.g., `SourceSearchResult`). These are converted to canonical models by the normalizer. Canonical models (e.g., `Series`, `Chapter`) are what flows through the rest of the system. Never pass a `Source*` type across a module boundary.

### The Source Registry is the gatekeeper
The only way to get an adapter instance from within backend code is `SourceRegistry.getById()` or `SourceRegistry.getByCapability()`. The registry is accessible from: `search/`, `resolution/`, `workers/`, and `catalog/` (for refresh). No other module touches it.

### Module communication is service-to-service
A module exposes a service class (e.g., `CatalogService`, `LibraryService`). Other modules call this service. They do not import the module's repository, database queries, Prisma calls, or internal helpers.

---

## 3. During Implementation

### Make minimal, focused changes
Change only what is necessary to complete the task. Do not refactor adjacent code, rename unrelated variables, or restructure unrelated files. If you notice a real problem elsewhere, note it in `Tracker.md §Technical Debt` — fix it separately.

### Reuse existing utilities
Before writing a utility function, check `backend/src/shared/`, `packages/types/`, and `packages/validators/`. Duplicate utilities create maintenance overhead.

### Preserve type safety
Do not use `any` to work around a typing problem. If you cannot express the correct type, stop and think about whether the design is right. `any` is a symptom of a design problem.

### Validate at boundaries
Every external input — API request bodies, query parameters, adapter responses — must go through a Zod schema. Validation happens at the boundary, not deep inside business logic.

### Write tests alongside code
Every new service function needs a test. Every new normalizer needs a test. Every new API route needs an integration test. Do not defer tests to "later."

### Follow the existing patterns
Look at how the codebase handles logging, errors, validation, and service structure. Follow those patterns. Introducing a new pattern requires justification.

### Log at the right level
- `logger.error()` — unexpected failures, things that need attention.
- `logger.warn()` — degraded state, recoverable issues.
- `logger.info()` — normal significant events (request handled, job completed).
- `logger.debug()` — verbose tracing for development only.
- Never log passwords, tokens, or personal data.

---

## 4. After Implementation

### Run the checks
After every code change, before reporting completion:
- `pnpm typecheck` — must produce zero errors.
- `pnpm lint` — must produce zero errors.
- `pnpm test` — all tests must pass.
- If tests fail that were passing before, your change broke something. Fix it.

### Review the changed files
Re-read every file you modified. Ask:
- Does this follow the architecture rules?
- Does this follow the security rules?
- Is there any `any` that needs replacing?
- Is there any unvalidated input?
- Is there any source-specific logic outside an adapter?
- Is there any secret or credential in the code?

### Update Tracker.md
- Mark completed tasks as done.
- Note any new decisions made in the `Architecture Decisions` section.
- Note any new technical debt discovered in the `Technical Debt` section.
- Note any new bugs found in the `Bugs` section.

### Update documentation if architecture changed
If your implementation required a meaningful deviation from the documented architecture:
- Update `TRD.md` with the actual approach used.
- Update `Schema.md` if any Prisma models changed.
- Update `Memory.md` if a new permanent architectural decision was made.
- Do not silently diverge from the documentation.

### Explain significant decisions
If you made a non-obvious technical choice, explain it in a code comment and in your task completion summary. Future agents (and the developer) need to understand why, not just what.

---

## 5. Working with Source Adapters

### One adapter = one workspace package
Create the adapter in `adapters/[source-name]/` as a separate pnpm workspace package. It has its own `package.json` and `tsconfig.json`.

### Implement the full interface
An adapter must implement the complete `SourceAdapter` interface from `packages/types`. Methods that are not supported by the source must still be declared — they should check the capability set and throw `CapabilityNotSupportedError`.

### Declare capabilities honestly
The `capabilities` property on the adapter must only include capabilities the adapter actually supports. Do not declare `CHAPTER_CONTENT` if the source does not provide it.

### Fixture-based testing is mandatory
Adapter tests must not make real network calls. Record real source responses as JSON fixtures and test against those. Place fixtures in `adapters/[source-name]/tests/fixtures/`.

### Test all error paths
For every adapter method, write tests for:
- A successful response
- A timeout (mock with a slow response fixture or `AbortController`)
- A 404 / not found response
- A malformed / unparseable response
- A rate limit response (HTTP 429)

### Never hardcode credentials
If the source requires authentication, load credentials from the injected config object. The adapter constructor receives config — it does not read `process.env` directly.

### Document the integration mechanism
Every adapter must have a comment block at the top of its main class file stating:
- What source this adapter integrates
- What access mechanism is used (public API, licensed API, etc.)
- Any terms of service or usage restrictions relevant to this integration
- The base URL(s) used

---

## 6. Working with the Database

### Use Prisma — always
All database access goes through the Prisma client singleton at `backend/src/shared/prisma.ts`. No raw `pg` queries unless there is a documented reason.

### Schema changes require migrations
If you need to add a column, add a table, or change a type:
1. Modify `prisma/schema.prisma`.
2. Run `prisma migrate dev --name descriptive_name`.
3. Commit the generated migration file.
4. Update `Schema.md` to reflect the change.

### Exclude passwordHash by default
When writing any query that returns a `User`, use an explicit `select` that excludes `passwordHash`. Build this into the repository layer so it cannot be accidentally returned.

### Avoid N+1 queries
When loading a list, use Prisma `include` to load related data in one query. Do not load a list and then issue N individual queries in a loop.

### Respect uniqueness constraints
Before inserting a record that has a unique constraint, handle the conflict path. Prisma will throw a `P2002` error on unique constraint violations — catch it and convert to a `ConflictError` at the service layer.

---

## 7. Working with the API

### Every route needs a schema
Define Zod schemas for the request body, query parameters, and path parameters before implementing the handler. Register the schema with Fastify. Do not parse request data manually.

### Use the response envelope
All responses use `{ data: ... }` for success and `{ error: { code, message } }` for errors. Never return a bare object or array from a route handler.

### Auth middleware is explicit
If a route requires authentication, attach the auth middleware to that route. Do not assume a route is protected because it is in a certain group or file.

### Return the right HTTP status
- `200` — success, existing resource returned
- `201` — success, new resource created
- `400` — validation error (bad input)
- `401` — not authenticated
- `403` — authenticated but not permitted
- `404` — resource not found
- `409` — conflict (e.g., library entry already exists)
- `429` — rate limited
- `500` — unexpected server error
- `503` — service unavailable (source unavailable)

### Never expose source names in errors
If a source fails, the error message returned to the client must not name the specific source. Use generic language. The source name belongs in server-side logs only.

---

## 8. Working with the Mobile App

### API calls go through ApiClient
Never use `fetch` or `axios` directly in a screen or component. All API calls go through the typed `ApiClient` in `apps/mobile/src/api/client.ts`.

### Server state lives in TanStack Query
Any data that comes from the API is managed by TanStack Query (`useQuery`, `useMutation`). Do not copy API data into Zustand or React state — TanStack Query is the cache and the source of truth for server state.

### UI state lives in Zustand
Authentication state, user preferences, UI toggles, and anything that is not server-fetched data lives in Zustand stores.

### Every screen needs all states
Before marking a screen complete, verify it handles:
- Loading state (skeleton or spinner)
- Empty state (meaningful message + CTA)
- Error state (message + retry)
- Success state (actual content)

Do not leave any of these as `null` renders or blank screens.

### Accessibility is required, not optional
Every interactive element must have:
- `accessibilityLabel` — describes what it is
- `accessibilityRole` — button, link, image, header, etc.
- `accessibilityHint` — optional, describes what will happen

Touch targets must be at minimum 44×44pt (iOS) and 48×48dp (Android). Use padding if needed.

### Tokens are never in AsyncStorage
If you are storing any token, credential, or security-sensitive value, it must go to `expo-secure-store`. If you see a token in `AsyncStorage`, that is a critical security bug — fix it immediately.

---

## 9. What You Must Never Do

These are absolute prohibitions. No exceptions, no workarounds, no special cases.

| # | Prohibition |
|---|------------|
| N1 | Commit any secret, API key, token, password, or credential to the repository |
| N2 | Store JWT tokens in AsyncStorage on mobile |
| N3 | Import an adapter package from any backend module outside of `sources/registry.ts` |
| N4 | Store an external source series ID in `LibraryEntry.seriesId` or `ReadingProgress.seriesId` |
| N5 | Return `User.passwordHash` in any API response |
| N6 | Implement any mechanism to bypass CAPTCHAs, DRM, paywalls, or authentication systems |
| N7 | Make real network calls in unit or standard CI tests |
| N8 | Apply a schema change to the database outside of a Prisma migration |
| N9 | Use `any` in TypeScript without a documented reason in a code comment |
| N10 | Make a breaking change to an existing API route without versioning |
| N11 | Log passwords, tokens, or personal data |
| N12 | Silently swallow exceptions with an empty `catch` block |
| N13 | Refactor code unrelated to the current task |
| N14 | Make sweeping architectural changes without reading `Memory.md` and `Rules.md` first |
| N15 | Invent an API endpoint that does not exist in `TRD.md §6.3` without documenting it |

---

## 10. Handling Uncertainty

### If the specification is unclear
Read the relevant PRD, TRD, and Design sections. If still unclear, make the simplest reasonable interpretation, implement it, and clearly document your interpretation in the code and in `Tracker.md`. Do not guess silently.

### If a design decision is unresolved
Look for `[DECISION NEEDED]` in the relevant document. Do not resolve a `[DECISION NEEDED]` yourself. Surface it to the developer with a concrete recommendation and wait.

### If your approach requires a deviation from the documented architecture
Stop. Document what you want to do and why. Explain the trade-off. Ask before deviating from the TRD, Schema, or ImplementationPlan.

### If you encounter a security concern
Stop immediately. Do not implement a workaround. Describe the concern explicitly. The developer must make the security decision.

### If you find existing code that violates Rules.md
Do not fix it silently as part of an unrelated task. Note it in `Tracker.md §Technical Debt`. Fix it in a separate, focused task.

---

## 11. Quick Reference Checklist

Use this checklist before and after every coding task.

### Before starting
- [ ] Read `Tracker.md` — current phase and objective clear
- [ ] Read `Memory.md` — key decisions internalized
- [ ] Read relevant specification sections
- [ ] Read `Rules.md` architecture and security sections
- [ ] Inspected existing code in affected files
- [ ] Identified all module boundaries crossed
- [ ] No `[DECISION NEEDED]` blocks are blocking this task

### After completing
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm test` — all tests pass, including pre-existing tests
- [ ] No `any` types without documented justification
- [ ] No secrets or tokens in any file
- [ ] `passwordHash` excluded from all User queries
- [ ] No source-specific logic outside adapter packages
- [ ] Library and progress reference canonical Series IDs
- [ ] All new public service functions have tests
- [ ] All new API routes have request validation schemas
- [ ] All new screens handle loading, empty, and error states
- [ ] `Tracker.md` updated with completed tasks and any new debt/decisions
- [ ] Documentation updated if architecture changed
