con tinue# PRD — Product Requirements Document
# Marang Archive

**Version:** 0.1.0
**Status:** Draft
**Last Updated:** 2026-08-07

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [User Needs](#4-user-needs)
5. [Product Goals](#5-product-goals)
6. [Non-Goals](#6-non-goals)
7. [Core User Journeys](#7-core-user-journeys)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [MVP Definition](#10-mvp-definition)
11. [Post-MVP](#11-post-mvp)
12. [Future / Speculative](#12-future--speculative)
13. [Success Criteria](#13-success-criteria)

---

## 1. Product Vision

Marang Archive is a **unified discovery, cataloging, library, tracking, and reading-gateway platform** for serialized digital works — manga, manhwa, manhua, webtoons, web novels, and light novels.

The core promise:

> Find any serialized work across connected sources, save it to a personal library, track reading progress, and continue from exactly where you stopped — all from a single application.

Marang does not host content. It acts as an **aggregation, discovery, and organization layer** on top of permitted external sources, normalizing their data into a consistent catalog that belongs entirely to the user.

---

## 2. Problem Statement

Readers of serialized digital works currently face a fragmented landscape:

- Works are spread across many sources with no consistent interface.
- There is no single place to track what you are reading, have read, or want to read.
- Switching between sources breaks reading continuity.
- Chapter updates are discovered by manually revisiting each source.
- Personal libraries are tied to individual source accounts and cannot be unified.
- The same series often exists on multiple sources with varying quality, completeness, or language availability, with no way to compare or switch.

The result is high cognitive overhead for a leisure activity. Readers maintain mental models and external lists to manage something that should be automatic.

Marang Archive solves this by acting as the single organizational layer over a user's entire serialized-works reading life.

---

## 3. Target Users

### Primary User

**The active serialized-works reader.**

- Reads multiple series simultaneously across multiple genres.
- Uses multiple sources, often because no single source has everything.
- Wants to track progress without maintaining manual lists.
- Expects mobile-first access since reading happens on phones.
- Values a clean, fast interface over feature density.

### Secondary User

**The discovery-oriented browser.**

- Explores new works by genre, author, or trending titles.
- Does not necessarily read actively but wants to save works for later.
- Occasionally checks on dormant series for updates.

### Out of Scope

- Users who want Marang to host or serve content directly.
- Users requiring social features (follows, friend activity feeds, community reviews) — these are post-MVP at earliest.
- Institutional or commercial use cases.

---

## 4. User Needs

| # | Need | Priority |
|---|------|----------|
| N1 | Search for any serialized work and get results aggregated from connected sources | Critical |
| N2 | See where a work is available and open it through Marang | Critical |
| N3 | Save a work to a personal library without being tied to a specific source | Critical |
| N4 | Track reading status per series (Reading, Completed, On Hold, Plan to Read, Dropped) | Critical |
| N5 | Resume reading from the last read chapter with a single tap | Critical |
| N6 | Track progress at the chapter level | Critical |
| N7 | Discover when new chapters are available for followed series | High |
| N8 | Browse series details: titles, authors, genres, synopsis, cover, chapter list | High |
| N9 | View reading history | High |
| N10 | Manage preferences per series (preferred source, language) | Medium |
| N11 | Search within library | Medium |
| N12 | Browse/discover new works by genre or category | Medium |
| N13 | Receive notifications for new chapters on followed series | Medium |
| N14 | Mark individual chapters as read/unread | Medium |
| N15 | See chapters read count and completion percentage | Low |

---

## 5. Product Goals

### G1 — Unified Search
A user can search for any serialized work and receive results from all connected sources, deduplicated and normalized.

### G2 — Canonical Library
A user's saved library references Marang's own catalog, not fragile external source IDs. If a source goes down or a series moves, the library entry remains intact.

### G3 — Continuous Progress Tracking
Reading progress — at minimum the last read chapter — is tracked across sessions and source changes.

### G4 — Source Transparency
Users can see which sources a work is available on and choose or override their preferred source.

### G5 — Update Awareness
Users know when new chapters are available for series they follow, without manually visiting each source.

### G6 — Mobile-First Experience
The primary interface is a React Native mobile app. The experience is fast, legible, and accessible on common mobile screen sizes.

### G7 — Graceful Degradation
Source failures, timeouts, and data gaps do not crash or block the application. Marang degrades gracefully and communicates clearly.

---

## 6. Non-Goals

The following are explicitly outside the scope of Marang Archive:

- **Content hosting.** Marang does not store, proxy, or serve manga pages, chapter images, or novel text.
- **Content reading UI.** Marang is a gateway platform. It surfaces where content is available and opens the appropriate source. A built-in reader is a post-MVP consideration only if permitted integrations exist that allow it.
- **Social features.** No ratings, reviews, friend lists, activity feeds, or community functionality in MVP.
- **Web scraping without authorization.** All source integrations must use officially permitted mechanisms (APIs, authorized feeds, public metadata). See the legal/ethical boundary in `Rules.md`.
- **Desktop application.** Not in scope.
- **Offline reading.** Full offline reading support is not in scope. Offline access to cached library metadata is a later consideration.
- **Creator tools.** No tools for publishers, authors, or content owners.
- **Multi-user accounts / family sharing.** Single-user personal use only in MVP.

---

## 7. Core User Journeys

### J1 — Search → Discover → Open

```
User opens search
  → types series title (or partial title)
  → Marang queries connected sources in parallel
  → results returned, normalized, deduplicated
  → user selects a result
  → series detail page shown:
      title, cover, synopsis, authors, genres, status, chapter list
  → user taps "Open" or selects a specific chapter
  → Marang resolves the best available source
  → source is opened (via in-app browser or handoff)
```

### J2 — Search → Save → Track

```
User finds a series (via search or browsing)
  → taps "Add to Library"
  → selects reading status (or defaults to "Plan to Read")
  → series saved to personal library referencing Marang canonical ID
  → user can later update status: Reading / Completed / On Hold / Dropped
```

### J3 — Library → Continue Reading

```
User opens Library tab
  → sees all saved series with reading status
  → taps "Continue" on an in-progress series
  → Marang recalls last read chapter
  → resolves appropriate source
  → opens next unread chapter
```

### J4 — Series → Available Sources → Source Resolution

```
User on series detail page
  → taps "Sources" or "Where to Read"
  → sees list of connected sources that carry this series
  → each source shows: availability status, capabilities, language
  → user may set a preferred source for this series
  → Marang uses preference for future source resolution
```

### J5 — Follow Series → Update Detection

```
User adds series to library with status "Reading" or "Following"
  → background job periodically checks for new chapters on connected sources
  → when new chapter detected: update record created
  → user sees badge / notification / updates feed
  → user can open new chapter directly from updates
```

### J6 — History

```
User navigates to History
  → sees chronological list of recently opened series/chapters
  → can tap to reopen
  → can clear history
```

---

## 8. Functional Requirements

### 8.1 Search

| ID | Requirement | Priority |
|----|-------------|----------|
| S1 | Full-text search by title across all connected sources | Critical |
| S2 | Results normalized to Marang canonical format | Critical |
| S3 | Deduplication: same series from multiple sources shown as one result | Critical |
| S4 | Search results show cover, title, source count, type, status | High |
| S5 | Search supports alternative/romanized titles | High |
| S6 | Search is tolerant of partial matches and minor typos | Medium |
| S7 | Search results are paginated | High |
| S8 | Per-source search failures do not block results from other sources | Critical |
| S9 | Search result caching to reduce redundant source queries | Medium |
| S10 | Filter search results by type (manga/manhwa/novel/etc.) and status | Medium |

### 8.2 Discovery

| ID | Requirement | Priority |
|----|-------------|----------|
| D1 | Browse series by genre/category [PROPOSED] | Medium |
| D2 | Trending or recently updated series surface on home screen [PROPOSED] | Low |
| D3 | Series recommendations based on library [FUTURE] | Future |

### 8.3 Catalog

| ID | Requirement | Priority |
|----|-------------|----------|
| C1 | Marang maintains a canonical series record independent of source | Critical |
| C2 | Each canonical series maps to one or more source-specific records | Critical |
| C3 | Canonical record includes: titles, alternative titles, authors, artists, genres, tags, status, cover URL, content type, synopsis | High |
| C4 | Chapter list attached to canonical series, normalized from sources | High |
| C5 | Source mappings stored per canonical series | Critical |
| C6 | Catalog records created/updated on first search/access | High |

### 8.4 Series Detail

| ID | Requirement | Priority |
|----|-------------|----------|
| SD1 | Series detail page shows all canonical metadata | Critical |
| SD2 | Chapter list with numbers, titles, dates | High |
| SD3 | User's reading progress reflected on series page (last read chapter highlighted) | High |
| SD4 | "Add to Library" / "In Library" toggle | Critical |
| SD5 | Available sources listed with status | High |
| SD6 | User can set preferred source for this series | Medium |

### 8.5 Library

| ID | Requirement | Priority |
|----|-------------|----------|
| L1 | User can add any canonical series to their library | Critical |
| L2 | Library entry stores reading status | Critical |
| L3 | Library persists across sessions (server-side) | Critical |
| L4 | Library is searchable and filterable by status, type | Medium |
| L5 | Library shows cover, title, last read chapter, status | High |
| L6 | "Continue Reading" shortcut per entry | Critical |
| L7 | Remove from library | High |
| L8 | Library sorted by last activity (default), alphabetical, status | Medium |

### 8.6 Reading Status

| ID | Requirement | Priority |
|----|-------------|----------|
| RS1 | Supported statuses: Reading, Completed, On Hold, Plan to Read, Dropped | Critical |
| RS2 | Status changeable from library and series detail page | High |
| RS3 | Status history not required in MVP | Low |

### 8.7 Progress Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| P1 | Track last read chapter per series | Critical |
| P2 | User can manually mark chapters as read | High |
| P3 | Mark all previous chapters as read | Medium |
| P4 | Unread chapter count displayed | Medium |
| P5 | Chapter-level progress (scroll position within a chapter) is post-MVP | Post-MVP |

### 8.8 History

| ID | Requirement | Priority |
|----|-------------|----------|
| H1 | Record of recently accessed series/chapters | High |
| H2 | History persists across sessions | High |
| H3 | User can clear history | Medium |
| H4 | History limited to last N entries (configurable, default 100) | Medium |

### 8.9 Source Discovery and Resolution

| ID | Requirement | Priority |
|----|-------------|----------|
| SR1 | Source registry maintains list of configured adapters | Critical |
| SR2 | Each source declares capabilities | Critical |
| SR3 | Source resolver selects best source for a given request | Critical |
| SR4 | User can override source preference per series | High |
| SR5 | Source health monitored; unhealthy sources deprioritized | High |
| SR6 | Source resolution does not expose source-specific logic to clients | Critical |

### 8.10 Updates

| ID | Requirement | Priority |
|----|-------------|----------|
| U1 | Background job checks for new chapters for followed series | High |
| U2 | Updates feed shows new chapters available | High |
| U3 | Update records stored per series | High |
| U4 | Push notification for new chapters [PROPOSED — platform dependent] | Medium |
| U5 | Update check frequency configurable | Low |

### 8.11 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| N1 | In-app notification for new chapters | Medium |
| N2 | Push notification [PROPOSED] | Medium |
| N3 | User can mute notifications per series | Low |
| N4 | Notification preferences in settings | Low |

### 8.12 User Preferences

| ID | Requirement | Priority |
|----|-------------|----------|
| UP1 | Preferred source per series | Medium |
| UP2 | Default content language preference | Medium |
| UP3 | Notification preferences | Low |
| UP4 | Theme (light/dark) [PROPOSED] | Low |

### 8.13 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| A1 | User accounts required for library persistence | Critical |
| A2 | Email + password authentication in MVP | Critical |
| A3 | JWT-based sessions | High |
| A4 | Secure token storage on mobile (not plain AsyncStorage) | Critical |
| A5 | OAuth (Google, Apple) [PROPOSED — post-MVP] | Post-MVP |
| A6 | Password reset flow | High |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| ID | Requirement |
|----|-------------|
| PF1 | Search results returned within 3 seconds under normal conditions |
| PF2 | Series detail page loads within 2 seconds for cached content |
| PF3 | Library loads within 1 second |
| PF4 | Per-source search timeout: 5 seconds maximum; slow sources do not block others |
| PF5 | API responses paginated; no unbounded list responses |
| PF6 | Cover images lazy-loaded and cached on mobile |

### 9.2 Reliability

| ID | Requirement |
|----|-------------|
| RL1 | Individual source failures do not crash or block Marang |
| RL2 | API returns partial results when some sources fail |
| RL3 | Critical data (library, progress) stored server-side; not lost on app reinstall |
| RL4 | Background job failures logged and retried with backoff |

### 9.3 Security

| ID | Requirement |
|----|-------------|
| SC1 | All API endpoints authenticated (except public search, public series detail) |
| SC2 | Secrets never committed to repository |
| SC3 | JWT tokens stored securely on mobile |
| SC4 | Input validated at API boundary |
| SC5 | External source data sanitized before storage or display |
| SC6 | Rate limiting on public API endpoints |
| SC7 | HTTPS only |

### 9.4 Privacy

| ID | Requirement |
|----|-------------|
| PV1 | User data not shared with external sources |
| PV2 | Library and reading history private to the user |
| PV3 | Minimal data collection: only what is necessary for product function |

### 9.5 Accessibility

| ID | Requirement |
|----|-------------|
| AC1 | React Native accessibility APIs used throughout (accessibilityLabel, accessibilityRole, accessibilityHint) |
| AC2 | Tap targets meet minimum size guidelines (44×44pt iOS, 48×48dp Android) |
| AC3 | Sufficient color contrast for text and interactive elements |
| AC4 | Screen reader compatible navigation |
| AC5 | No time-limited interactions that cannot be extended |

### 9.6 Maintainability

| ID | Requirement |
|----|-------------|
| MT1 | TypeScript used throughout (frontend and backend) |
| MT2 | Modules maintain clear internal boundaries |
| MT3 | Source adapters isolated from core business logic |
| MT4 | Database changes via migrations only |
| MT5 | Dependency versions pinned |

### 9.7 Extensibility

| ID | Requirement |
|----|-------------|
| EX1 | New source adapters can be added without modifying core |
| EX2 | New content types (e.g., novels) can be added without redesigning the catalog |
| EX3 | Future web client can consume the same API |

---

## 10. MVP Definition

The Minimum Viable Product delivers the core user value loop:

> **Search → Find → Library → Track → Continue**

### MVP Scope

- [ ] User registration and login (email/password)
- [ ] At least one working source adapter (the specific source is [DECISION NEEDED])
- [ ] Search: query source(s), normalize results, display
- [ ] Series detail page: metadata, chapter list
- [ ] Add series to library
- [ ] Reading status management (Reading, Completed, Plan to Read, On Hold, Dropped)
- [ ] Mark chapters as read
- [ ] Continue Reading — resume from last read chapter
- [ ] Basic reading history
- [ ] Source resolution — open series/chapter in appropriate source
- [ ] React Native mobile app covering: Home, Search, Search Results, Series Detail, Library, Profile/Settings

### MVP Explicitly Excludes

- Push notifications
- Update background jobs
- Multiple source adapters (one is sufficient to prove the architecture)
- Social features
- Web client
- OAuth login
- In-app reader
- Discovery/browse by genre (unless trivially achievable from MVP data)

---

## 11. Post-MVP

Features deferred until MVP is stable and validated:

- Multiple source adapters (target: 3–5)
- Chapter update detection and updates feed
- In-app push notifications
- OAuth authentication (Google, Apple)
- Genre / category browsing
- Preferred source per series
- Notification preferences
- Reading history with filtering
- Library sorting and filtering
- Unread chapter count badges
- Deep links / universal links
- Background update jobs with configurable frequency

---

## 12. Future / Speculative

These are ideas that may or may not become requirements. Do not design for them prematurely.

- Built-in chapter reader (image viewer for manga, text reader for novels) — requires explicit source authorization
- AI-assisted series recommendations based on reading history
- Cross-device sync beyond the basic API model
- Social features: ratings, reviews, community lists
- Web client
- Desktop client
- Source-agnostic chapter download for offline reading (legal considerations apply)
- Import from other tracking apps (AniList, MyAnimeList, etc.)
- Export user data
- Series completion alerts

---

## 13. Success Criteria

These are observable criteria for evaluating whether Marang is succeeding.

### MVP Success

- A user can register, search for a series, add it to their library, mark chapters as read, and continue from the last read chapter — end to end — without errors.
- At least one source adapter is operational and returns real search results.
- Source resolution correctly opens the right content from the right source.
- Library and progress data persists across app restarts.
- No source failure crashes or hangs the application.

### Post-MVP Success

- At least 3 source adapters operational.
- Update detection reliably identifies new chapters within a configurable window.
- Search results from multiple sources correctly deduplicated.
- User can manage their entire reading list from the mobile app without visiting individual source sites for library management.

### Technical Success

- Source adapter can be added or removed without modifying core modules.
- All API endpoints return consistent, validated responses.
- No plaintext secrets in the repository.
- TypeScript compilation produces zero errors.
- Test coverage exists for search, matching, library, and progress tracking logic.
