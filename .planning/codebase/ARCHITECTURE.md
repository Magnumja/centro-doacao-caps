<!-- refreshed: 2026-05-19 -->
# Architecture

**Analysis Date:** 2026-05-19

## System Overview

```text
+-------------------------------------------------------------+
|                 Vite React Single Page App                  |
|  `index.html` -> `src/main.tsx` -> `src/app/router.tsx`      |
+------------------+-------------------+----------------------+
| Public pages     | Admin pages       | Shared UI            |
| `src/pages`      | `src/pages/admin` | `src/components`     |
+---------+--------+---------+---------+----------+-----------+
          |                  |                    |
          v                  v                    v
+-------------------------------------------------------------+
| Frontend data layer                                         |
| `src/services` + `src/lib/api.ts` + `src/hooks`             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Express API                                                  |
| `server/src/index.ts` -> `server/src/app.ts` -> routes       |
+------------------+-------------------+----------------------+
| Routes           | Controllers       | Middleware           |
| `server/src/routes` | `server/src/controllers` | `server/src/middleware` |
+---------+--------+---------+---------+----------+-----------+
          |                  |                    |
          v                  v                    v
+-------------------------------------------------------------+
| Domain services, repositories, Prisma client                 |
| `server/src/services`, `server/src/repositories`,            |
| `server/src/lib/prisma.ts`                                  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| PostgreSQL schema and migrations                             |
| `server/prisma/schema.prisma`, `server/prisma/migrations`    |
+-------------------------------------------------------------+
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Browser shell | Loads the React module, security metadata, root mount node, favicon, and CSP/connect policy. | `index.html` |
| React bootstrap | Installs browser performance telemetry, wraps the app in `ThemeProvider`, and renders `Router`. | `src/main.tsx` |
| App router | Defines all hash routes and nests pages under the shared `Layout`. | `src/app/router.tsx` |
| Shared layout | Owns the global navigation, menu state, theme toggle location, and route outlet. | `src/components/Layout.tsx` |
| Public pages | Compose visitor flows for home, CAPS selection, donation browsing, donor records, and project information. | `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, `src/pages/Donate.tsx`, `src/pages/YourDonations.tsx`, `src/pages/AboutProject.tsx` |
| Admin pages | Compose login and dashboard flows for hosts/admins. | `src/pages/admin/Login.tsx`, `src/pages/admin/Dashboard.tsx` |
| Frontend API client | Centralizes `fetch` base URL, credentials, mutation headers, JSON parsing, and `ApiError`. | `src/lib/api.ts` |
| Frontend services | Convert UI intentions into API calls and normalize API payloads into frontend types. | `src/services/units-service.ts`, `src/services/needs-service.ts`, `src/services/donations-service.ts`, `src/services/auth-service.ts`, `src/services/dashboard-service.ts` |
| Frontend hooks | Encapsulate admin login and dashboard data loading side effects. | `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts` |
| API bootstrap | Validates environment, connects Prisma, enables mock mode in local database failures, and starts Express. | `server/src/index.ts` |
| API app | Configures security middleware, rate limits, JSON parsing, route mounts, healthcheck, and error middleware. | `server/src/app.ts` |
| API routes | Bind HTTP methods and paths to handlers, controllers, and auth middleware. | `server/src/routes/*.ts` |
| Controllers | Translate Express requests into service calls for the needs and donations domains. | `server/src/controllers/needs-controller.ts`, `server/src/controllers/donations-controller.ts` |
| Services | Own validation, pagination, permission checks, fallback feed parsing, and domain decisions. | `server/src/services/*.ts` |
| Repositories | Isolate Prisma reads/writes for needs and donations. | `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts` |
| Prisma schema | Defines Units, Needs, Hosts, Donations, Residents, and enums for persisted state. | `server/prisma/schema.prisma` |

## Pattern Overview

**Overall:** Split frontend/backend application with a React composition layer and an Express REST API backed by Prisma.

**Key Characteristics:**
- Use the frontend page -> service -> `src/lib/api.ts` path for browser/API communication.
- Use the backend route -> controller -> service -> repository -> Prisma path for domains that already have controllers (`needs`, `donations`).
- Keep shared presentation components in `src/components` and page orchestration in `src/pages`.
- Keep persistent data contracts in `server/prisma/schema.prisma` and frontend DTO mapping in `src/services`.
- Keep static-hosting-safe navigation in `HashRouter` inside `src/app/router.tsx`.

## Layers

**Browser Shell:**
- Purpose: Provide the static HTML host for the SPA and constrain browser resource loading.
- Location: `index.html`
- Contains: Root `<div id="root">`, CSP, metadata, and Vite module script.
- Depends on: `src/main.tsx`
- Used by: Vite development server and production static hosting.

**Frontend Routing and Page Composition:**
- Purpose: Map URLs to page components and compose page-level workflows.
- Location: `src/app/router.tsx`, `src/pages`
- Contains: Hash routes, public pages, admin pages, page-local state, and page-specific effects.
- Depends on: `react-router-dom`, `src/components`, `src/services`, `src/hooks`, `src/types`
- Used by: `src/main.tsx`

**Frontend Components:**
- Purpose: Reusable visual and interactive building blocks.
- Location: `src/components`, `src/components/ui`
- Contains: Cards, badges, map, layout, carousel, theme toggle, skeletons, stat widgets.
- Depends on: React, `react-icons`, `react-leaflet`, `src/types`, selected `src/lib` helpers.
- Used by: `src/pages`

**Frontend Data and Utility Layer:**
- Purpose: Hide API details and shared browser utilities from pages.
- Location: `src/services`, `src/lib`, `src/hooks`
- Contains: API transport, DTO normalization, telemetry, local donation intentions, auth bypass checks, dashboard loading.
- Depends on: `fetch`, `localStorage`, `import.meta.env`, `src/types`
- Used by: `src/pages`, `src/components/ui/ThemeToggle.tsx`, `src/lib/performance-metrics.ts`

**API Composition Layer:**
- Purpose: Build and configure the Express app.
- Location: `server/src/app.ts`
- Contains: Helmet, CORS, rate limiters, cookie parsing, origin/content-type guards, route mounts, healthcheck.
- Depends on: `server/src/routes`, `server/src/middleware`, `server/src/config/security.ts`
- Used by: `server/src/index.ts`

**API Route Layer:**
- Purpose: Define REST endpoints and attach auth requirements.
- Location: `server/src/routes`
- Contains: `auth`, `units`, `needs`, `donations`, `residents`, `highlights`, and `telemetry` routers.
- Depends on: Controllers, services, middleware, Prisma for direct-route domains.
- Used by: `server/src/app.ts`

**API Domain Layer:**
- Purpose: Validate inputs, apply business rules, paginate, and coordinate persistence.
- Location: `server/src/controllers`, `server/src/services`, `server/src/repositories`
- Contains: Controller classes for needs/donations, service classes, singleton services, repository classes.
- Depends on: `zod`, `AppError`, `ValidationError`, `server/src/lib/prisma.ts`, `server/src/utils`
- Used by: `server/src/routes`

**Persistence Layer:**
- Purpose: Define database shape and expose Prisma access.
- Location: `server/prisma/schema.prisma`, `server/prisma/migrations`, `server/src/lib/prisma.ts`
- Contains: Prisma models, migrations, seed script, Prisma singleton.
- Depends on: PostgreSQL via `DATABASE_URL`
- Used by: Repositories and direct-route handlers.

## Data Flow

### Public Donation Registration Path

1. Visitor chooses a CAPS unit and submits the donation form in `src/pages/CapsPage.tsx:236`.
2. The page validates browser-side fields with `validateDonationInput` from `src/services/donations-service.ts:25`.
3. `registerDonations` maps selected labels to API categories and posts each donation to `/api/donations` through `src/lib/api.ts:42`.
4. Express mounts the donations router at `/api/donations` in `server/src/app.ts:86`.
5. `server/src/routes/donations.ts:9` sends public creation requests to `DonationsController.create`.
6. `server/src/controllers/donations-controller.ts:7` delegates to `DonationsService.create`.
7. `server/src/services/donations-service.ts:25` validates with Zod, resolves the unit by slug, and calls the repository.
8. `server/src/repositories/donations-repository.ts:18` writes the donation through Prisma.
9. Prisma persists to the `Donation` model in `server/prisma/schema.prisma`.
10. On success, the page also records a local donor intention through `src/services/donor-intentions-service.ts`.

### Public Needs Browsing Path

1. `src/pages/Home.tsx:46` requests urgent needs with `fetchNeedsPage`.
2. `src/services/needs-service.ts:62` builds `/api/needs?paginate=true&page=...&priority=...`.
3. `src/lib/api.ts:37` sends the credentialed GET request.
4. `server/src/app.ts:85` mounts the needs router.
5. `server/src/routes/needs.ts:9` calls `NeedsController.list`.
6. `server/src/controllers/needs-controller.ts:11` parses priority, unit, and pagination options.
7. When `API_MOCK_MODE` is active, `server/src/controllers/needs-controller.ts:25` returns `server/src/data/public-fallback.ts` data.
8. Otherwise `server/src/services/needs-service.ts:19` resolves pagination and asks `NeedsRepository.listPaginated`.
9. `server/src/repositories/needs-repository.ts:25` fetches rows and count in a Prisma transaction.
10. `src/services/needs-service.ts:44` normalizes API needs into frontend `Need` objects.

### Admin Authentication and Dashboard Path

1. The admin route `/admin/login` renders `src/pages/admin/Login.tsx` through `src/app/router.tsx:32`.
2. `src/hooks/useAdminLogin.ts:36` posts credentials using `loginWithEmail` from `src/services/auth-service.ts`.
3. `src/lib/api.ts:42` includes JSON and anti-CSRF headers for mutations.
4. `server/src/app.ts:80` applies a strict login rate limiter before the auth router.
5. `server/src/routes/auth.ts:51` validates credentials, supports configured environment admin login, verifies bcrypt hashes, and sets an httpOnly JWT cookie.
6. `src/hooks/useAdminLogin.ts:38` calls `/api/auth/me` to load the current host.
7. `server/src/middleware/auth.ts:64` reads the cookie, verifies the JWT, and attaches `req.authHost`.
8. `src/hooks/useDashboardData.ts:25` fetches the logged host, then `src/services/dashboard-service.ts:8` loads needs, donations, and residents in parallel.
9. Protected backend routes filter data by `req.authHost!.unitId` in files such as `server/src/routes/residents.ts:18` and `server/src/controllers/donations-controller.ts:12`.

### API Startup and Fallback Path

1. `server/src/index.ts:6` validates environment before listening.
2. `server/src/index.ts:13` attempts `prisma.$connect()`.
3. In non-production database connection failures, `server/src/index.ts:20` sets `API_MOCK_MODE=true`.
4. Fallback-aware routes and controllers return `server/src/data/public-fallback.ts` data for public reads.
5. `server/src/index.ts:24` starts Express on `PORT` or `3333`.

**State Management:**
- Frontend state is React local state in pages and hooks, plus browser `localStorage` for logged host cache and donor intentions.
- Theme state lives in `src/theme/ThemeProvider.tsx` and is consumed by `src/components/ui/ThemeToggle.tsx`.
- Backend request state uses Express `req.authHost` added by `server/src/middleware/auth.ts`.
- Backend global state includes the Prisma singleton in `server/src/lib/prisma.ts`, in-memory telemetry in `server/src/services/telemetry-service.ts`, and in-memory highlights state in `server/src/services/highlights-service.ts`.

## Key Abstractions

**Frontend API Transport:**
- Purpose: Normalize fetch, base URL, credentials, JSON mutation headers, and errors.
- Examples: `src/lib/api.ts`, `src/services/needs-service.ts`, `src/services/donations-service.ts`
- Pattern: Small transport module exported as named functions and default object.

**Frontend DTO Mappers:**
- Purpose: Convert backend DTOs into UI types.
- Examples: `src/services/units-service.ts`, `src/services/needs-service.ts`
- Pattern: Export API-specific types and pure mapper functions such as `mapApiUnitToCap` and `normalizeNeed`.

**Page-Oriented Workflows:**
- Purpose: Keep user workflows close to the routed page.
- Examples: `src/pages/CapsPage.tsx`, `src/pages/Home.tsx`, `src/pages/admin/Dashboard.tsx`
- Pattern: Page components compose services, hooks, local state, and presentation components.

**Backend Controller Classes:**
- Purpose: Keep Express request/response adaptation separate from domain services for needs and donations.
- Examples: `server/src/controllers/needs-controller.ts`, `server/src/controllers/donations-controller.ts`
- Pattern: Classes with arrow-function handlers and injectable service constructor defaults.

**Backend Services:**
- Purpose: Validate payloads and apply business rules before persistence.
- Examples: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/services/highlights-service.ts`, `server/src/services/telemetry-service.ts`
- Pattern: Zod validation, `AppError`/`ValidationError`, repository delegation where repositories exist.

**Backend Repositories:**
- Purpose: Encapsulate Prisma queries for domains with controller/service separation.
- Examples: `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts`
- Pattern: Class methods return Prisma calls and transactions.

**Auth Context:**
- Purpose: Attach authenticated host identity and authorization role to Express requests.
- Examples: `server/src/middleware/auth.ts`, `server/src/lib/jwt.ts`, `server/src/routes/auth.ts`
- Pattern: JWT in httpOnly cookie, Zod-validated payload, `req.authHost` extension, role checks in middleware and services.

## Entry Points

**Frontend HTML:**
- Location: `index.html`
- Triggers: Browser request to the static site.
- Responsibilities: CSP, metadata, root element, and Vite module entry.

**Frontend Runtime:**
- Location: `src/main.tsx`
- Triggers: Vite script module loaded by `index.html`.
- Responsibilities: Install performance telemetry, provide theme context, render router.

**Frontend Routing:**
- Location: `src/app/router.tsx`
- Triggers: Hash URL changes.
- Responsibilities: Route public/admin pages under `Layout`, redirect `/home`, handle unmatched routes.

**API Runtime:**
- Location: `server/src/index.ts`
- Triggers: `npm --prefix server run dev` or `npm --prefix server start`.
- Responsibilities: Load environment, validate configuration, connect Prisma, start Express.

**Express App:**
- Location: `server/src/app.ts`
- Triggers: Imported by `server/src/index.ts` and Express request dispatch.
- Responsibilities: Configure security, rate limits, JSON parsing, routers, healthcheck, and error handling.

**Database Schema:**
- Location: `server/prisma/schema.prisma`
- Triggers: Prisma generate, migrate, seed, runtime client queries.
- Responsibilities: Define persisted models and relations.

**Seed Script:**
- Location: `server/src/prisma/seed.ts`
- Triggers: `npm --prefix server run db:seed`.
- Responsibilities: Upsert units, hosts, and initial needs.

## Architectural Constraints

- **Threading:** Node/Express and Vite run on a single event loop per process. Request concurrency is async I/O through Express handlers, Prisma promises, and browser fetches.
- **Global state:** `server/src/lib/prisma.ts` creates one Prisma singleton. `server/src/services/telemetry-service.ts` and `server/src/services/highlights-service.ts` keep process-local state. `src/theme/ThemeProvider.tsx` keeps browser theme state and `src/services/donor-intentions-service.ts` persists donor records in `localStorage`.
- **Circular imports:** Not detected in the inspected source. Imports generally point from pages to components/services/types, routes to controllers/services/middleware, services to repositories, and repositories to Prisma.
- **Routing mode:** The frontend uses `HashRouter` in `src/app/router.tsx` so static hosts do not need rewrite rules.
- **API base URL:** Frontend calls use `VITE_API_URL` via `src/lib/api.ts`; when unset, relative `/api` requests use the Vite dev proxy in `vite.config.js`.
- **Auth storage:** API sessions use an httpOnly `token` cookie from `server/src/routes/auth.ts`; frontend caches display host data in `localStorage` but does not own the authoritative session.
- **Production environment validation:** `server/src/config/env.ts` requires production `DATABASE_URL`, `FRONTEND_URL`, a sufficiently long `JWT_SECRET`, and disables local auth bypass.
- **Asset resolution:** Public assets exist in both `public` and `src/public`. Import-based image use points at `src/public`; URL path use points at `public`.

## Anti-Patterns

### Direct Prisma in Route Handlers

**What happens:** Several route modules call Prisma directly instead of using a controller/service/repository chain.
**Why it's wrong:** Auth, validation, persistence, and response shaping become harder to reuse and test when mixed in route handlers.
**Do this instead:** For new database-backed endpoints, follow `server/src/routes/needs.ts` -> `server/src/controllers/needs-controller.ts` -> `server/src/services/needs-service.ts` -> `server/src/repositories/needs-repository.ts`.

### Large Page Components as Workflow Containers

**What happens:** Pages such as `src/pages/CapsPage.tsx` and `src/pages/admin/Dashboard.tsx` contain substantial state orchestration, service calls, form behavior, and rendering in one file.
**Why it's wrong:** New workflow branches can make page files harder to reason about and can duplicate loading/error behavior.
**Do this instead:** Move reusable side effects into hooks following `src/hooks/useDashboardData.ts` and `src/hooks/useAdminLogin.ts`; keep shared API and normalization logic in `src/services`.

### Mixed Mock and API Fallbacks

**What happens:** The frontend falls back to mock data in pages and lib helpers, while the backend can also enter `API_MOCK_MODE`.
**Why it's wrong:** Public screens can show different fallback shapes depending on which layer failed.
**Do this instead:** Prefer backend fallback for public read endpoints through `server/src/data/public-fallback.ts`, and keep frontend fallback limited to last-resort UI resilience in `src/lib/needs.ts` and page loaders.

## Error Handling

**Strategy:** Convert expected domain failures into structured HTTP errors, catch async route errors centrally, and surface frontend fetch failures as `ApiError`.

**Patterns:**
- Wrap async Express handlers with `server/src/utils/async-handler.ts`.
- Throw `AppError` or `ValidationError` from services and security config.
- Use `server/src/middleware/error-handler.ts` after all routes to handle not-found and unexpected errors.
- Parse Zod validation failures into `details` through `server/src/errors/validation-error.ts`.
- Throw `ApiError` from `src/lib/api.ts` when fetch responses are not `ok`.
- Use page-level fallback catches in `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, `src/hooks/useDashboardData.ts`, and `src/hooks/useAdminLogin.ts`.

## Cross-Cutting Concerns

**Logging:** Backend startup and unexpected errors use `console` in `server/src/index.ts` and `server/src/middleware/error-handler.ts`. Prisma warning/error logging is configured in `server/src/lib/prisma.ts`.

**Validation:** Backend validation uses Zod in `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/routes/auth.ts`, `server/src/routes/residents.ts`, and `server/src/lib/jwt.ts`. Frontend form validation uses `src/services/donations-service.ts`.

**Authentication:** Login is in `server/src/routes/auth.ts`; JWT signing/verification is in `server/src/lib/jwt.ts`; route protection and local bypass are in `server/src/middleware/auth.ts`; frontend login/dashboard hooks are in `src/hooks/useAdminLogin.ts` and `src/hooks/useDashboardData.ts`.

**Security:** `server/src/app.ts` installs Helmet, CORS, cookie parsing, JSON limits, rate limits, trusted-origin checks, and content-type checks. `index.html` adds a browser CSP. `server/src/config/env.ts` validates production security configuration.

**Telemetry:** Browser telemetry is sent from `src/lib/performance-metrics.ts`, `src/services/telemetry-service.ts`, and UI components to `/api/telemetry`; the API stores summaries in `server/src/services/telemetry-service.ts`.

**Styling:** Page and component styles are organized in `src/Styles/*.css`; global layout styles live in `src/Styles/Layout.css`.

---

*Architecture analysis: 2026-05-19*
