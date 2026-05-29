<!-- refreshed: 2026-05-29 -->
# Architecture

**Analysis Date:** 2026-05-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                 Browser React SPA, Vite build               │
│                 `src/main.tsx`, `src/app/router.tsx`         │
├──────────────────┬──────────────────┬───────────────────────┤
│   Public Pages   │  Admin Pages     │   Shared Components   │
│   `src/pages/`   │  `src/pages/admin/` │ `src/components/`   │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│        Frontend API and browser state adapters               │
│        `src/services/`, `src/lib/`, `src/hooks/`             │
└───────────────────────────────┬─────────────────────────────┘
                                │ `/api/*` via Vite proxy or `VITE_API_URL`
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express REST API application                 │
│                 `server/src/index.ts`, `server/src/app.ts`   │
├──────────────────┬──────────────────┬───────────────────────┤
│     Routes       │   Controllers    │  Services/Repositories│
│ `server/src/routes/` │ `server/src/controllers/` │ `server/src/services/`, `server/src/repositories/` │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Prisma Client and PostgreSQL                 │
│                 `server/src/lib/prisma.ts`, `server/prisma/schema.prisma` │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Vite shell | Loads the React app into `#root` and installs frontend performance telemetry. | `src/main.tsx` |
| SPA router | Owns all browser routes and wraps them in the shared layout. | `src/app/router.tsx` |
| Shared layout | Owns navigation, footer, mobile menu state, and admin link target selection. | `src/components/Layout.tsx` |
| Public home | Loads news highlights, urgent needs, map, and scroll telemetry. | `src/pages/Home.tsx` |
| CAPS donation flow | Loads units and needs, selects a unit, validates donation intent UI state, and submits donation records. | `src/pages/CapsPage.tsx` |
| Needs listing page | Loads public needs, filters them client-side, and renders donation request cards. | `src/pages/Donate.tsx` |
| Admin login | Presents login UI and delegates authentication state to the login hook. | `src/pages/admin/Login.tsx` |
| Admin dashboard | Owns tab state, admin need creation/deletion UI, donation analytics, and resident display. | `src/pages/admin/Dashboard.tsx` |
| Frontend API client | Centralizes fetch base URL, credentials, JSON mutation headers, CSRF marker, and API error shape. | `src/lib/api.ts` |
| Frontend services | Convert UI actions into REST calls and normalize API payloads. | `src/services/needs-service.ts`, `src/services/donations-service.ts`, `src/services/dashboard-service.ts`, `src/services/auth-service.ts` |
| Frontend hooks | Encapsulate admin login and dashboard loading/redirect behavior. | `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts` |
| Express app | Applies security middleware, rate limits, route mounts, health check, and error handlers. | `server/src/app.ts` |
| API bootstrap | Validates environment, applies production migrations, connects Prisma, starts HTTP server, and handles shutdown. | `server/src/index.ts` |
| API routes | Map HTTP verbs and paths to handlers and auth requirements. | `server/src/routes/` |
| Controllers | Adapt Express requests/responses into service calls for richer domains. | `server/src/controllers/needs-controller.ts`, `server/src/controllers/donations-controller.ts` |
| Services | Validate payloads with Zod and enforce domain rules before persistence. | `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/services/highlights-service.ts`, `server/src/services/telemetry-service.ts` |
| Repositories | Encapsulate Prisma reads/writes for needs and donations. | `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts` |
| Prisma schema | Defines Unit, Need, Host, Donation, Resident models and indexes. | `server/prisma/schema.prisma` |

## Pattern Overview

**Overall:** Split frontend/backend monorepo with a React SPA, service-adapter frontend layer, and Express REST backend using route-controller-service-repository layering where the domain is non-trivial.

**Key Characteristics:**
- Frontend pages in `src/pages/` own route-level state, while reusable presentational UI lives in `src/components/`.
- Frontend REST calls go through `src/lib/api.ts`; feature-specific adapters live in `src/services/`.
- Backend public and admin endpoints are grouped by resource in `server/src/routes/`.
- Backend domains with validation and authorization complexity use controller/service/repository classes in `server/src/controllers/`, `server/src/services/`, and `server/src/repositories/`.
- Simpler backend resources keep route-local handlers and direct Prisma access in `server/src/routes/units.ts`, `server/src/routes/residents.ts`, and `server/src/routes/auth.ts`.
- Shared fallback/demo data exists on both sides: frontend `src/data/mockData.ts` and backend `server/src/data/public-fallback.ts`.

## Layers

**React Entry and Routing:**
- Purpose: Mount the SPA and translate hash-based browser paths into page components.
- Location: `src/main.tsx`, `src/app/router.tsx`
- Contains: `createRoot`, `HashRouter`, `Routes`, route fallback, route redirects.
- Depends on: `react`, `react-dom/client`, `react-router-dom`, `src/components/Layout.tsx`.
- Used by: The browser entry `index.html` and Vite build pipeline in `vite.config.js`.

**Page Layer:**
- Purpose: Own route-level workflows, local UI state, effects, filters, and orchestration.
- Location: `src/pages/`, `src/pages/admin/`
- Contains: Public pages `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, `src/pages/Donate.tsx`, `src/pages/AboutProject.tsx`, `src/pages/YourDonations.tsx`; admin pages `src/pages/admin/Login.tsx`, `src/pages/admin/Dashboard.tsx`.
- Depends on: Components from `src/components/`, service adapters from `src/services/`, helpers from `src/lib/`, types from `src/types/`.
- Used by: Route declarations in `src/app/router.tsx`.

**Component Layer:**
- Purpose: Render reusable UI blocks and compose page sections without owning cross-route data loading.
- Location: `src/components/`, `src/components/ui/`
- Contains: Layout, cards, badges, map, dashboard summary, carousel, skeletons.
- Depends on: Props from `src/types/`, static assets from `public/` and `src/public/`, helper functions from `src/lib/contact.ts`.
- Used by: Pages in `src/pages/` and `src/pages/admin/`.

**Frontend Service and Helper Layer:**
- Purpose: Keep API mechanics, API payload normalization, local browser storage, auth bypass checks, telemetry, and contact URL helpers out of UI components.
- Location: `src/services/`, `src/lib/`, `src/hooks/`
- Contains: Fetch wrappers in `src/lib/api.ts`, public need helper in `src/lib/needs.ts`, local auth logic in `src/lib/auth.ts`, donation intent storage in `src/services/donor-intentions-service.ts`, dashboard loading in `src/hooks/useDashboardData.ts`.
- Depends on: Browser APIs, `import.meta.env`, `fetch`, `localStorage`, and frontend types in `src/types/`.
- Used by: Pages and components across `src/pages/`, `src/components/`, and `src/hooks/`.

**Express Application Layer:**
- Purpose: Configure global API behavior before resource routes run.
- Location: `server/src/app.ts`
- Contains: Helmet, CORS delegate, rate limits, cookie parsing, trusted-origin enforcement, JSON content-type enforcement, JSON body parser, route mounts, health endpoint, 404/error handlers.
- Depends on: Middleware in `server/src/middleware/`, security config in `server/src/config/security.ts`, routers in `server/src/routes/`.
- Used by: HTTP bootstrap in `server/src/index.ts`.

**Backend Route Layer:**
- Purpose: Bind REST paths and HTTP verbs to resource handlers and auth requirements.
- Location: `server/src/routes/`
- Contains: `server/src/routes/auth.ts`, `server/src/routes/units.ts`, `server/src/routes/needs.ts`, `server/src/routes/donations.ts`, `server/src/routes/residents.ts`, `server/src/routes/highlights.ts`, `server/src/routes/telemetry.ts`.
- Depends on: `express.Router`, `server/src/utils/async-handler.ts`, auth middleware, controllers, services, and Prisma.
- Used by: `server/src/app.ts`.

**Backend Domain Layer:**
- Purpose: Validate inputs, enforce resource ownership, normalize pagination, and coordinate persistence.
- Location: `server/src/controllers/`, `server/src/services/`, `server/src/repositories/`
- Contains: Needs and donations controllers, services, repositories, plus singleton in-memory services for highlights and telemetry.
- Depends on: Zod, `server/src/errors/`, repositories, Prisma, and utility helpers.
- Used by: Routes in `server/src/routes/`.

**Persistence Layer:**
- Purpose: Provide database schema, generated Prisma client, migrations, and seed data.
- Location: `server/prisma/`, `server/src/lib/prisma.ts`, `server/src/prisma/seed.ts`
- Contains: PostgreSQL datasource, Prisma models, migrations, client singleton, seed script.
- Depends on: `@prisma/client`, `prisma`, `DATABASE_URL`.
- Used by: Repositories and direct route handlers in `server/src/routes/`.

## Data Flow

### Primary Public Donation Path

1. User enters the CAPS flow through the hash route `/caps/*` in `src/app/router.tsx:27`.
2. `src/pages/CapsPage.tsx:86` loads units with `fetchUnits()` from `src/services/units-service.ts` and falls back to `src/data/mockData.ts` when API data is unavailable.
3. `src/pages/CapsPage.tsx:96` loads needs through `fetchPublicNeeds()` from `src/lib/needs.ts`, which delegates to `fetchNeeds()` and `normalizeNeed()` in `src/services/needs-service.ts`.
4. `src/pages/CapsPage.tsx:245` validates form state with `validateDonationInput()` from `src/services/donations-service.ts`.
5. `src/pages/CapsPage.tsx:265` submits one API request per selected item with `registerDonations()` from `src/services/donations-service.ts`.
6. `src/services/donations-service.ts:43` posts to `/api/donations` through `src/lib/api.ts`.
7. `server/src/app.ts:84` routes `/api/donations` to `server/src/routes/donations.ts`.
8. `server/src/routes/donations.ts:9` handles public donation creation through `DonationsController.create`.
9. `server/src/controllers/donations-controller.ts:7` calls `DonationsService.create()`.
10. `server/src/services/donations-service.ts:24` validates with Zod, resolves the target unit, and calls `DonationsRepository.create()`.
11. `server/src/repositories/donations-repository.ts:10` writes the donation with Prisma using `server/src/lib/prisma.ts`.

### Admin Need Management Path

1. Admin routes are declared at `/admin/login` and `/admin/*` in `src/app/router.tsx:33` and `src/app/router.tsx:36`.
2. `src/hooks/useAdminLogin.ts` logs in through `src/services/auth-service.ts` and stores the host snapshot in `localStorage`.
3. `src/hooks/useDashboardData.ts:29` loads the current host with `/api/auth/me` and redirects to `/admin/login` when auth fails.
4. `src/hooks/useDashboardData.ts:36` loads dashboard collections through `src/services/dashboard-service.ts`.
5. `src/pages/admin/Dashboard.tsx:82` creates a need through `createNeed()` from `src/services/needs-service.ts`.
6. `src/services/needs-service.ts:78` posts to `/api/needs`.
7. `server/src/app.ts:83` routes `/api/needs` to `server/src/routes/needs.ts`.
8. `server/src/routes/needs.ts:10` protects creation with `requireAuth` from `server/src/middleware/auth.ts`.
9. `server/src/controllers/needs-controller.ts:62` passes `req.authHost!.unitId` into `NeedsService.create()`.
10. `server/src/services/needs-service.ts:37` validates payloads and writes through `NeedsRepository.create()`.
11. `server/src/repositories/needs-repository.ts:49` persists the Need row through Prisma.

### Highlight and Telemetry Path

1. `src/pages/Home.tsx:23` loads highlights through `src/services/highlights-service.ts`.
2. `server/src/routes/highlights.ts:8` exposes public highlights and sets a short public cache header.
3. `server/src/services/highlights-service.ts:78` combines filtered RSS news with in-memory seeded highlights.
4. `src/pages/Home.tsx:58` emits scroll-depth telemetry through `src/services/telemetry-service.ts`.
5. `server/src/routes/telemetry.ts:8` accepts telemetry events without auth and stores them in `server/src/services/telemetry-service.ts`.
6. `server/src/routes/telemetry.ts:13` exposes summaries only through `requireAdmin`.

**State Management:**
- React local state and effects handle page workflows in `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, `src/pages/Donate.tsx`, and `src/pages/admin/Dashboard.tsx`.
- Auth session UI state is mirrored in `localStorage` by `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, and `src/components/Layout.tsx`; the actual backend session is an httpOnly JWT cookie configured in `server/src/lib/session-cookie.ts`.
- Donor intentions for the "Minhas doacoes" page are local browser records managed in `src/services/donor-intentions-service.ts`.
- Backend telemetry is process-local memory in `server/src/services/telemetry-service.ts`.
- Backend highlight admin mutations are process-local memory in `server/src/services/highlights-service.ts`; seeded highlights come from `server/src/data/highlights.ts`.

## Key Abstractions

**API Client:**
- Purpose: Provide one fetch boundary for frontend API calls and consistent error handling.
- Examples: `src/lib/api.ts`, `src/services/needs-service.ts`, `src/services/donations-service.ts`, `src/services/auth-service.ts`
- Pattern: `api.get`, `api.post`, and `api.del` wrap `fetch` with credentials and parse error bodies into `ApiError`.

**Frontend Feature Services:**
- Purpose: Keep payload mapping and fallback normalization out of page components.
- Examples: `src/services/needs-service.ts`, `src/services/units-service.ts`, `src/services/dashboard-service.ts`, `src/lib/needs.ts`
- Pattern: Export typed functions, normalize API records into `src/types/`, and return empty arrays or fallback data when public pages can continue.

**Admin Hooks:**
- Purpose: Encapsulate auth, redirect, local bypass, and dashboard bootstrap behavior.
- Examples: `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`
- Pattern: Hooks own side effects and return state/actions to admin pages.

**Route-Controller-Service-Repository:**
- Purpose: Separate HTTP wiring from validation/domain logic and Prisma persistence for needs and donations.
- Examples: `server/src/routes/needs.ts`, `server/src/controllers/needs-controller.ts`, `server/src/services/needs-service.ts`, `server/src/repositories/needs-repository.ts`
- Pattern: Route constructs a controller once, controller methods are arrow properties, services validate with Zod, repositories call Prisma.

**Async Route Wrapper:**
- Purpose: Forward rejected promises into the centralized Express error handler.
- Examples: `server/src/utils/async-handler.ts`, `server/src/routes/needs.ts`, `server/src/routes/donations.ts`, `server/src/routes/highlights.ts`
- Pattern: Wrap async route handlers with `asyncHandler(handler)`.

**Application Errors:**
- Purpose: Carry HTTP status and safe validation details through Express.
- Examples: `server/src/errors/app-error.ts`, `server/src/errors/validation-error.ts`, `server/src/middleware/error-handler.ts`
- Pattern: Throw `AppError` or `ValidationError` from services; `errorHandler` serializes known errors and logs unknown errors.

**Prisma Singleton:**
- Purpose: Share one Prisma client with consistent logging and transaction timeout options.
- Examples: `server/src/lib/prisma.ts`, `server/src/repositories/donations-repository.ts`, `server/src/routes/units.ts`
- Pattern: Import the default `prisma` singleton rather than constructing `PrismaClient` in request code.

## Entry Points

**Frontend HTML Entry:**
- Location: `index.html`
- Triggers: Browser loads the Vite bundle.
- Responsibilities: Provides `#root` for React and static document shell.

**Frontend React Entry:**
- Location: `src/main.tsx`
- Triggers: Vite module execution in the browser.
- Responsibilities: Install performance metrics and render `Router` inside `React.StrictMode`.

**Frontend Router:**
- Location: `src/app/router.tsx`
- Triggers: React render from `src/main.tsx`.
- Responsibilities: Declare hash routes, redirects, shared layout, admin routes, and route fallback.

**Backend HTTP Entry:**
- Location: `server/src/index.ts`
- Triggers: `npm --prefix server run dev`, `npm --prefix server run start`, or root `dev:api`.
- Responsibilities: Load environment, validate config, optionally deploy migrations in production, connect Prisma, listen on `PORT`, and graceful shutdown.

**Backend Express App:**
- Location: `server/src/app.ts`
- Triggers: Imported by `server/src/index.ts` and potentially tests.
- Responsibilities: Configure middleware and mount all `/api/*` routers.

**Database Schema and Migrations:**
- Location: `server/prisma/schema.prisma`, `server/prisma/migrations/`
- Triggers: `npm --prefix server run db:migrate`, `db:deploy`, `db:generate`, or server production startup.
- Responsibilities: Define and evolve PostgreSQL tables used by Prisma.

**Development Orchestration Scripts:**
- Location: `scripts/dev.mjs`, `scripts/dev-all.mjs`, `scripts/preview.mjs`
- Triggers: Root `npm run dev`, `npm run dev:all`, and `npm run start`.
- Responsibilities: Start frontend preview/development processes and combined local development workflows.

## Architectural Constraints

- **Threading:** `src/` runs in the browser event loop; `server/src/` runs in a single Node.js process with async I/O and no worker thread layer.
- **Global state:** `server/src/lib/prisma.ts` exports a process-wide Prisma client; `server/src/services/highlights-service.ts` and `server/src/services/telemetry-service.ts` export process-wide singleton services; `src/services/donor-intentions-service.ts` uses browser `localStorage`.
- **Circular imports:** Not detected in sampled imports across `src/` and `server/src/`; imports generally flow from entry/page layers into components/services/helpers and from backend routes into controllers/services/repositories.
- **Auth boundary:** Backend authorization lives in `server/src/middleware/auth.ts`; frontend `src/lib/auth.ts` only controls local UI bypass and never replaces backend checks.
- **API base path:** Frontend calls relative `/api/*` by default through `src/lib/api.ts`; Vite proxies `/api` to `http://localhost:3333` in `vite.config.js`; deployed clients can override with `VITE_API_URL`.
- **Static hosting:** `src/app/router.tsx` uses `HashRouter`, so new frontend routes must work after `#` without server rewrites.
- **Database provider:** `server/prisma/schema.prisma` uses PostgreSQL; repository code assumes Prisma models generated from this schema.
- **Secrets:** Runtime secrets are environment variables consumed by `server/src/config/env.ts`, `server/src/lib/jwt.ts`, and `server/src/routes/auth.ts`; do not read `.env` files or duplicate secret values into code.

## Anti-Patterns

### Bypassing Frontend Service Adapters

**What happens:** Some pages coordinate many service calls directly, while API mechanics are centralized in `src/lib/api.ts` and feature adapters such as `src/services/needs-service.ts`.
**Why it's wrong:** Raw `fetch` in pages would duplicate credentials, CSRF headers, response parsing, and API error handling already defined in `src/lib/api.ts`.
**Do this instead:** Add or extend a typed adapter in `src/services/` or `src/lib/` first, then call it from pages such as `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, or `src/pages/admin/Dashboard.tsx`.

### Adding Complex Backend Logic Directly In Routes

**What happens:** Simple resources use direct route handlers in `server/src/routes/units.ts`, `server/src/routes/residents.ts`, and `server/src/routes/auth.ts`; needs and donations use deeper classes because they have validation, ownership, and pagination rules.
**Why it's wrong:** New complex route-local logic makes validation, authorization, and persistence harder to test and reuse.
**Do this instead:** For new resource workflows with branching rules or persistence policies, follow `server/src/routes/needs.ts` -> `server/src/controllers/needs-controller.ts` -> `server/src/services/needs-service.ts` -> `server/src/repositories/needs-repository.ts`.

### Treating Process Memory As Durable Storage

**What happens:** `server/src/services/highlights-service.ts` stores admin-created highlights in a `Map`, and `server/src/services/telemetry-service.ts` stores telemetry in an in-memory array.
**Why it's wrong:** Process-local data resets on restart and does not scale across multiple API instances.
**Do this instead:** Use process-local services only for ephemeral features; durable resources should get Prisma models in `server/prisma/schema.prisma`, migrations in `server/prisma/migrations/`, repository methods in `server/src/repositories/`, and route/service APIs under `server/src/routes/` and `server/src/services/`.

### Confusing UI Auth State With API Auth

**What happens:** `src/components/Layout.tsx`, `src/hooks/useAdminLogin.ts`, and `src/hooks/useDashboardData.ts` use `localStorage` to guide navigation and local demo behavior.
**Why it's wrong:** `localStorage` is not proof of authorization; protected API mutations rely on the httpOnly cookie validated by `server/src/middleware/auth.ts`.
**Do this instead:** Use frontend auth state only for UI routing, and protect every sensitive backend route with `requireAuth` or `requireAdmin` as shown in `server/src/routes/needs.ts`, `server/src/routes/donations.ts`, `server/src/routes/residents.ts`, `server/src/routes/highlights.ts`, and `server/src/routes/telemetry.ts`.

## Error Handling

**Strategy:** Frontend services throw typed `ApiError` from `src/lib/api.ts`; backend async route failures are forwarded by `server/src/utils/async-handler.ts` into `server/src/middleware/error-handler.ts`, where known `AppError` instances produce controlled JSON responses.

**Patterns:**
- Use `safeParse` with Zod in backend services and route handlers, as in `server/src/services/donations-service.ts`, `server/src/services/needs-service.ts`, `server/src/routes/auth.ts`, and `server/src/routes/residents.ts`.
- Throw `ValidationError` or `AppError` from backend service layers, as in `server/src/services/needs-service.ts` and `server/src/services/donations-service.ts`.
- Return explicit 401/403 responses inside auth middleware in `server/src/middleware/auth.ts`.
- Let public frontend pages fall back to local data where the UX can continue, as in `src/pages/CapsPage.tsx`, `src/pages/Home.tsx`, `src/lib/needs.ts`, and `server/src/data/public-fallback.ts`.
- Use `try/catch` in page-level effects around optional public data such as highlights and needs, as in `src/pages/Home.tsx`.

## Cross-Cutting Concerns

**Logging:** Backend startup and shutdown logs live in `server/src/index.ts`; unknown backend errors are logged in `server/src/middleware/error-handler.ts`; Prisma log levels are configured in `server/src/lib/prisma.ts`.

**Validation:** Frontend form validation is local in `src/services/donations-service.ts` and `src/pages/admin/Dashboard.tsx`; authoritative backend validation uses Zod in `server/src/services/donations-service.ts`, `server/src/services/needs-service.ts`, `server/src/routes/auth.ts`, `server/src/routes/residents.ts`, `server/src/services/highlights-service.ts`, and `server/src/services/telemetry-service.ts`.

**Authentication:** Backend sessions use JWTs signed in `server/src/lib/jwt.ts`, stored with `server/src/lib/session-cookie.ts`, and verified by `server/src/middleware/auth.ts`; frontend login state and local bypass UI live in `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, and `src/lib/auth.ts`.

**Security Middleware:** `server/src/app.ts` applies Helmet, CORS, trusted-origin checks, JSON content-type checks, body size limits, cookie parsing, and per-route rate limits; origin policy and CSRF header rules live in `server/src/config/security.ts`.

**Configuration:** Frontend TypeScript config is `tsconfig.json`; backend TypeScript config is `server/tsconfig.json`; Vite proxy and preview host rules are in `vite.config.js`; backend environment validation is in `server/src/config/env.ts`.

**Fallback Data:** Public/demo fallback data lives in `src/data/mockData.ts` and `server/src/data/public-fallback.ts`; fallback should be explicit and scoped to public UX or local development modes.

---

*Architecture analysis: 2026-05-29*
