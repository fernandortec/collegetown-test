# Plan: 10+ More Hours / Final Product Polish

> Builds on `plans/better-vping-plan.md` after demo-ready Phase 9.

- [ ] Add backend caching for successful diff reports per school/snapshot.
- [ ] Run a daily cron scrape for every school and default snapshot.
- [ ] If daily scrape JSON matches previous JSON, keep cached result and update freshness metadata only.
- [ ] If daily scrape JSON changes, store new report and mark it as updated.
- [ ] Let manual refresh bypass cache and force a fresh scrape.
- [ ] Add better staff-count metrics, e.g. `410 current / 358 archived`.
- [ ] Track staff counts over time and flag suspicious drops or spikes.
- [ ] Use per-school expected count ranges instead of exact hardcoded counts.
- [ ] Add scrape confidence/status labels so users know when extraction looks healthy.
- [ ] Keep sanitized HTML/text snapshots for up to 7 days for debugging.
- [ ] Store failed scrape artifacts too, so bugs are easier to inspect.
- [ ] Remove secrets, cookies, and unrelated personal data from saved debug artifacts.
- [ ] Spend 1–2 days writing automated tests with AI help.
- [ ] Add tests for diff engine, ranking, fuzzy name matching, API errors, email fallback, caching, cron, and scrape failures.
- [ ] Add more than one Wayback snapshot per school.
- [ ] Add a snapshot picker on the school report page.
- [ ] Compare current vs archive and archive vs archive, e.g. `2022 → 2023`.
- [ ] Save source URLs and scrape timestamps for every comparison.
- [ ] Add fallback selectors for important extracted fields: name, title, email, phone, department/team.
- [ ] Improve iframe/page preview reliability with compliant fallbacks.
- [ ] Show screenshot, blocked-preview message, and open-original link when a site blocks embedding.
- [ ] Add search to find specific people in current staff, archived staff, and changes.
- [ ] Add filters for added, removed, title changed, contact changed, and seniority.
- [ ] Add export options: CSV for staff/change data and PDF/share link for reports.
- [ ] Add evidence snippets or source links for high-impact changes.
- [ ] Improve email quality with stronger models/prompts and better Coaches Corner-style summaries.
- [ ] Add saved recipient lists for generated email reports.
- [ ] Add preview/approval before sending any automated email.
- [ ] Track sent email status, subject, body, recipients, and generated timestamp.
- [ ] Add unsubscribe/compliance notes before sending to real user lists.
- [ ] Document technical decisions: Playwright scraping, AI extraction, diff ranking, caching, cron, deployment.
- [ ] Update README with env vars, local dev, Vercel frontend deploy, Render backend deploy, and scheduled-job setup.
- [ ] Add auth so users can save schools, snapshots, recipient lists, and reports.
- [ ] Add alerts so users are notified only when meaningful high-rank changes appear.
- [ ] Add admin controls for school URLs, snapshots, expected count ranges, and scrape health.
- [ ] Add audit trail for every generated report and email.
- [ ] Do final accessibility, mobile, and visual polish pass before launch.

## Tech Stack & Tools Used

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **State/Routing:** React Query, React Router
- **Validation:** Zod

### Backend (API)
- **Framework:** Hono (Node Server)
- **Scraping:** Playwright
- **AI/Extraction:** Vercel AI SDK (`@ai-sdk/google`)
- **Validation:** Zod

### Infrastructure & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Fly.io (Docker, handles Playwright size + scale-to-zero)
- **Containerization:** Docker
