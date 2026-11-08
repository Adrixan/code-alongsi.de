# Project State

This file maintains context across conversations.

---

## Project Info

- **Name**: Code-Alongside Website
- **Type**: Static Website
- **Stack**: HTML5, CSS3, Vanilla JS

## Environment

- **OS**: Linux
- **Package Manager**: npm (dev-only for testing)
- **Shell**: bash

## User Profile

- **Level**: Senior

## Architecture

Single-page static website using semantic HTML5, custom CSS properties for styling ("Bioluminescent Night" theme), and vanilla JavaScript for basic interactive elements (mobile navigation drawer, year updates). Fully WCAG 2.1 AA compliant.

---

## Requirements Log

### US-1: Neue Dienstleistung "Sichere KI-Integration" — 2026-05-27

**Functional Requirements:**
1. Create content/copy for a new consulting offering focusing on secure AI integration and DSGVO compliance.
2. Integrate this offering into the existing website (`index.html`) under the "Leistungen" section.
3. Add a marketing slogan badge ("K.I.? Aber sicher! Mit Code-Alongside") above the hero heading.
4. Add the service to the footer navigation list.
5. Fix the heading-order accessibility violation in the footer.
6. Setup local E2E and accessibility test suite.

**Non-Functional Requirements:**
- Security: No data leaks, secure contact options, strict CSP compliance. (Verified via test)
- Performance: Minimal CSS/JS overhead, keep fast loading times. (Verified, pure CSS badge with animation)
- Accessibility: Maintain WCAG 2.1 AA compliance (no violations, corrected footer heading hierarchy). (Verified via axe-playwright)

**Out of Scope:**
1. Dynamic backend for AI tools (purely consulting/assessment offering).

## Decisions Log

*Full decisions documented in [DECISIONS.md](DECISIONS.md).*

### 2026-05-27 — Projekt-Setup & Technologie-Stack
- **Decision**: Keep pure static HTML/CSS/JS for production. Use Node/npm only as development dependencies for testing.
- **Rationale**: Minimal complexity, high security, zero build overhead.

### 2026-05-27 — Dark Mode & Design-Struktur
- **Decision**: Keep rein dunklen "Bioluminescent Night" style.
- **Rationale**: Core element of Peter Aufner's personal brand strategy.

### 2026-05-27 — Internationalisierung (i18n)
- **Decision**: Single language German.
- **Rationale**: Primary target audience is in DE/AT/CH regions.

## Product Backlog

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| US-1 | As a website visitor / business owner, I want to see a new offering for secure AI integration so that I can hire Peter for compliant AI adoption. | Must | 2 | Done |
| US-2 | As the site owner, I want styleguide conformity, bot/AI friendliness and a scripted deploy to code-alongsi.de. | Must | 5 | Done |

---

## Current Sprint

**Goal**: Define and integrate the new "Sichere KI-Integration" offering.

*Sprint completed successfully on 2026-05-27.*

## Open Items

*None*

## Skipped Tests

*None*

## Sprint History

### Sprint 1 — 2026-05-27

**Goal**: Define and integrate the new "Sichere KI-Integration" offering.
**Delivered**: US-1
**Velocity**: 2 points
**Retrospective**:
- What went well: Quick feedback on slogans, rapid test setup, fixing pre-existing accessibility issues.
- What to improve: Keep tests in mind during initial scoping.

## Session Log

| Date | Action | Notes |
|------|--------|-------|
| 2026-05-27 | Initialized project state | User profile set to Senior |
| 2026-05-27 | Implemented US-1 and tests | Passed 6/6 tests, fully compliant |
| 2026-10-13 | US-2: styleguide audit, self-hosted fonts, bot/AI files, deploy script | 22/22 tests; deploy via `npm run deploy` |
| 2026-11-08 | `/apps/` legal pages for the Android apps (DE/EN), footer link, tests extended | 46/46 tests; deployed at `bf9db3b` |

---

## Context Health

- **Last Compaction**: N/A
- **Active Items**: 0
- **Archived Items**: 1
- **Context Status**: Optimal
- **Optimization Notes**: All backlog items delivered.

---

*Last updated: 2026-10-13*
