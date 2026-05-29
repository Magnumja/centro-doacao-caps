# Codebase Concerns

**Analysis Date:** 2026-05-29

## Tech Debt

**Mock and fallback data remain in runtime paths:**
- Issue: Public and admin UI paths still depend on mock data as runtime fallback instead of a clearly isolated development fixture path.
- Files: `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`, `src/components/CapsMap.tsx`, `src/lib/needs.ts`, `src/data/mock.ts`, `src/data/mockData.ts`, `server/src/controllers/needs-controller.ts`, `server/src/routes/units.ts`, `server/src/index.ts`
- Impact: Backend outages, schema mismatches, or empty API responses can be hidden behind mock content; admin dashboard summaries mix persisted data with static `projectStats`/`mockNeeds`.
- Fix approach: Keep fixtures under a development-only boundary, gate all fallback mode through one typed config helper, and surface API failure states in production UI instead of silently substituting `src/data/mockData.ts`.

**In-memory highlight management:**
- Issue: Admin-created highlights are stored in a process-local `Map`, not in PostgreSQL.
- Files: `server/src/services/highlights-service.ts`, `server/src/routes/highlights.ts`
- Impact: Highlight create/update/delete changes disappear on process restart and diverge across multiple server instances.
- Fix approach: Add a Prisma `Highlight` model in `server/prisma/schema.prisma`, move CRUD persistence into a repository, and keep RSS cache separate from stored editorial highlights.

**In-memory telemetry store:**
- Issue: Telemetry events are stored in a process-local array capped at 1000 records.
- Files: `server/src/services/telemetry-service.ts`, `server/src/routes/telemetry.ts`
- Impact: Analytics reset on restart, do not aggregate across instances, and cannot support historical reporting.
- Fix approach: Persist summarized telemetry or raw events in PostgreSQL with retention rules, or send events to an external analytics service through a dedicated adapter.

**Large page and stylesheet files:**
- Issue: Several files combine many responsibilities and are difficult to modify safely.
- Files: `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`, `src/Styles/CapsPage.css`, `src/Styles/Dashboard.css`, `src/Styles/Home.css`, `server/src/services/highlights-service.ts`
- Impact: UI behavior, data loading, form state, presentation, and analytics calculations are tightly coupled, increasing regression risk for small UI changes.
- Fix approach: Split pages into feature components and hooks, split CSS by component/feature, and extract highlight RSS fetching/parsing from `server/src/services/highlights-service.ts`.

**Frontend API contract relies on `any`:**
- Issue: The frontend API wrapper and dashboard normalization parse unknown JSON into `any` before mapping.
- Files: `src/lib/api.ts`, `src/services/dashboard-service.ts`, `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`
- Impact: Backend contract drift is discovered at runtime; missing fields can render empty UI or incorrect dashboard metrics without a compile-time failure.
- Fix approach: Add shared DTO types or response validators, replace `api.get<any[]>` and `catch (err: any)` with typed results, and keep endpoint response shapes documented next to `server/src/services/*.ts`.

**Direct Prisma access is mixed with service/repository layers:**
- Issue: Some routes call Prisma directly while needs/donations use service and repository classes.
- Files: `server/src/routes/auth.ts`, `server/src/routes/units.ts`, `server/src/routes/residents.ts`, `server/src/services/needs-service.ts`, `server/src/repositories/needs-repository.ts`, `server/src/services/donations-service.ts`, `server/src/repositories/donations-repository.ts`
- Impact: Authorization, validation, selection shaping, and error handling patterns are inconsistent across endpoints.
- Fix approach: Move `auth`, `units`, and `residents` data access into service/repository modules following `server/src/services/needs-service.ts` and `server/src/repositories/needs-repository.ts`.

## Known Bugs

**Donation registration can partially succeed:**
- Symptoms: A multi-item donation submits one POST per selected item with `Promise.all`; if one request fails after another succeeds, the user sees a failure while partial donation records remain in the database.
- Files: `src/services/donations-service.ts`, `src/pages/CapsPage.tsx`, `server/src/routes/donations.ts`, `server/src/services/donations-service.ts`
- Trigger: Select multiple items on `src/pages/CapsPage.tsx`, then encounter a network/API failure after at least one `/api/donations` request succeeds.
- Workaround: Manual cleanup through the authenticated donation list and delete endpoint in `server/src/routes/donations.ts`.

**Admin dashboard can lose real unit identity:**
- Symptoms: The dashboard resolves `hostCaps` from static mock units using `loggedHost.capId`; real backend sessions return `capId` from `unit.slug`, while dashboard display data remains tied to `src/data/mock.ts`.
- Files: `src/pages/admin/Dashboard.tsx`, `src/hooks/useDashboardData.ts`, `src/services/auth-service.ts`, `server/src/routes/auth.ts`, `src/data/mock.ts`
- Trigger: A persisted host/unit exists in PostgreSQL but is absent from the static mock unit list.
- Workaround: Keep seed slugs aligned with `src/data/mockData.ts`; long-term fix is fetching the current unit profile from `/api/units/:slug` or including unit details in `/api/auth/me`.

**Donation anonymity type contains a mojibake variant:**
- Symptoms: The type for `anonymousDonation` includes `'nÃ£o'` while the UI state uses `'nao'`.
- Files: `src/services/donations-service.ts`, `src/pages/CapsPage.tsx`
- Trigger: New code using the malformed union member can pass type checks while not matching current form state comparisons.
- Workaround: Normalize the union to `'sim' | 'nao'` and keep displayed Portuguese text separate from stored values.

**Production startup runs migrations inside the web process:**
- Symptoms: App startup executes `prisma migrate deploy` synchronously before listening.
- Files: `server/src/index.ts`, `server/package.json`
- Trigger: Production deploys with slow migrations, failed migration locks, or multiple instances starting concurrently.
- Workaround: Run `npm --prefix server run db:deploy` as a separate release step before starting `server/src/index.ts`.

## Security Considerations

**Public write endpoints depend mainly on rate limits:**
- Risk: Anonymous clients can create donation records and telemetry events; IP-based limits reduce volume but do not prevent spam, scripted abuse, or junk PII.
- Files: `server/src/routes/donations.ts`, `server/src/routes/telemetry.ts`, `server/src/app.ts`, `server/src/services/donations-service.ts`, `server/src/services/telemetry-service.ts`
- Current mitigation: Zod validation in `server/src/services/donations-service.ts` and `server/src/services/telemetry-service.ts`, global/donation/telemetry rate limits in `server/src/app.ts`, trusted-origin checks in `server/src/config/security.ts`.
- Recommendations: Add CAPTCHA/honeypot or signed submission tokens for public donations, persist moderation status, and add request logging/alerting for abuse spikes.

**PII is stored in browser localStorage:**
- Risk: Donor intentions and host profile data are readable by any script running on the origin and persist on shared devices.
- Files: `src/services/donor-intentions-service.ts`, `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/components/Layout.tsx`, `src/pages/CapsPage.tsx`
- Current mitigation: Auth token itself is an httpOnly cookie from `server/src/lib/session-cookie.ts`.
- Recommendations: Store only non-sensitive display state in `localStorage`, add TTL/clear flows for `donorIntentions`, and derive admin session display state from `/api/auth/me` instead of trusting `loggedHost`.

**Demo credentials and personal-looking fixture data are committed to the frontend bundle:**
- Risk: Static fixture data includes a demo password, donor emails, and emergency contact phone numbers; this is easy to mistake for real data and can leak through production bundles when mocks are imported.
- Files: `src/data/mockData.ts`, `src/data/mock.ts`, `server/scripts/test-api.ts`
- Current mitigation: `.env` and `.env.*` files are ignored by `.gitignore`; only `.env.example` and `.env.production.example` files are tracked.
- Recommendations: Replace fixture PII with clearly synthetic values, remove password fields from frontend fixture types, and keep API test credentials in documented local setup data rather than reusable literals.

**Local auth bypass is enabled by frontend default on localhost:**
- Risk: The frontend treats local bypass as enabled unless `VITE_ENABLE_LOCAL_AUTH_BYPASS="false"`; backend bypass requires `ENABLE_LOCAL_AUTH_BYPASS=true` and development mode, so the UI can silently create a fake local admin view when backend auth fails.
- Files: `src/lib/auth.ts`, `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/services/auth-service.ts`, `server/src/middleware/auth.ts`, `server/src/config/env.ts`
- Current mitigation: Backend bypass is restricted to development, loopback hostname, and loopback remote address in `server/src/middleware/auth.ts`; production env validation rejects bypass flags in `server/src/config/env.ts`.
- Recommendations: Require an explicit frontend flag for demo fallback, make demo mode visually distinct, and avoid persisting fake admin records under the same `loggedHost` key used for real sessions.

**Session cookie defaults to cross-site mode in production:**
- Risk: `SameSite=None` is the production default unless overridden; this is necessary for some split-domain deployments but expands CSRF exposure if frontend and API are same-site.
- Files: `server/src/lib/session-cookie.ts`, `server/src/config/security.ts`, `server/src/app.ts`
- Current mitigation: Production cookies are `httpOnly` and `secure`, unsafe methods require trusted origin and `X-CSRF-Protection: 1`.
- Recommendations: Set `SESSION_COOKIE_SAMESITE=lax` or `strict` for same-site deployments, keep `none` only for verified HTTPS cross-site deployments, and add route-level CSRF tests.

## Performance Bottlenecks

**Highlights RSS fetch fans out concurrently:**
- Problem: Public highlights fetch one RSS search feed per search term with `Promise.allSettled` after cache expiry.
- Files: `server/src/services/highlights-service.ts`, `server/src/routes/highlights.ts`
- Cause: `searchTerms` creates many external requests every 15 minutes; there is no concurrency cap or background refresh.
- Improvement path: Fetch feeds through a bounded queue, cache stale results on fetch failure, and move refresh work out of the request path.

**Dashboard loads all needs before client-side filtering:**
- Problem: The admin dashboard calls `/api/needs` without pagination, then filters by unit in the browser.
- Files: `src/services/dashboard-service.ts`, `server/src/controllers/needs-controller.ts`, `server/src/repositories/needs-repository.ts`
- Cause: `fetchDashboardCollections` requests all public needs even though it only needs the current unit.
- Improvement path: Call `/api/needs?unitId=<id>&paginate=true` or add an authenticated dashboard endpoint that returns scoped needs, donations, and residents in one response.

**Frontend bundle includes heavy static UI/data paths:**
- Problem: Large CSS and page files plus static mock imports increase parse and maintenance cost.
- Files: `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`, `src/Styles/CapsPage.css`, `src/Styles/Dashboard.css`, `src/data/mockData.ts`, `src/components/CapsMap.tsx`
- Cause: Feature pages import broad mock datasets and large style sheets directly.
- Improvement path: Lazy-load admin/dashboard-only modules, split map code from general CAPS page paths, and isolate mock data from production imports.

**Rate limiting uses process-local state:**
- Problem: `express-rate-limit` is configured without a shared store.
- Files: `server/src/app.ts`
- Cause: Default in-memory limiter state is per process.
- Improvement path: Use Redis or another shared store before horizontal scaling so public donation, telemetry, and login limits apply consistently across instances.

## Fragile Areas

**Development mock mode mutates process environment at runtime:**
- Files: `server/src/index.ts`, `server/src/controllers/needs-controller.ts`, `server/src/routes/units.ts`
- Why fragile: When the database connection fails in non-production, `server/src/index.ts` sets `process.env.API_MOCK_MODE = 'true'`; only selected public routes understand that mode, while authenticated routes still depend on database access.
- Safe modification: Replace environment mutation with a typed app state/config object and route all mock-mode behavior through explicit service adapters.
- Test coverage: No route-level tests cover database-down local startup or mixed mock/auth behavior.

**Admin UI trusts local session display state:**
- Files: `src/hooks/useDashboardData.ts`, `src/hooks/useAdminLogin.ts`, `src/components/Layout.tsx`, `src/pages/admin/Dashboard.tsx`
- Why fragile: `loggedHost` in `localStorage` influences navigation and display, while actual authorization depends on the httpOnly cookie and `/api/auth/me`.
- Safe modification: Treat `localStorage` as cache only; always refresh `/api/auth/me` before rendering admin data and clear stale cache on 401.
- Test coverage: No frontend tests exercise stale `loggedHost`, expired cookies, or local bypass fallback.

**Residents route owns validation, authorization, and persistence inline:**
- Files: `server/src/routes/residents.ts`, `server/prisma/schema.prisma`
- Why fragile: CRUD logic is concentrated in route handlers instead of reusable service methods, unlike needs and donations.
- Safe modification: Introduce `server/src/services/residents-service.ts` and `server/src/repositories/residents-repository.ts` before adding resident features.
- Test coverage: No tests cover resident CRUD authorization or validation.

**Highlight service combines external fetching, parsing, filtering, caching, and CRUD:**
- Files: `server/src/services/highlights-service.ts`, `server/src/routes/highlights.ts`, `server/src/services/highlights-service.test.ts`
- Why fragile: A single class owns RSS network IO, XML parsing, relevance filtering, in-memory editorial state, and cache state.
- Safe modification: Split RSS feed fetching/parsing from editorial highlight persistence and test each part independently.
- Test coverage: Existing tests cover happy-path CRUD and one RSS filter case; timeout, oversized feed, redirect rejection, and cache behavior are not covered.

**Text encoding consistency is uneven:**
- Files: `src/services/donations-service.ts`, `server/package.json`, `server/prisma/schema.prisma`, `server/scripts/test-api.ts`
- Why fragile: At least one source literal contains mojibake (`'nÃ£o'`), and some package/script text displays encoding artifacts in tooling output.
- Safe modification: Normalize source files to UTF-8, keep internal enum/string values ASCII where possible, and verify user-facing Portuguese text in browser rendering.
- Test coverage: No tests assert user-facing labels or internal string values for encoding correctness.

## Scaling Limits

**Single-process state prevents horizontal consistency:**
- Current capacity: Highlights are held in `Map` and telemetry keeps the last 1000 events per process.
- Limit: Multiple API instances return different admin highlights and telemetry summaries.
- Scaling path: Persist highlight records and telemetry summaries in PostgreSQL or an external service.
- Files: `server/src/services/highlights-service.ts`, `server/src/services/telemetry-service.ts`, `server/src/routes/highlights.ts`, `server/src/routes/telemetry.ts`

**Startup migrations couple deploy safety to app lifecycle:**
- Current capacity: A single server process can run `prisma migrate deploy` during startup.
- Limit: Multi-instance deploys can race startup migration execution or keep all instances unavailable while migration runs.
- Scaling path: Move migrations into CI/CD or release command execution outside `server/src/index.ts`.
- Files: `server/src/index.ts`, `server/package.json`, `server/prisma/migrations/20260330212620_init/migration.sql`, `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`

**Donation and resident records have no retention or archival boundary:**
- Current capacity: Donations and residents accumulate indefinitely in PostgreSQL.
- Limit: PII retention and dashboard queries become harder to govern as usage grows.
- Scaling path: Add retention policy fields/statuses, archival jobs, and scoped/paginated admin endpoints.
- Files: `server/prisma/schema.prisma`, `server/src/repositories/donations-repository.ts`, `server/src/routes/residents.ts`, `src/services/dashboard-service.ts`

## Dependencies at Risk

**React/router type versions are mismatched:**
- Risk: Runtime packages and type packages span different major versions.
- Impact: Type checks may not accurately model runtime behavior for React and React Router APIs.
- Migration plan: Align `react`, `react-dom`, `@types/react`, `@types/react-dom`, `react-router-dom`, and router type packages in `package.json`; remove `@types/react-router-dom` if using `react-router-dom` v7 types directly.
- Files: `package.json`, `package-lock.json`, `src/app/router.tsx`, `src/main.tsx`

**No lint or formatter configuration is present:**
- Risk: Style, import ordering, unused code, and unsafe `any` patterns depend on manual review.
- Impact: Large UI files and route handlers can accumulate inconsistent patterns without automated checks.
- Migration plan: Add ESLint/Prettier or Biome config, wire scripts into `package.json` and `server/package.json`, and make `deploy:check` run lint/type checks before build.
- Files: `package.json`, `server/package.json`, `tsconfig.json`, `server/tsconfig.json`

**`path-to-regexp` override is unexplained:**
- Risk: A dependency override can mask transitive compatibility or security constraints without a visible rationale.
- Impact: Future dependency updates may remove or conflict with the override.
- Migration plan: Add a short comment in dependency documentation or an ADR explaining the override, then remove it once upstream packages no longer require it.
- Files: `server/package.json`, `server/package-lock.json`

## Missing Critical Features

**Production observability is minimal:**
- Problem: The backend uses `console.log`/`console.error` and process-local telemetry summaries; there is no structured logging, request correlation, error tracking, or alerting.
- Blocks: Reliable production incident triage and abuse monitoring for public donation/telemetry endpoints.
- Files: `server/src/index.ts`, `server/src/middleware/error-handler.ts`, `server/src/services/telemetry-service.ts`, `server/src/routes/telemetry.ts`

**Admin account lifecycle is incomplete:**
- Problem: Hosts are seeded and can log in, but there are no visible flows for password changes, password reset, host invitations, or profile edits.
- Blocks: Operational management of real host users without direct database/seed changes.
- Files: `server/src/routes/auth.ts`, `server/src/prisma/seed.ts`, `src/pages/admin/Dashboard.tsx`, `server/prisma/schema.prisma`

**Donation workflow lacks moderation/status tracking:**
- Problem: Public donations are immediately stored and displayed to hosts, but the schema has no moderation status, confirmation state, source metadata, or audit trail.
- Blocks: Distinguishing valid donation intentions from spam, duplicates, or completed deliveries.
- Files: `server/prisma/schema.prisma`, `server/src/services/donations-service.ts`, `server/src/repositories/donations-repository.ts`, `src/pages/admin/Dashboard.tsx`

**Frontend has no automated regression harness:**
- Problem: There are no frontend unit, component, accessibility, or end-to-end tests.
- Blocks: Safe refactors of large interactive pages and admin flows.
- Files: `package.json`, `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`, `src/hooks/useDashboardData.ts`, `src/services/donations-service.ts`

## Test Coverage Gaps

**Frontend workflows are untested:**
- What's not tested: Donation registration, local donor intention storage, CAPS unit selection, admin login, dashboard request publishing/deletion, residents table display, and map rendering.
- Files: `package.json`, `src/pages/CapsPage.tsx`, `src/pages/admin/Login.tsx`, `src/pages/admin/Dashboard.tsx`, `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/components/CapsMap.tsx`
- Risk: UI regressions and API contract drift are discovered manually.
- Priority: High

**Backend route/security behavior lacks integration tests:**
- What's not tested: CORS/trusted-origin enforcement, CSRF header rejection, cookie options, login limiter behavior, local auth bypass restrictions, `/api/auth/me`, and protected route authorization.
- Files: `server/src/app.ts`, `server/src/config/security.ts`, `server/src/lib/session-cookie.ts`, `server/src/middleware/auth.ts`, `server/src/routes/auth.ts`, `server/src/routes/donations.ts`, `server/src/routes/residents.ts`
- Risk: Security regressions can pass the current service-only test suite.
- Priority: High

**Donation create/delete paths are minimally tested:**
- What's not tested: Donation payload validation, anonymous donor handling, unit slug lookup failures, delete authorization, and multi-item partial failure behavior.
- Files: `server/src/services/donations-service.ts`, `server/src/repositories/donations-repository.ts`, `server/src/services/donations-service.test.ts`, `src/services/donations-service.ts`
- Risk: Public donation records can be malformed or partially persisted without detection.
- Priority: High

**Persistence-backed features are not exercised against a database:**
- What's not tested: Prisma schema constraints, migrations, seed data, repositories, and route-to-database behavior.
- Files: `server/prisma/schema.prisma`, `server/prisma/migrations/20260330212620_init/migration.sql`, `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`, `server/src/prisma/seed.ts`, `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts`
- Risk: SQL/migration issues and repository query behavior are missed by mock-repository service tests.
- Priority: Medium

**Highlights RSS edge cases are under-tested:**
- What's not tested: External fetch timeout, oversized response rejection, disallowed redirect host, malformed XML, cache expiry, and duplicate link handling.
- Files: `server/src/services/highlights-service.ts`, `server/src/services/highlights-service.test.ts`, `server/src/routes/highlights.ts`
- Risk: Public highlights can fail slowly, return stale/empty content, or accept unexpected feed content.
- Priority: Medium

**Telemetry behavior has no tests:**
- What's not tested: Schema rejection, max-event trimming, summary aggregation, and admin-only summary access.
- Files: `server/src/services/telemetry-service.ts`, `server/src/routes/telemetry.ts`
- Risk: Analytics can silently drop data or expose summary endpoints incorrectly.
- Priority: Medium

---

*Concerns audit: 2026-05-29*
