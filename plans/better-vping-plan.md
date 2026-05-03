# Plan: Better VPing

> Source PRD: `prds/better-vping-prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Product**: Better VPing, a premium red/news-style dashboard for athletics staff directory intelligence.
- **Frontend deployment**: React + TypeScript + Vite on Vercel.
- **Backend deployment**: Hono + TypeScript on Render.
- **Scraping/extraction**: Playwright runs server-side to render full staff-directory pages. Backend scrapes current and archived pages sequentially with 25s/page timeout, removes obvious junk DOM, sends cleaned page text to Gemini through the Vercel AI SDK, validates structured staff records, and fails loudly on empty extraction.
- **Caching**: no server cache. React Query caches diff and email draft results for one hour. Manual refresh invalidates client cache and re-scrapes.
- **Routes**:
  - Frontend `/`: full-screen three-school hub.
  - Frontend `/schools/:schoolId`: school comparison/report page.
  - Frontend routing uses concrete route components for `/` and `/schools/:schoolId`; no app-level discriminated route object.
  - Backend `GET /api/health`: health check.
  - Backend `GET /api/schools`: school metadata.
  - Backend `GET /api/schools/:schoolId/diff`: scrape + diff default snapshot.
  - Backend `POST /api/schools/:schoolId/email-draft`: generate draft from provided changes.
- **School scope**: Georgia, Virginia Tech, Wittenberg.
- **Snapshot scope**: one default Wayback snapshot per school now; data model supports optional future snapshots.
- **Key models**:
  - `School`: id, name, colors, monogram, current URL, snapshots, default snapshot.
  - `StaffRecord`: name, title, optional phone, optional email.
  - `Change`: type, staff identity, before record, after record, importance score, explanation.
  - `DiffReport`: school metadata, source URLs, scraped timestamp, old/current staff lists, all changes, top changes, stats.
  - `EmailDraft`: subject, body, summary, fallback flag.
- **Diff behavior**: compare structured staff records, not raw HTML. Detect added, removed, title changed, and contact changed.
- **Matching behavior**: exact normalized name first, conservative fuzzy fallback only when low risk.
- **Ranking behavior**: seniority and role importance first; contact-only changes lower priority. Show top 5–10, default target 8.
- **AI boundary**: backend uses Vercel AI SDK for page extraction. Phase 3 uses Gemini Flash with no outside search and no invented facts. Missing AI configuration fails loudly. Later email-draft AI remains grounded only in scraped changes.
- **UI preview boundary**: iframes/page previews are best effort. Report remains primary source of value if embedding fails.
- **Failure policy**: fail loudly on empty scrape, timeout, unknown school, and malformed API responses. No fake successful reports.
- **Observability policy**: no saved debug artifacts and no backend logs.
- **Styling**: Tailwind only. Official school color accents and CSS monograms. No logos. Neutral diff cards.
- **Deployment config**: frontend uses API base URL env var. Backend uses Hono CORS for `http://localhost:5173` during local dev. Render uses Playwright Docker base image.

---

## Phase 1: Project split + deployable skeleton

**User stories**: 37, 38, 39, 40, 41, 42, 43, 44, 45

### What to build

Create the deployable shape for Better VPing: separate frontend and backend apps, strict TypeScript, per-app environment configuration, CORS boundary, backend health route, and Docker-ready Render backend. This phase proves the project can run locally as two services and can be deployed separately to Vercel and Render.

### Acceptance criteria

- [x] Frontend and backend are separated into independent app packages.
- [x] Frontend and backend install, develop, and build independently.
- [x] Frontend can read an API base URL from environment config.
- [x] Backend exposes `GET /api/health`.
- [x] Backend CORS allows `http://localhost:5173` through Hono CORS.
- [x] Both apps build with strict TypeScript.
- [x] Render backend has a Docker path based on Playwright-compatible runtime.

---

## Phase 2: School catalog + home-to-school vertical slice

**User stories**: 1, 2, 3, 37, 38, 50, 51, 52, 55

### What to build

Deliver the first end-to-end user path from frontend to backend: load school metadata from the API, render the full-screen three-panel Better VPing home page, and navigate through a concrete `/schools/:schoolId` route component. This establishes the official school scope, school colors, monograms, default snapshots, route params, and API client pattern without a custom route-parsing hook.

### Acceptance criteria

- [x] `GET /api/schools` returns Georgia, Virginia Tech, and Wittenberg metadata.
- [x] Each school includes current URL, default snapshot metadata, color accents, and monogram.
- [x] Home page fills the viewport with three premium red/news-style school panels.
- [x] School panels use official color accents and CSS monograms only.
- [x] Selecting a school navigates to `/schools/:schoolId`.
- [x] Unknown frontend school route shows a clear not-found state.
- [x] Unknown backend school id returns a structured not-found error.

---

## Phase 3: AI-assisted current/archive extraction tracer bullet

**User stories**: 4, 9, 10, 11, 12, 13, 23, 24, 46, 48, 49

### What to build

Replace mock diff data with real server-side page fetching and AI-based staff extraction. The school page keeps calling `GET /api/schools/:schoolId/diff`. The backend resolves the school and default snapshot, renders the current staff directory and archived Wayback page with Playwright, removes obvious junk DOM, sends cleaned visible page text to Gemini through the Vercel AI SDK, validates structured staff records, and returns raw current/archive staff lists with counts.

This phase does not compute staff changes yet. It proves live page access, archive page access, AI extraction, loud failure behavior, and frontend display of real extracted data.

### Backend flow

1. Receive `GET /api/schools/:schoolId/diff`.
2. Validate school id and resolve default snapshot.
3. Launch one Playwright browser for the request.
4. Render the current URL with a 25 second timeout.
5. Remove obvious junk DOM: scripts, styles, noscript tags, SVGs, iframes, nav, header, footer, navigation roles, banner roles, contentinfo roles, and the Wayback toolbar.
6. Read cleaned `document.body.innerText`.
7. Send cleaned text to Gemini Flash through the Vercel AI SDK.
8. Validate AI output as `StaffRecord[]` with required `name` and `title`, plus optional `email` and `phone`.
9. Fail loudly if current extraction returns `0` records.
10. Repeat the same process for the archived URL.
11. Close the Playwright browser in `finally`.
12. Return the existing report shape with current/archive staff lists and stats.

### Acceptance criteria

- [x] School page auto-calls `GET /api/schools/:schoolId/diff` for the default snapshot.
- [x] `GET /api/schools/:schoolId/diff` no longer returns mock staff data.
- [x] Backend uses Playwright server-side to render pages, not browser/client scraping.
- [x] Current and archived pages are processed sequentially.
- [x] Each page render times out after 25 seconds.
- [x] Backend removes obvious junk DOM before AI extraction.
- [x] AI input is cleaned visible `document.body.innerText`.
- [x] Gemini Flash is called through the Vercel AI SDK.
- [x] AI output is validated against the `StaffRecord` schema.
- [x] Returned records include required `name` and `title`.
- [x] Returned records may include optional `phone` and `email` when present on the page.
- [x] API response includes school metadata, source URLs, generated timestamp, current staff, archived staff, and counts.
- [x] Missing AI configuration fails loudly with a structured error.
- [x] Page timeout fails loudly with a structured error identifying the failing source.
- [x] Malformed AI output fails loudly with a structured error identifying the failing source.
- [x] `0` extracted records from current or archive fails loudly.
- [x] Frontend displays clear loading, success, and error states.
- [x] No fake data is shown when extraction fails.

---

## Phase 4: Robust multi-school scraping + parser fallback

**User stories**: 9, 10, 11, 12, 13, 23, 24, 46, 55

### What to build

Expand scraping from the first tracer bullet to all three schools. Add school-specific parsing with a generic fallback so Georgia, Virginia Tech, and Wittenberg can each produce structured staff lists from current and Wayback pages. Keep the API contract stable while improving extraction coverage and failure behavior.

### Acceptance criteria

- [x] Georgia current and archived pages return non-empty structured staff lists.
- [x] Virginia Tech current and archived pages return non-empty structured staff lists.
- [x] Wittenberg current and archived pages return non-empty structured staff lists.
- [x] School-specific parsing runs before generic fallback.
- [x] Generic fallback can recover staff-like records from common table/card/text layouts.
- [x] Empty results still fail loudly instead of returning successful empty reports.
- [x] API response shape remains unchanged from Phase 3.
- [x] Frontend can show raw scraped counts for each school.

Live extraction verified locally on 2026-05-02: Georgia current 410 / archive 358, Virginia Tech current 375 / archive 333, Wittenberg current 99 / archive 71.

---

## Phase 5: Structured diff engine + meaningful ranking

**User stories**: 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 54

### What to build

Turn raw staff lists into a meaningful intelligence report. Compare current vs archived records, detect added/removed/title/contact changes, conservatively match name variants, rank changes by seniority and change type, and return both all changes and top changes. The UI renders top diff cards with before/after values, explanations, stats, and an expandable all-changes view.

### Acceptance criteria

- [x] Diff detects added staff.
- [x] Diff detects removed staff.
- [x] Diff detects title changes.
- [x] Diff detects phone/email contact changes.
- [x] Exact normalized name matching handles case, punctuation, and spacing.
- [x] Conservative fuzzy matching avoids obvious false merges.
- [x] Head coaches, directors, coordinators, and senior staff rank above lower-priority changes.
- [x] Contact-only changes rank lower unless attached to senior staff.
- [x] API returns all changes and top ranked changes.
- [x] Top ranked list contains 5–10 meaningful changes when enough changes exist.
- [x] UI shows neutral diff cards with change type, name, before box, after box, and explanation.
- [x] UI includes expandable all-detected-changes section.
- [x] UI displays summary stats from the report.

---

## Phase 6: Page previews + report layout polish

**User stories**: 5, 6, 7, 8, 28, 50, 51, 52, 53, 54

### What to build

Build the polished comparison experience around the working report: current and archived page previews, best-effort iframe handling, open-original links, fixed-height preview stage, sticky summary rail placeholder, and premium red dashboard layout. The report remains useful even when external pages block embedding.

### Acceptance criteria

- [ ] School page initially shows current page preview and snapshot/control area.
- [ ] After comparison loads, current and archived previews appear side by side on desktop.
- [ ] Page previews use fixed height around 70vh.
- [ ] If embedding fails or is blocked, UI shows a clear fallback state.
- [ ] Current and archived sources have open-original links.
- [ ] Diff report remains visible and usable regardless of iframe success.
- [ ] Sticky left summary rail appears on desktop after diff loads.
- [ ] Layout remains usable on mobile with stacked sections.
- [ ] Visual treatment stays premium red/news-style with school accents.

---

## Phase 7: React Query caching + manual refresh

**User stories**: 25, 26, 27, 30, 38

### What to build

Add client-side data behavior: one-hour React Query cache for diff results, no server cache, and manual refresh that invalidates cached data and triggers a fresh scrape. This makes the demo fast after first load while keeping refresh behavior explicit.

### Acceptance criteria

- [ ] Diff query uses one-hour stale time.
- [ ] Backend does not cache diff reports.
- [ ] Returning to a school within one hour uses cached frontend data.
- [ ] Manual refresh invalidates the school diff query.
- [ ] Manual refresh triggers a fresh backend scrape.
- [ ] Refresh button shows loading/disabled state while re-scraping.
- [ ] Cached errors can be retried via refresh.

---

## Phase 8: AI email draft + mailto deliverable

**User stories**: 28, 29, 30, 31, 32, 33, 34, 35, 36

### What to build

Add the AI-generated deliverable. Once top changes load, the frontend automatically requests an email draft from the backend. The backend uses Vercel AI SDK/OpenAI when configured and a deterministic fallback when not configured. The sticky summary rail displays the generated subject, summary, and Coaches Corner-style bullets, then offers a mailto CTA.

### Acceptance criteria

- [ ] Email draft request is enabled only after top changes are available.
- [ ] Email draft query uses one-hour frontend cache.
- [ ] `POST /api/schools/:schoolId/email-draft` accepts already-computed top changes and stats.
- [ ] Backend does not re-scrape when generating draft.
- [ ] AI prompt only uses scraped changes and school/snapshot context.
- [ ] Draft does not invent reasons, outside news, or unverifiable context.
- [ ] Draft returns subject, body, summary, and fallback flag.
- [ ] Missing AI key returns deterministic fallback draft.
- [ ] Draft body uses 2–5 concise `➤` bullets in Coaches Corner style.
- [ ] Sticky summary rail shows draft loading, success, and fallback badge states.
- [ ] Mailto CTA opens an encoded subject/body draft.

---

## Phase 9: Validation, tests, and demo readiness

**User stories**: 12, 13, 14, 15, 21, 22, 35, 37, 38, 39, 44, 45

### What to build

Harden the project for submission. Add behavior-focused tests for stable modules, verify deployed-env configuration, validate all three schools manually, and ensure errors are clear. Keep tests focused on diff/ranking/fallback/API behavior instead of brittle live-site internals.

### Acceptance criteria

- [ ] Diff engine tests cover added, removed, title changed, and contact changed.
- [ ] Name normalization tests cover case, punctuation, suffix/spacing, and conservative fuzzy behavior.
- [ ] Ranking tests prove senior staff changes outrank lower-priority contact-only changes.
- [ ] AI fallback tests prove deterministic draft shape and grounded content.
- [ ] API contract tests cover unknown school and structured scrape failure payloads.
- [ ] Frontend behavior is manually verified for home, school route, loading, error, report, AI draft, and mailto.
- [ ] All three schools are manually checked against current and archived sources.
- [ ] Web build passes.
- [ ] Server build passes.
- [ ] README or setup notes explain env vars, local dev, Vercel frontend deploy, and Render backend deploy.
