# SOURCES.md — Source Registry
# Marang Archive

**Version:** 0.1.0
**Last Updated:** 2026-08-07

> This is the **human-readable inventory of external sources** for Marang Archive.
>
> It documents known and candidate sources, their expected capabilities, their integration status,
> and the planned adapter location for each source.
>
> This file is NOT runtime configuration.
> This file does NOT contain secrets, credentials, API keys, tokens, or authentication data.
> This file does NOT grant permission to integrate a source — that must be verified separately.

---

## Related Documents

| Document | Relationship |
|----------|-------------|
| `TRD.md` | Defines the source adapter architecture, `SourceAdapter` interface, and Source Registry |
| `Schema.md` | Defines the `Source`, `SourceCapability`, `SourceMapping`, and `SourceHealth` database entities |
| `ImplementationPlan.md` | Defines when source integrations are implemented across development phases |
| `Tracker.md` | Tracks current adapter and integration progress |
| `Rules.md` | Defines the legal and ethical rules for source integrations (§8) |
| `Agents.md` | Defines how AI agents should work with source adapters (§5) |

---

## Table of Contents

1. [Status Legend](#1-status-legend)
2. [Source Overview Table](#2-source-overview-table)
3. [Architecture Reminder](#3-architecture-reminder)
4. [Integration Policy](#4-integration-policy)
5. [Manga / Manhwa / Manhua / Webtoon Sources](#5-manga--manhwa--manhua--webtoon-sources)
   - [MgekoCC](#mgekocc)
   - [MangaFire](#mangafire)
   - [ManhuaUS](#manhuaus)
6. [Novel Sources](#6-novel-sources)
   - [Novel Source 1](#novel-source-1)
7. [Source-Specific Logic Rule](#7-source-specific-logic-rule)
8. [Source Health Architecture](#8-source-health-architecture)
9. [Coverage Model](#9-coverage-model)
10. [Adding a New Source](#10-adding-a-new-source)
11. [Future Source Categories](#11-future-source-categories)
12. [Capability Reference](#12-capability-reference)

---

## 1. Status Legend

| Symbol | Status | Meaning |
|--------|--------|---------|
| 🟢 | Active | Integrated, tested, and currently usable |
| 🟡 | Candidate | Identified as a potential source; integration not yet implemented or verified |
| 🔵 | Planned | Intended for future evaluation |
| 🟠 | Limited | Integrated or evaluated, but only some capabilities/content are available |
| 🔴 | Disabled | Previously considered or integrated but currently unavailable or intentionally disabled |

All sources in this registry are currently marked **🟡 Candidate** unless repository evidence proves otherwise.

---

## 2. Source Overview Table

| Source ID | Source Name | Category | Coverage | Status | Adapter |
|-----------|-------------|----------|----------|--------|---------|
| `mgeko` | MgekoCC | Manga / Manhwa / Manhua / Webtoon | Unknown | 🟡 Candidate | Not implemented |
| `mangafire` | MangaFire | Manga / Manhwa / Manhua / Webtoon | Unknown | 🟡 Candidate | Not implemented |
| `manhuaus` | ManhuaUS | Manhua | Unknown | 🟡 Candidate | Not implemented |
| `novel-source-1` | Novel Source 1 | Web Novel / Light Novel | Partial | 🟡 Candidate | Not implemented |

> **Novel coverage is explicitly incomplete.** No single novel source covers all works. Additional novel sources must be evaluated and added over time.

---

## 3. Architecture Reminder

Marang Core is source-agnostic. Source-specific logic lives exclusively in adapter packages.

```
Marang Core
     │
Source Registry
     │
 ┌───┼────┐
 ↓   ↓    ↓
A    B    C
│    │    │
↓    ↓    ↓
External Sources
```

The only path from Marang Core to an external source is:

```
api → service → sources/registry → adapter → external source
```

The Source Registry is documented in `TRD.md §9`. Only the following modules may access the registry:
- `search/` — to fan out search queries
- `resolution/` — to resolve the best source for a request
- `workers/` — to check for updates
- `catalog/` — to refresh canonical metadata

---

## 4. Integration Policy

Marang Archive integrates external sources **only through mechanisms the source explicitly permits**.

Potential legitimate integration mechanisms include:

- Official public APIs
- Licensed or authorized APIs
- Authorized metadata feeds
- Public metadata endpoints
- Authorized embed mechanisms
- Other explicitly permitted interfaces

Marang Archive does **not** and must **not** implement or support:

- Bypassing paywalls or subscription requirements
- Defeating CAPTCHA systems
- Circumventing DRM (digital rights management)
- Evading authentication or access controls
- Ignoring explicit access restrictions or `robots.txt` directives
- Redistributing, storing, proxying, or caching copyrighted content (chapter images, novel text)

These restrictions are not guidelines — they are hard requirements (see `Rules.md §8`).

If integration permission or the access mechanism is unclear for any source:

```
Status: Needs verification
```

Do not guess. Do not assume. Verify before implementing.

---

## 5. Manga / Manhwa / Manhua / Webtoon Sources

---

### MgekoCC

**Source ID:** `mgeko`

**URL:** https://www.mgeko.cc/

**Category:** Manga / Manhwa / Manhua / Webtoon

**Status:** 🟡 Candidate

**Coverage:** Unknown — needs verification

---

#### Potential Capabilities

| Capability | Status |
|------------|--------|
| `SEARCH` | ? Unknown |
| `METADATA` | ? Unknown |
| `SERIES` | ? Unknown |
| `CHAPTERS` | ? Unknown |
| `CHAPTER_CONTENT` | ? Unknown |
| `COVER` | ? Unknown |
| `UPDATES` | ? Unknown |

> `?` = Unknown / Needs verification. No capability is marked confirmed without technical verification.

---

#### Integration Method

**Status:** Needs verification

Potential integration methods may include:

- Official API
- Authorized feed
- Public metadata endpoint
- Authorized embed mechanism
- Other permitted integration mechanism

The actual integration method must be verified before any adapter work begins.

---

#### Adapter

**Package:** `adapters/mgeko`

**Status:** Not implemented

---

#### Notes

- Candidate source for manga, manhwa, manhua, and webtoon content.
- The site appears to cover a broad range of serialized comic formats.
- Content coverage scope is unverified — do not assume complete coverage.
- Integration method and access permissions must be verified before development.

---

#### Limitations

- Coverage scope unknown until verified.
- Supported capabilities unknown until verified.
- Rate limits, authentication requirements, and access restrictions unknown.

---

#### Verification

```
Integration permission:        Needs verification
Technical interface:           Needs verification
Rate limits:                   Needs verification
Authentication requirements:   Needs verification
robots.txt / crawl policy:     Needs verification
Terms of service review:       Needs verification
```

---

### MangaFire

**Source ID:** `mangafire`

**URL:** https://mangafire.to/

**Category:** Manga / Manhwa / Manhua / Webtoon

**Status:** 🟡 Candidate

**Coverage:** Unknown — needs verification

---

#### Potential Capabilities

| Capability | Status |
|------------|--------|
| `SEARCH` | ? Unknown |
| `METADATA` | ? Unknown |
| `SERIES` | ? Unknown |
| `CHAPTERS` | ? Unknown |
| `CHAPTER_CONTENT` | ? Unknown |
| `COVER` | ? Unknown |
| `UPDATES` | ? Unknown |

> `?` = Unknown / Needs verification. No capability is marked confirmed without technical verification.

---

#### Integration Method

**Status:** Needs verification

Potential integration methods may include:

- Official API
- Authorized feed
- Public metadata endpoint
- Authorized embed mechanism
- Other permitted integration mechanism

The actual integration method must be verified before any adapter work begins.

---

#### Adapter

**Package:** `adapters/mangafire`

**Status:** Not implemented

---

#### Notes

- Candidate source for manga, manhwa, manhua, and webtoon content.
- Integration method and access permissions must be verified before development.
- Content coverage and depth are unverified.

---

#### Limitations

- Coverage scope unknown until verified.
- Supported capabilities unknown until verified.
- Rate limits, authentication requirements, and access restrictions unknown.

---

#### Verification

```
Integration permission:        Needs verification
Technical interface:           Needs verification
Rate limits:                   Needs verification
Authentication requirements:   Needs verification
robots.txt / crawl policy:     Needs verification
Terms of service review:       Needs verification
```

---

### ManhuaUS

**Source ID:** `manhuaus`

**URL:** https://manhuaus.com

**Category:** Manhua (primarily) / Potentially related serialized comic formats

**Status:** 🟡 Candidate

**Coverage:** Unknown — needs verification. Focused primarily on manhua content.

---

#### Potential Capabilities

| Capability | Status |
|------------|--------|
| `SEARCH` | ? Unknown |
| `METADATA` | ? Unknown |
| `SERIES` | ? Unknown |
| `CHAPTERS` | ? Unknown |
| `CHAPTER_CONTENT` | ? Unknown |
| `COVER` | ? Unknown |
| `UPDATES` | ? Unknown |

> `?` = Unknown / Needs verification. No capability is marked confirmed without technical verification.

---

#### Integration Method

**Status:** Needs verification

Potential integration methods may include:

- Official API
- Authorized feed
- Public metadata endpoint
- Authorized embed mechanism
- Other permitted integration mechanism

The actual integration method must be verified before any adapter work begins.

---

#### Adapter

**Package:** `adapters/manhuaus`

**Status:** Not implemented

---

#### Notes

- Candidate source with a primary focus on manhua content.
- May also cover related serialized comic formats — scope requires verification.
- Do not assume capability coverage beyond what is verified.
- Integration method and access permissions must be confirmed before development.

---

#### Limitations

- Category coverage is expected to be narrower than the other comic sources (primarily manhua).
- Coverage may not extend to manga or manhwa content — verify before claiming cross-category coverage.
- Rate limits, authentication requirements, and access restrictions unknown.

---

#### Verification

```
Integration permission:        Needs verification
Technical interface:           Needs verification
Rate limits:                   Needs verification
Authentication requirements:   Needs verification
robots.txt / crawl policy:     Needs verification
Terms of service review:       Needs verification
```

---

## 6. Novel Sources

> **Important:** Novel coverage in Marang Archive is **partial by design**.
> No single novel source is assumed to contain all web novels or light novels.
> The source registry is designed to accommodate multiple novel sources.
> Additional sources should be evaluated and added over time to expand coverage.

---

### Novel Source 1

**Source ID:** `novel-source-1`

**URL:** [URL TO BE PROVIDED]

**Category:** Web Novel / Light Novel

**Status:** 🟡 Candidate

**Coverage:** Partial

> Novel coverage is incomplete. This source does not contain all novels.
> Additional novel sources will be evaluated and added to this registry over time.
> The source registry architecture is designed to support multiple novel sources.

---

#### Potential Capabilities

| Capability | Status |
|------------|--------|
| `SEARCH` | ? Unknown |
| `METADATA` | ? Unknown |
| `SERIES` | ? Unknown |
| `CHAPTERS` | ? Unknown |
| `CHAPTER_CONTENT` | ? Unknown |
| `COVER` | ? Unknown |
| `UPDATES` | ? Unknown |

> `?` = Unknown / Needs verification.

---

#### Integration Method

**Status:** Needs verification

Potential integration methods may include:

- Official API
- Authorized feed
- Public metadata endpoint
- Authorized embed mechanism
- Other permitted integration mechanism

---

#### Adapter

**Package:** `adapters/novel-source-1`

> Note: Package name should be updated to reflect the actual source name once the URL is provided.

**Status:** Not implemented

---

#### Notes

- Placeholder entry. The URL for this source has not yet been provided.
- Once the source URL is confirmed, update this entry with the real source ID, URL, name, and adapter package path.
- Novel coverage across all sources is inherently partial — Marang must never assume that any novel source contains every work.
- When searching for novels, Marang should query all available novel sources and aggregate results.

---

#### Limitations

- URL not yet provided — this entry is a placeholder.
- Coverage is explicitly partial: this source does not contain all novels.
- Additional novel sources are needed to improve coverage.

---

#### Verification

```
Integration permission:        Needs verification (URL not yet provided)
Technical interface:           Needs verification
Rate limits:                   Needs verification
Authentication requirements:   Needs verification
robots.txt / crawl policy:     Needs verification
Terms of service review:       Needs verification
```

---

## 7. Source-Specific Logic Rule

> Source-specific behavior belongs inside the corresponding source adapter.
> Marang Core must never contain source-specific scraping, parsing, or request logic.

```
CORRECT:

Marang Core
     ↓
Source Registry
     ↓
SourceAdapter interface
     ↓
mgeko adapter (source-specific logic lives here)
     ↓
mgeko (external source)


INCORRECT:

Marang Core
     ├── if source === 'mgeko' ...
     ├── if source === 'mangafire' ...
     └── if source === 'manhuaus' ...
```

If a new source requires core code to branch on a source name or ID, that is a design violation. The adapter interface must be extended instead.

See `TRD.md §8` for the full `SourceAdapter` interface definition.

---

## 8. Source Health Architecture

Each source integration should support health monitoring. This is not yet implemented but must be designed into each adapter.

### Health States

```
HEALTHY      — Source is responding normally
DEGRADED     — Source is responding but with elevated errors or latency
UNHEALTHY    — Source is not responding or repeatedly failing
UNKNOWN      — Source health has not yet been checked
```

### Potential Monitoring Signals

- Request success rate (responses vs failures)
- Response latency (P50, P95)
- Error rate by error type (timeout, parse failure, rate limit, 4xx, 5xx)
- Last successful health check timestamp
- Adapter-level failure counts
- Capability-level failure counts (e.g., `SEARCH` works but `CHAPTERS` fails)

### Implementation Note

The `SourceAdapter` interface includes a `healthCheck()` method (see `TRD.md §8.2`). Each adapter must implement it. Health state is checked by the `source-health-check` background job (every 10 minutes) and proactively updated on request failures.

Health state is stored in Redis for fast access and persisted to the `SourceHealth` database table for history.

Do not implement the full health dashboard in MVP. The architecture must support it from the start.

---

## 9. Coverage Model

### No Source is Complete

> No source is assumed to contain every work.

Marang treats source coverage as dynamic and partial. When a user searches for a title:

```
User searches: "Example Title"

mgeko        → Found (series metadata available)
mangafire    → Found (series metadata available)
manhuaus     → Not found

Result: Marang aggregates results from responding sources.
        Series is presented once (after deduplication),
        with source mappings to all sources that returned it.
```

This aggregation model means:
- Adding a new source automatically improves coverage for all searches.
- Losing a source does not remove content from user libraries (canonical IDs are stable).
- No source is treated as authoritative or complete.

### Novel Coverage Is Explicitly Incomplete

For web novels and light novels specifically:

- The current registered novel source does not contain all novels.
- Additional novel sources should be identified, verified, and added to this registry over time.
- When searching for novels, Marang must query all registered novel sources, not just one.
- Display coverage gaps clearly to users rather than implying complete coverage.

---

## 10. Adding a New Source

Follow this workflow when adding a new source to Marang Archive:

```
Step 1: Identify candidate source
        ↓
        Research the source. What content does it cover?
        What category (manga, manhwa, novel, etc.)?
        Is coverage broad or narrow?
        ↓

Step 2: Verify permitted integration method
        ↓
        Does the source have a public or licensed API?
        What does its terms of service say about automated access?
        What does its robots.txt say?
        Document the permitted access mechanism.
        If unclear: Status = Needs verification. Do not proceed.
        ↓

Step 3: Create a source registry entry in this file
        ↓
        Use the standard entry format.
        Mark status as 🟡 Candidate.
        Mark all capabilities as ? Unknown.
        Document the planned adapter package path.
        ↓

Step 4: Define capabilities
        ↓
        Test the integration method manually.
        Determine which capabilities are actually supported.
        Update the capability table with ✓ Confirmed or ✗ Not supported.
        ↓

Step 5: Implement the adapter
        ↓
        Create adapters/[source-name]/ as a pnpm workspace package.
        Implement the full SourceAdapter interface (TRD.md §8.2).
        Inject configuration — never hardcode credentials.
        Document integration mechanism in the adapter class header.
        ↓

Step 6: Normalize source data
        ↓
        Write the adapter normalizer.
        Map source-specific fields to canonical models.
        Map source-specific status/type values to Marang enums.
        ↓

Step 7: Write adapter tests
        ↓
        Record real source responses as JSON fixtures.
        Test all methods against fixtures (no real network calls in CI).
        Test all error paths: timeout, 404, malformed response, rate limit.
        ↓

Step 8: Register the adapter
        ↓
        Add the adapter to the Source Registry initialization.
        Verify registry picks it up and capabilities are declared correctly.
        ↓

Step 9: Perform health checks
        ↓
        Confirm the healthCheck() method works.
        Run the source-health-check job against the new source.
        ↓

Step 10: Mark source Active
         ↓
         Update this file: status → 🟢 Active.
         Update Tracker.md with the completed integration.
```

### Key Constraint

> A new source must not require modifications to Marang Core beyond registering the adapter and its capabilities.

If adding a source requires changes to `catalog/`, `library/`, `search/`, or any other core module, that is a design problem. Fix the architecture, not the constraint.

---

## 11. Future Source Categories

The source registry is designed to accommodate sources across all of these content categories:

| Category | Description |
|----------|-------------|
| Manga | Japanese-origin comics (typically right-to-left, monochrome) |
| Manhwa | Korean-origin comics (typically top-to-bottom, color webtoon or traditional) |
| Manhua | Chinese-origin comics |
| Webtoon | Vertically scrolling digital comics, typically color |
| Web Novel | Originally published online in serial form |
| Light Novel | Short Japanese novels, typically with manga-style illustrations |
| Other | Any serialized digital work not fitting the above categories |

When adding a source, assign it the most accurate category. A source may cover multiple categories — document each one.

Do not add arbitrary sources to fill out categories. Every source must go through the verification step before being added.

---

## 12. Capability Reference

Standard capabilities used across all source adapters:

| Capability | Constant | Description |
|------------|----------|-------------|
| Search | `SEARCH` | Query the source for series matching a search string |
| Metadata | `METADATA` | Retrieve full metadata for a known series (title, author, genre, synopsis, etc.) |
| Series | `SERIES` | Retrieve the canonical series record including all available metadata |
| Chapters | `CHAPTERS` | Retrieve the chapter list for a series |
| Chapter content | `CHAPTER_CONTENT` | Retrieve the access URL or content for a specific chapter |
| Cover | `COVER` | Retrieve the cover image URL for a series |
| Updates | `UPDATES` | Check for new chapters or updates on a source |

### Capability Status Symbols

| Symbol | Meaning |
|--------|---------|
| ✓ | Confirmed — verified through testing |
| ? | Unknown — needs verification |
| ✗ | Not supported — source does not offer this capability |

A capability must not be marked ✓ merely because it appears possible from the website UI. It must be verified through the integration mechanism that will actually be used.

A source may support some capabilities without supporting others. The Source Registry and Source Resolver check capabilities before calling adapter methods — a missing capability must never cause a runtime crash.

See `TRD.md §8.3` for the full `SourceCapability` enum and `SourceCapabilitySet` type.

---

*This file is maintained manually. Update it whenever a source's status, capabilities, or adapter state changes.*
*Do not add credentials, tokens, API keys, or secrets to this file.*
