# PRD: Better VPing

## Problem Statement

College.town currently uses Visualping to monitor athletics staff directories for meaningful changes. The candidate trial project needs a small but real replacement that demonstrates day-one capabilities: scraping dynamic websites, comparing current athletics staff directory pages against archived Wayback Machine snapshots, surfacing meaningful staff changes, and generating short email-ready summaries in the voice of Coaches Corner.

The product should not be a generic visual diff. It should identify actual staff directory changes: additions, removals, title changes, and contact changes for coaches, coordinators, directors, and other senior athletics staff. Because multi-year snapshots may contain many changes, the product must prioritize the 5–10 most meaningful changes per school while still allowing broader inspection.

## Solution

Build **Better VPing**, a premium red/news-style web dashboard with three predefined schools: Georgia, Virginia Tech, and Wittenberg.

The frontend is a React app deployed to Vercel. It presents a full-screen three-panel school hub. Selecting a school opens a comparison page with embedded page previews, automatic scraping/diff loading, ranked meaningful changes, raw current/old staff data, and an AI-generated email draft.

The backend is a Hono API deployed to Render. It uses Playwright to scrape current and archived staff directories server-side, avoiding browser CORS limitations and demonstrating real scraping capability. The scraper extracts structured staff records with `name`, `title`, `phone`, and `email`, compares current vs archived records, ranks changes by meaningfulness, and returns both staff lists and diff data. The backend also uses Vercel AI SDK with OpenAI to generate Coaches Corner-style email drafts from the top changes. If no AI key is configured, it returns a deterministic fallback draft and indicates fallback mode.

## User Stories

1. As a College.town reviewer, I want to open a polished home page with the three predefined schools, so that I can quickly understand the scope of the monitoring demo.
2. As a College.town reviewer, I want each school to have its own route, so that I can deep-link directly to a school comparison.
3. As a user, I want to select Georgia, Virginia Tech, or Wittenberg, so that I can inspect staff changes for that school.
4. As a user, I want the app to automatically compare the current staff directory against the predefined archived snapshot, so that I immediately see useful output without configuring anything.
5. As a user, I want the current page shown in an iframe-like preview, so that I can visually confirm which source page is being monitored.
6. As a user, I want the archived Wayback page shown alongside the current page after comparison begins, so that I can visually inspect both source pages.
7. As a user, I want iframe previews to degrade gracefully if a site blocks embedding, so that the report remains usable even when the visual preview fails.
8. As a user, I want links to open the original current and archived pages, so that I can inspect sources directly.
9. As a user, I want the scraper to run server-side, so that external site CORS restrictions do not break scraping.
10. As a reviewer, I want the backend to use Playwright, so that the project demonstrates real dynamic scraping rather than only static HTML parsing.
11. As a user, I want the scraper to extract staff names, titles, phone numbers, and emails, so that the diff is based on structured directory data.
12. As a user, I want scraper failures to be loud and visible, so that bad or empty data is not silently presented as a successful report.
13. As a user, I want timeout failures to clearly identify the failed scrape, so that I understand whether the current page or archived page failed.
14. As a user, I want the app to detect added staff, removed staff, title changes, and contact changes, so that I can see the full range of directory changes.
15. As a user, I want changes to be ranked by importance, so that head coaches, coordinators, directors, and senior staff appear before less meaningful changes.
16. As a user, I want to see 5–10 meaningful changes first, so that the report is concise and aligned with the candidate brief.
17. As a user, I want to optionally view all detected changes, so that I can audit beyond the top ranked results.
18. As a user, I want each diff card to show before and after values, so that I can understand exactly what changed.
19. As a user, I want each diff card to include a short explanation of why the change matters, so that the report reads like intelligence rather than raw data.
20. As a user, I want contact changes detected but ranked lower than staff/title changes, so that phone and email updates are captured without overwhelming important staff movement.
21. As a user, I want conservative fuzzy matching for staff names, so that minor name formatting differences do not create excessive false additions/removals.
22. As a user, I want false matches avoided, so that the report does not incorrectly merge different people.
23. As a user, I want raw current and archived staff lists returned by the API, so that I can inspect scraped data and debug parser quality.
24. As a user, I want summary stats returned by the API, so that I can see how many records and changes were detected.
25. As a user, I want the frontend to cache diff results for one hour with React Query, so that repeated page loads are fast and avoid unnecessary scraping.
26. As a user, I want a manual refresh action, so that I can force a fresh backend scrape when needed.
27. As a user, I want the backend not to maintain its own data cache, so that source freshness is controlled by the client cache and refresh behavior.
28. As a user, I want a sticky AI summary section to appear once diff data loads, so that the most important narrative remains visible while scrolling.
29. As a user, I want the AI email draft to generate automatically after diff data loads, so that the final deliverable is immediately visible.
30. As a user, I want AI email drafts cached on the frontend for one hour, so that reloads do not repeatedly spend model tokens.
31. As a user, I want a mailto CTA after the draft is ready, so that I can open an email draft with subject and body prefilled.
32. As a user, I want the email draft to match Coaches Corner style, so that it feels like the provided examples.
33. As a user, I want the AI draft to avoid invented facts, so that it does not claim reasons or context not present in scraped changes.
34. As a user, I want the AI draft to use only scraped changes, so that it remains grounded and reliable.
35. As a user, I want a deterministic fallback draft when no AI key is configured, so that the demo still works locally.
36. As a reviewer, I want the backend AI endpoint to receive already-computed changes instead of re-scraping, so that email generation is efficient.
37. As a developer, I want the frontend and backend split into separate deployable apps, so that Vercel can host React and Render can host the Playwright API.
38. As a developer, I want frontend environment configuration for the API base URL, so that local and deployed environments can call the correct backend.
39. As a developer, I want backend CORS restricted by an allowed-origin environment variable, so that local and Vercel origins are supported without opening the API unnecessarily.
40. As a developer, I want separate frontend and backend package files, so that each deploy installs only its required dependencies.
41. As a developer, I want root convenience scripts for install, build, and dev tasks, so that local workflow remains simple.
42. As a developer, I want the backend to use Hono, so that the API remains small and fast.
43. As a developer, I want the backend to use Node with tsx for development and tsc for builds, so that deployment is standard and compatible with Playwright.
44. As a developer, I want strict TypeScript in both frontend and backend, so that API and data-shape bugs are caught early.
45. As a developer, I want a Dockerfile for Render based on a Playwright Docker image, so that browser dependencies are reliable in production.
46. As a developer, I want Playwright to scrape current and archived pages sequentially on Render, so that CPU and memory spikes are reduced on a cheap/small instance.
47. As a developer, I want a reusable browser helper only if it stays simple, so that performance improves without making maintenance hard.
48. As a developer, I want concise API error payloads instead of server logs/debug artifacts, so that failures are visible to the frontend without saving HTML/screenshots.
49. As a developer, I want no debug artifact files and no backend logging, so that the implementation stays clean and avoids noisy output.
50. As a user, I want the visual design to feel like a premium red news dashboard, so that the project feels productized rather than like a raw coding exercise.
51. As a user, I want official school colors represented through accents and CSS monograms, so that schools are recognizable without using logos.
52. As a user, I want the home page to fill the viewport with three dramatic school panels, so that the initial experience is clear and memorable.
53. As a user, I want fixed-height page previews around 70vh, so that large external staff pages do not overwhelm the comparison UI.
54. As a user, I want neutral diff cards rather than noisy type-specific color coding, so that the premium red dashboard style stays consistent.
55. As a reviewer, I want the project scope limited to three predefined schools and predefined archived snapshots, so that the solution stays focused and shippable.

## Implementation Decisions

- **Product name**: Better VPing.
- **Primary goal**: demonstrate dynamic scraping, meaningful staff-directory diffing, and AI-generated email summaries.
- **Frontend deployment**: Vercel.
- **Backend deployment**: Render.
- **Frontend framework**: React with TypeScript and Vite.
- **Frontend data fetching/cache**: React Query with one-hour stale time for diff and email-draft queries.
- **Frontend styling**: Tailwind CSS only; no shadcn/component library.
- **Visual direction**: premium red/news dashboard.
- **Home route**: `/` with three full-screen school panels.
- **School route**: `/schools/:schoolId` using route params, not query params.
- **School set**: Georgia, Virginia Tech, Wittenberg.
- **School branding**: official color accents and CSS monograms only; no logos.
- **Snapshots**: data model supports multiple snapshots per school, but each school initially has one default archived Wayback snapshot.
- **Default archived sources**:
  - Georgia 2022 Wayback page.
  - Virginia Tech 2022 Wayback page.
  - Wittenberg 2021 Wayback page.
- **Comparison behavior**: auto-run default comparison on school page load.
- **Preview behavior**: live iframes/page previews are best effort and not required for report correctness.
- **Iframe fallback**: show clear blocked/error state plus open-original links.
- **Comparison UI**: initially current preview plus snapshot/control panel; after diff, current and archived previews side by side; diff cards below; sticky AI summary rail on desktop.
- **Preview height**: fixed around 70vh; no synchronized scrolling in v1.
- **Backend framework**: Hono.
- **Scraping runtime**: Playwright server-side.
- **Scraping approach**: render pages with Playwright and extract structured DOM data; use school-specific parser logic with generic fallback.
- **Scrape order**: sequential current then archived page to reduce resource spikes on cheap Render instance.
- **Scrape timeout**: 25 seconds per page.
- **Backend caching**: none.
- **Client caching**: React Query caches diff and email draft for one hour.
- **Manual refresh**: invalidates React Query cache and causes fresh backend scrape.
- **Staff record model**: `name`, `title`, optional `phone`, optional `email`.
- **Diff types**: added staff, removed staff, title changed, contact changed.
- **Matching strategy**: exact normalized name first, conservative fuzzy fallback for minor formatting differences; avoid risky false matches.
- **Ranking strategy**: prioritize seniority and role importance. Head coaches, athletic directors, directors, coordinators, senior/associate/assistant AD roles, and coaches outrank low-priority contact-only changes.
- **Top changes**: show top 5–10, default target top 8.
- **All changes**: provide expandable all-detected-changes view.
- **Contact changes**: detect and include, but rank lower unless attached to senior staff.
- **Diff card content**: show change type, name, before box, after box, and a short explanation.
- **Diff card colors**: neutral visual treatment; no type-specific color coding.
- **API response**: return school metadata, source URLs, scrape timestamp, current staff list, archived staff list, all changes, top changes, and stats.
- **Failure handling**: if a scraper returns zero records, API fails loudly with a structured error and frontend shows clear failure UI.
- **Error payloads**: include error code, school, URL when relevant, and human-readable message/hint.
- **Debugging**: no saved HTML, no screenshots, no backend logs.
- **AI provider**: Vercel AI SDK with OpenAI provider.
- **AI model config**: model name from environment, defaulting to a small/free/cheap model where practical.
- **AI key**: server-side environment variable only; never exposed to frontend.
- **AI draft endpoint**: accepts top changes and stats from frontend via POST; does not re-scrape.
- **AI draft timing**: generated automatically after diff loads, using React Query cache.
- **AI prompt constraints**: use only scraped changes; no invented context, no unverifiable reasons, no outside news fetching.
- **AI draft format**: JSON with subject, body, summary, and fallback indicator if relevant.
- **Email style**: 2–5 concise Coaches Corner-style bullets using `➤`.
- **Email CTA**: after draft is ready, create `mailto:` URL with encoded subject and body.
- **Fallback draft**: deterministic Coaches Corner-style draft if no AI key is configured.
- **Repo structure**: frontend in `web/`, backend in `server/`.
- **Package structure**: separate `web/package.json` and `server/package.json`; no npm workspaces.
- **Root scripts**: convenience scripts for install, build, and dev for both web and server.
- **Package manager**: npm.
- **Server build**: Node runtime, tsx for dev, tsc for build, node for start.
- **TypeScript**: strict mode for both apps.
- **CORS**: backend allows origins from environment allowlist, including local Vite and deployed Vercel app.
- **Render deploy**: Dockerfile based on official Playwright image and pinned Playwright npm dependency to match image tag.

## Proposed Modules

- **School catalog module**: owns school metadata, current URLs, archived snapshot URLs, color accents, monograms, and default snapshot selection.
- **Scraper module**: exposes a simple interface for scraping one school/source into structured staff records. Encapsulates Playwright navigation, timeout behavior, DOM extraction, cleanup, and parser fallback logic.
- **School parser modules**: encapsulate school-specific staff extraction rules behind the scraper interface.
- **Generic parser fallback module**: attempts extraction from common table/card/text patterns when school-specific selectors fail.
- **Diff engine module**: compares current and archived staff records, handles name normalization/fuzzy matching, emits added/removed/title/contact changes, and computes stats.
- **Ranking module**: scores changes by role seniority and change type, selecting top 5–10 meaningful changes.
- **AI draft module**: converts top changes into grounded Coaches Corner-style subject/body/summary using Vercel AI SDK, with deterministic fallback behavior.
- **API module**: exposes health, schools, diff, and email-draft endpoints with structured errors and CORS handling.
- **Frontend API client module**: centralizes API base URL, request helpers, and frontend-side error parsing.
- **Frontend query module**: owns React Query keys, stale times, refresh behavior, and dependent email-draft query enablement.
- **Home experience module**: full-screen school panel dashboard.
- **Comparison experience module**: route-param school page, page previews, scrape loading/error states, diff cards, raw lists, AI summary rail, and email CTA.

## API Contracts

### `GET /api/health`

Returns API health status.

### `GET /api/schools`

Returns predefined school metadata, current URLs, default snapshot metadata, school colors, and monograms.

### `GET /api/schools/:schoolId/diff`

Scrapes current and default archived snapshot, computes diff, and returns report data.

Optional future query parameter: `snapshotId`, for schools with multiple archived snapshots.

Response includes:

- school identifier and display name
- current URL
- archived snapshot URL and label
- scrape timestamp
- current staff records
- archived staff records
- all detected changes
- top ranked changes
- stats such as current count, archived count, added count, removed count, title-change count, contact-change count

Failure behavior:

- Empty scrape returns a structured error instead of fake/empty success.
- Timeout returns a structured timeout error.
- Unknown school returns a structured not-found error.

### `POST /api/schools/:schoolId/email-draft`

Accepts already-computed top changes and stats. Returns an AI-generated or fallback email draft.

Request includes:

- top changes
- stats
- school name
- snapshot label

Response includes:

- subject
- body
- summary
- fallback boolean

## Testing Decisions

Testing should focus on external behavior and stable module interfaces, not implementation details or brittle DOM internals.

Recommended test coverage:

- **Diff engine tests**: verify added, removed, title changed, and contact changed outputs from old/current staff arrays.
- **Name normalization tests**: verify punctuation/case/suffix handling and conservative fuzzy matching behavior.
- **Ranking tests**: verify head coaches/directors/coordinators outrank lower-priority contact-only changes.
- **AI fallback draft tests**: verify deterministic fallback returns subject/body/summary and does not invent facts.
- **API contract tests**: verify unknown school, empty scrape, and successful diff response shapes.
- **Frontend behavior tests if time allows**: verify home page school links, diff loading/error states, and mailto generation from a draft.

Playwright live scraping tests should be limited or optional because external sites and Wayback can be flaky. Parser tests should prefer saved representative snippets only if later introduced; for now, live scraper success can be verified manually during development.

## Out of Scope

- Monitoring schedules or recurring background jobs.
- User authentication.
- User-created schools or arbitrary URLs.
- Persistent database storage.
- Server-side cache.
- Historical timeline across many snapshots.
- Visual pixel diffing.
- Website color/style change detection.
- External news search or enrichment.
- Claims about why staff changes happened unless present in scraped data.
- Real email sending.
- Logo usage or hotlinked school assets.
- Synchronized iframe scrolling.
- Saved debug artifacts such as screenshots or HTML dumps.
- Backend logging.

## Further Notes

The project should optimize for a polished, demoable candidate submission. The main proof points are:

1. Real server-side scraping with Playwright.
2. Meaningful structured diffing rather than raw HTML diffing.
3. Clear ranking of staff changes by importance.
4. Clean React UI with school-specific pages and polished report presentation.
5. AI-generated email drafts grounded in scraped changes.
6. Deployment-aware architecture: Vercel frontend, Render backend, CORS allowlist, Playwright Docker image.

Because the source pages and Wayback snapshots may be slow or inconsistent, the app must make loading and error states feel intentional. It is better to fail loudly than to present questionable data.
