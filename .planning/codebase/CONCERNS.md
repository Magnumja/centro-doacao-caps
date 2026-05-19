# Codebase Concerns

**Analysis Date:** 2026-05-19

## Tech Debt

**Client-side admin session shadow state:**
- Issue: The authenticated session is stored in an `httpOnly` cookie on the API, but the frontend also stores and reads a `loggedHost` object in `localStorage` for navigation and dashboard state.
- Files: `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/components/Layout.tsx`, `src/services/auth-service.ts`, `server/src/routes/auth.ts`, `server/src/lib/session-cookie.ts`
- Impact: UI state can imply admin access even when the server cookie is absent or expired. The API still enforces auth, but navigation and local demo data can confuse operators and make auth bugs harder to diagnose.
- Fix approach: Treat `/api/auth/me` as the only source of truth for admin state. Use `localStorage` only for non-sensitive UI preferences, and make `src/components/Layout.tsx` derive the dashboard link from a server-backed auth hook or explicit loading state.

**Local/demo auth paths mixed into production-facing modules:**
- Issue: Local bypass behavior and demo admin state are embedded in regular frontend hooks and auth services instead of being isolated behind a development-only adapter.
- Files: `src/lib/auth.ts`, `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/services/auth-service.ts`, `server/src/middleware/auth.ts`, `server/src/config/env.ts`
- Impact: Production config validation blocks server-side bypass, but the frontend still includes bypass branches in the shipped bundle. This raises the chance of future regressions when login behavior changes.
- Fix approach: Move demo auth into a separate development-only module and keep runtime checks centralized. Preserve `server/src/config/env.ts` production guards and add tests around bypass-disabled login behavior.

**Mock and live data paths are tightly interleaved:**
- Issue: Public pages silently fall back to mock data when API calls fail, and admin summary cards still render static mock/project stats beside live API data.
- Files: `src/pages/CapsPage.tsx`, `src/pages/YourDonations.tsx`, `src/lib/needs.ts`, `src/pages/admin/Dashboard.tsx`, `src/data/mock.ts`, `src/data/mockData.ts`
- Impact: Outages can look like valid but stale content. Admin users may compare live donations/residents against static overview numbers and make incorrect operational decisions.
- Fix approach: Show explicit degraded states for API failures, reserve mock data for development fixtures, and remove `mockNeeds`/`projectStats` from admin production views.

**Large components concentrate unrelated workflows:**
- Issue: Multi-step donation UX, data loading, unit selection, form submission, and success overlay logic live in one page component. The admin dashboard similarly owns tabs, analytics, profile, residents, and request publishing in one file.
- Files: `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`, `src/components/ui/NewsCarousel.tsx`, `server/src/services/highlights-service.ts`
- Impact: Small UI changes have a broad blast radius and are harder to test in isolation. Future changes should avoid adding more state branches to these files.
- Fix approach: Extract focused hooks and child components under `src/hooks/`, `src/components/`, and page-local subcomponents. Keep API calls in `src/services/` and pass typed view models into presentational pieces.

**Type dependency drift is masked by permissive config:**
- Issue: Runtime dependencies use React 18 and React Router 7, while type packages include React 19 types and React Router DOM v5 types.
- Files: `package.json`, `package-lock.json`, `tsconfig.json`
- Impact: Builds currently pass, but mismatched type packages can create misleading compile errors or hide route/component typing bugs during future upgrades.
- Fix approach: Align `@types/react` and `@types/react-dom` with the installed React major, remove obsolete `@types/react-router-dom` for React Router 7, and keep `skipLibCheck` from becoming the only safety net.

**Generated/build artifacts and runtime logs are present in the working tree:**
- Issue: `dist/` and `codex-*.log` outputs exist locally; `.gitignore` excludes them, but they add noise to repo scans and can be mistaken for source during manual review.
- Files: `dist/`, `codex-dev.log`, `codex-vite.err.log`, `.gitignore`
- Impact: Local artifacts can obscure real diffs and make size/performance checks harder to interpret.
- Fix approach: Keep generated artifacts out of commits and run concern scans with `dist/`, `node_modules/`, and log files excluded.

## Known Bugs

**Profile action buttons do nothing:**
- Symptoms: The admin profile screen renders "Editar perfil" and "Alterar senha" buttons without handlers, routes, disabled state, or explanatory state.
- Files: `src/pages/admin/Dashboard.tsx`
- Trigger: Open `/admin/dashboard`, select the profile tab, and click either profile action.
- Workaround: Not detected; profile and password changes are not exposed in the current UI.

**Frontend only allows two need priorities while the API supports three:**
- Symptoms: The admin create-need form can submit `media` or `alta`, but not `baixa`, even though `NeedsService.create` and the Prisma enum support `baixa`.
- Files: `src/pages/admin/Dashboard.tsx`, `server/src/services/needs-service.ts`, `server/prisma/schema.prisma`, `server/src/services/needs-service.test.ts`
- Trigger: Use the admin "Solicitar Doacoes" form and try to create a low-priority need.
- Workaround: Create low-priority needs through backend/API code paths rather than the current dashboard form.

**Text encoding is inconsistent in some source literals:**
- Symptoms: Some source strings contain mojibake-style text such as the `anonymousDonation` union value and several Portuguese literals/comments.
- Files: `src/services/donations-service.ts`, `server/package.json`, `server/src/services/highlights-service.ts`, `server/prisma/schema.prisma`
- Trigger: Render affected strings or edit files with a UTF-8-aware editor after text has been double-encoded.
- Workaround: Prefer ASCII in new code or normalize affected files to UTF-8 in a dedicated cleanup change.

## Security Considerations

**Donor and resident personal data has no explicit retention or export boundary:**
- Risk: Donation records can store donor names/emails, resident records can store names/emergency contacts, and donor intentions can also persist in browser `localStorage`.
- Files: `server/prisma/schema.prisma`, `server/src/repositories/donations-repository.ts`, `server/src/routes/residents.ts`, `src/services/donor-intentions-service.ts`, `src/pages/YourDonations.tsx`
- Current mitigation: Anonymous donations clear donor name/email before database insert; resident routes require auth; donation listing requires auth; local donor intentions can be removed by id.
- Recommendations: Define retention/deletion rules, document what PII is collected, add admin deletion/export flows where required, and avoid storing donor email in browser state longer than needed.

**Public donation endpoint accepts unauthenticated writes:**
- Risk: Anyone can create donation records for any valid unit slug, so spam or junk operational records are possible.
- Files: `server/src/routes/donations.ts`, `server/src/services/donations-service.ts`, `server/src/app.ts`, `server/src/config/security.ts`
- Current mitigation: Zod validation, JSON-only body enforcement, trusted-origin/CSRF header checks in production, and a donation-specific rate limit.
- Recommendations: Add abuse monitoring, consider CAPTCHA or email verification for public donation submissions, and add tests for rate-limit/origin behavior around `/api/donations`.

**CSRF model depends on exact frontend and proxy configuration:**
- Risk: Cookie auth uses cross-origin credentials, and unsafe methods require a trusted origin plus `X-CSRF-Protection` in production. Misconfigured `FRONTEND_URL`, `TRUST_PROXY`, or cookie SameSite settings can block legitimate traffic or weaken origin checks.
- Files: `server/src/config/security.ts`, `server/src/lib/session-cookie.ts`, `server/src/config/env.ts`, `server/src/app.ts`, `src/lib/api.ts`, `DEPLOYMENT.md`
- Current mitigation: Production startup validates `FRONTEND_URL`, HTTPS origins, cookie SameSite values, and bypass flags.
- Recommendations: Add integration tests for production-like CORS/CSRF/cookie combinations and keep deployment docs synchronized with API config.

**Local auth bypass is intentionally powerful:**
- Risk: When enabled in development, loopback requests can become admin without a password.
- Files: `server/src/middleware/auth.ts`, `server/src/routes/auth.ts`, `server/src/config/env.ts`, `src/lib/auth.ts`, `src/hooks/useAdminLogin.ts`
- Current mitigation: Server bypass requires `ENABLE_LOCAL_AUTH_BYPASS=true`, `NODE_ENV=development`, local hostname, and loopback remote address; production startup rejects bypass flags.
- Recommendations: Keep bypass disabled by default in shared dev/staging environments and add explicit automated checks that production builds set `VITE_ENABLE_LOCAL_AUTH_BYPASS=false`.

## Performance Bottlenecks

**News highlights fan out to many RSS searches on cache miss:**
- Problem: `HighlightsService.listPublic()` builds one RSS feed URL per search term and waits for all settled fetches before responding.
- Files: `server/src/services/highlights-service.ts`, `server/src/routes/highlights.ts`
- Cause: Parallel `Promise.allSettled` over all search terms plus an 8-second per-feed timeout means a cold `/api/highlights` request can wait on the slowest feed.
- Improvement path: Pre-fetch highlights on a background interval, cap concurrent feed requests, lower timeout after measuring real latency, and persist/cache feed results outside process memory.

**Dashboard fetches unpaginated public needs then filters client-side:**
- Problem: Admin dashboard loads all public needs, all current-unit donations, and residents in parallel, then filters needs in the browser.
- Files: `src/services/dashboard-service.ts`, `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts`, `server/src/routes/residents.ts`
- Cause: `/api/needs` supports pagination but `fetchDashboardCollections()` calls the unpaginated endpoint and filters by unit in frontend code.
- Improvement path: Add a unit-scoped dashboard endpoint or call `/api/needs?paginate=true&unitId=...` and keep server-side pagination for growing data.

**Large raster assets are duplicated and one image dominates build weight:**
- Problem: The same images are stored under both `public/` and `src/public/`; `capsdrafatima.jpg` is about 1.67 MB in each location and is emitted into the frontend build.
- Files: `public/capsdrafatima.jpg`, `src/public/capsdrafatima.jpg`, `public/`, `src/public/`
- Cause: Static files are duplicated between Vite public assets and imported source assets.
- Improvement path: Keep one canonical asset location, compress/resize large images, and add an image-size check for committed public assets.

**Telemetry is in-memory and process-local:**
- Problem: Events are capped at 1000 and stored in a process array; summary data is lost on restart and inconsistent across multiple API instances.
- Files: `server/src/services/telemetry-service.ts`, `server/src/routes/telemetry.ts`, `src/services/telemetry-service.ts`
- Cause: Telemetry is implemented as a lightweight singleton service rather than a durable store or observability integration.
- Improvement path: Keep this only for local diagnostics, or move production telemetry to a database/table, log sink, or metrics service with retention limits.

## Fragile Areas

**Admin dashboard combines live and static concepts:**
- Files: `src/pages/admin/Dashboard.tsx`, `src/components/AdminDashboard.tsx`, `src/data/mock.ts`, `src/hooks/useDashboardData.ts`
- Why fragile: It mixes live API collections with static stats and mock needs, while also owning tab state, form state, analytics calculations, and residents filtering.
- Safe modification: Extract one tab at a time into separate components and pass only typed props from `useDashboardData()`. Avoid adding more API calls directly to `Dashboard.tsx`.
- Test coverage: No frontend tests are present for dashboard rendering, auth redirects, or failed API states.

**Donation flow spans form UI, API writes, and local browser history:**
- Files: `src/pages/CapsPage.tsx`, `src/services/donations-service.ts`, `src/services/donor-intentions-service.ts`, `server/src/services/donations-service.ts`, `server/src/routes/donations.ts`
- Why fragile: A single submit writes one API donation per selected item and also saves a donor intention locally. Partial API failures can leave backend and browser history out of sync.
- Safe modification: Introduce a batch donation endpoint or explicit client transaction state, then test multi-item success and partial failure paths.
- Test coverage: Backend unit tests cover pagination but do not cover donation creation validation, multi-item submission, anonymous behavior, or partial failures.

**Public fallback data can hide API outages:**
- Files: `src/pages/CapsPage.tsx`, `src/pages/YourDonations.tsx`, `src/lib/needs.ts`, `server/src/index.ts`, `server/src/data/public-fallback.ts`
- Why fragile: The frontend falls back to mock data on fetch failure, and the backend flips to `API_MOCK_MODE` in local development when the database is unavailable.
- Safe modification: Keep local backend fallback, but surface API failure banners in production frontend paths and log fetch failures.
- Test coverage: No tests assert fallback/degraded UI behavior.

**Highlights service parses and sanitizes remote XML manually:**
- Files: `server/src/services/highlights-service.ts`, `server/src/services/highlights-service.test.ts`
- Why fragile: RSS item shape is treated as `any`, HTML is stripped with regex, and image extraction trusts remote item fields after only basic URL checks.
- Safe modification: Add typed RSS normalization helpers, validate extracted image URLs, and keep tests for malformed XML, large feeds, redirects, and unexpected item shapes.
- Test coverage: One service test covers a happy-path RSS filter, but malformed feed and timeout behavior are not covered.

## Scaling Limits

**Database query patterns assume modest row counts:**
- Current capacity: Pagination exists for donations and optional needs pages, but residents listing and dashboard needs loading are unpaginated.
- Limit: Large resident lists or many public needs increase response size and client rendering work.
- Scaling path: Add pagination/search parameters to `server/src/routes/residents.ts`, use `NeedsService.listPaginated()` from dashboard flows, and add database indexes for frequent filters such as `unitId`, `priority`, and `registeredAt`.

**Single-process in-memory services do not scale horizontally:**
- Current capacity: Highlights edits and telemetry summaries live in memory.
- Limit: Multiple API instances will have divergent highlights and telemetry, and restarts discard admin-created highlights.
- Scaling path: Persist highlights and telemetry summaries in PostgreSQL or an external service before running multiple API replicas.

## Dependencies at Risk

**React and router type packages:**
- Risk: Type packages do not match runtime majors.
- Impact: Future TypeScript upgrades can surface noisy or misleading errors around React components and route APIs.
- Migration plan: Align `@types/react`/`@types/react-dom` with React 18 or upgrade runtime React intentionally; remove `@types/react-router-dom` because React Router 7 ships its own types.

**Prisma package range drift:**
- Risk: `server/package.json` declares `@prisma/client` and `prisma` as `^5.13.0`, while installed generation reports Prisma Client `v5.22.0`.
- Impact: Minor Prisma upgrades can affect generated client behavior, SQL, or migration tooling without an explicit package manifest change.
- Migration plan: Pin Prisma versions when stability matters, update both packages together, and run `npm --prefix server run build` plus service tests after upgrades.

**No production vulnerability findings from current audit:**
- Risk: Not detected in production dependency audit on 2026-05-19.
- Impact: `npm audit --omit=dev --audit-level=moderate` and `npm --prefix server audit --omit=dev --audit-level=moderate` reported `0 vulnerabilities`.
- Migration plan: Keep audit in CI or release checks.

## Missing Critical Features

**Admin account management is not implemented:**
- Problem: The UI exposes profile/password buttons, but there are no corresponding frontend handlers or API routes for profile update/password change.
- Blocks: Hosts cannot rotate credentials or update contact data through the product.

**Operational moderation for public donations is limited:**
- Problem: Admin users can list and delete donations, but there is no status workflow for confirmed, scheduled, delivered, rejected, or spam records.
- Blocks: Donation lifecycle tracking and spam triage remain manual.

**Resident management is API-only beyond listing:**
- Problem: Backend routes support create/update/delete residents, but the dashboard only lists and filters residents.
- Blocks: Admin users cannot maintain resident data through the frontend.

## Test Coverage Gaps

**Route-level security and auth middleware:**
- What's not tested: CORS origin rejection, CSRF header enforcement, cookie options, local bypass constraints, login/logout, and admin-only route behavior.
- Files: `server/src/config/security.ts`, `server/src/middleware/auth.ts`, `server/src/routes/auth.ts`, `server/src/routes/telemetry.ts`, `server/src/routes/highlights.ts`
- Risk: Production security behavior can regress while service unit tests still pass.
- Priority: High

**Donation creation and donor privacy behavior:**
- What's not tested: Zod validation for donation writes, anonymous donor clearing, unknown unit slug errors, delete authorization, and multi-item frontend submission.
- Files: `server/src/services/donations-service.ts`, `server/src/repositories/donations-repository.ts`, `src/services/donations-service.ts`, `src/pages/CapsPage.tsx`
- Risk: Donor PII handling or donation writes can break unnoticed.
- Priority: High

**Frontend auth and degraded API states:**
- What's not tested: Login failure, bypass disabled/enabled branches, dashboard redirect on expired cookies, public mock fallbacks, and local storage cleanup.
- Files: `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/components/Layout.tsx`, `src/pages/CapsPage.tsx`, `src/pages/YourDonations.tsx`
- Risk: Users can see stale or misleading UI when the API is unavailable or their session expires.
- Priority: Medium

**Performance-sensitive integrations:**
- What's not tested: RSS feed timeout behavior, oversized feed rejection, duplicate item handling, telemetry payload limits, and image fallback behavior.
- Files: `server/src/services/highlights-service.ts`, `server/src/services/telemetry-service.ts`, `src/components/ui/NewsCarousel.tsx`
- Risk: External feed changes or large payloads can slow public endpoints or degrade the homepage without failing tests.
- Priority: Medium

## Verification Signals

- `npm run build` passes for the frontend build.
- `npm --prefix server run build` passes for Prisma generation and TypeScript compilation.
- `npm --prefix server run test:unit` passes 7 backend service tests.
- `npm audit --omit=dev --audit-level=moderate` reports 0 production vulnerabilities.
- `npm --prefix server audit --omit=dev --audit-level=moderate` reports 0 production vulnerabilities.

---

*Concerns audit: 2026-05-19*
