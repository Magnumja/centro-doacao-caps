# Codebase Structure

**Analysis Date:** 2026-05-19

## Directory Layout

```text
centro-doacao-caps/
+-- .github/              # Review agent prompts and GitHub-side helper metadata
+-- .planning/            # GSD planning and codebase map documents
+-- public/               # Static assets served by Vite URL paths
+-- scripts/              # Root development and preview process wrappers
+-- server/               # Express/Prisma API application
|   +-- prisma/            # Prisma schema and committed migrations
|   +-- scripts/           # Backend utility scripts
|   +-- src/               # Backend TypeScript source
|   |   +-- config/        # Environment and security configuration
|   |   +-- controllers/   # Express request adapters for controller-backed domains
|   |   +-- data/          # Seed/fallback data used by API services/routes
|   |   +-- errors/        # AppError and validation error classes
|   |   +-- lib/           # Prisma, JWT, and session-cookie helpers
|   |   +-- middleware/    # Auth and error middleware
|   |   +-- prisma/        # Seed entrypoint source
|   |   +-- repositories/  # Prisma persistence wrappers
|   |   +-- routes/        # Express routers mounted by app.ts
|   |   +-- services/      # Domain services and in-memory service singletons
|   |   +-- utils/         # Async and pagination utilities
+-- src/                  # Vite React frontend source
|   +-- app/               # Frontend router
|   +-- components/        # Shared UI components
|   |   +-- ui/            # Lower-level UI widgets
|   +-- data/              # Frontend mock/local data
|   +-- hooks/             # Frontend workflow hooks
|   +-- lib/               # Frontend helper and transport modules
|   +-- pages/             # Route-level React pages
|   |   +-- admin/         # Admin route pages
|   +-- public/            # Importable frontend image assets
|   +-- services/          # Frontend API/localStorage services
|   +-- Styles/            # CSS files grouped by page/area
|   +-- theme/             # Theme provider and hook
|   +-- types/             # Shared frontend TypeScript types
+-- index.html            # Vite HTML entrypoint
+-- package.json          # Root frontend/dev scripts and dependencies
+-- tsconfig.json         # Frontend TypeScript config
+-- vite.config.js        # Vite React config and API proxy
```

## Directory Purposes

**Root:**
- Purpose: Host the frontend app, shared project docs, deployment docs, and dev scripts.
- Contains: `package.json`, `package-lock.json`, `index.html`, `vite.config.js`, `tsconfig.json`, `README.md`, `DEPLOYMENT.md`, `docker-compose.yml`
- Key files: `package.json`, `vite.config.js`, `index.html`

**`src/app`:**
- Purpose: Frontend route table and app-level navigation composition.
- Contains: Router component.
- Key files: `src/app/router.tsx`

**`src/pages`:**
- Purpose: Route-level frontend screens and page workflow orchestration.
- Contains: Public pages plus `src/pages/admin` pages.
- Key files: `src/pages/Home.tsx`, `src/pages/CapsPage.tsx`, `src/pages/Donate.tsx`, `src/pages/YourDonations.tsx`, `src/pages/AboutProject.tsx`, `src/pages/admin/Login.tsx`, `src/pages/admin/Dashboard.tsx`

**`src/components`:**
- Purpose: Shared visual components used across frontend pages.
- Contains: Cards, badges, map, layout, stats, ranking, carousel, skeleton, and theme toggle components.
- Key files: `src/components/Layout.tsx`, `src/components/CapsCard.tsx`, `src/components/DonationRequestCard.tsx`, `src/components/CapsMap.tsx`, `src/components/ui/NewsCarousel.tsx`, `src/components/ui/ThemeToggle.tsx`

**`src/services`:**
- Purpose: Frontend service wrappers for API calls and local browser persistence.
- Contains: API service modules for auth, dashboard, donations, highlights, needs, telemetry, units, and donor intentions.
- Key files: `src/services/auth-service.ts`, `src/services/dashboard-service.ts`, `src/services/donations-service.ts`, `src/services/needs-service.ts`, `src/services/units-service.ts`, `src/services/donor-intentions-service.ts`

**`src/lib`:**
- Purpose: Frontend helper modules that are not tied to a single page.
- Contains: API transport, auth bypass detection, contact URL helpers, needs fetch fallback, performance telemetry, UI sizing utilities.
- Key files: `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/needs.ts`, `src/lib/performance-metrics.ts`, `src/lib/contact.ts`, `src/lib/ui-utils.ts`

**`src/hooks`:**
- Purpose: Reusable React workflow hooks for admin flows.
- Contains: Login and dashboard data hooks.
- Key files: `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`

**`src/types`:**
- Purpose: Frontend TypeScript contracts shared between pages, components, hooks, and services.
- Contains: Domain types, dashboard types, and asset module declarations.
- Key files: `src/types/index.ts`, `src/types/dashboard.ts`, `src/types/assets.d.ts`

**`src/data`:**
- Purpose: Frontend seed/mock data and highlight content.
- Contains: Mock CAPS, needs, donations, stats, and static highlights.
- Key files: `src/data/mock.ts`, `src/data/mockData.ts`, `src/data/highlights.ts`

**`src/Styles`:**
- Purpose: CSS grouped by major page or layout area.
- Contains: Page and layout CSS files.
- Key files: `src/Styles/Layout.css`, `src/Styles/Home.css`, `src/Styles/CapsPage.css`, `src/Styles/Dashboard.css`, `src/Styles/Login.css`

**`src/theme`:**
- Purpose: Browser theme state and context.
- Contains: Theme provider and hook.
- Key files: `src/theme/ThemeProvider.tsx`

**`public`:**
- Purpose: Static assets served from site root paths such as `/logosesau.png`.
- Contains: CAPS/unit photos, logos, `robots.txt`.
- Key files: `public/logosesau.png`, `public/SESAU.png`, `public/robots.txt`

**`src/public`:**
- Purpose: Importable image assets for React modules.
- Contains: CAPS/unit photos and logos mirrored from `public`.
- Key files: `src/public/capsmargarida.jpg`, `src/public/logosesau.png`

**`server`:**
- Purpose: Backend API project with its own package, build, Prisma schema, scripts, and TypeScript config.
- Contains: `server/package.json`, `server/tsconfig.json`, `server/src`, `server/prisma`, `server/scripts`, `server/README.md`
- Key files: `server/src/index.ts`, `server/src/app.ts`, `server/prisma/schema.prisma`

**`server/src/routes`:**
- Purpose: Express router modules mounted by `server/src/app.ts`.
- Contains: `auth`, `units`, `needs`, `donations`, `residents`, `highlights`, and `telemetry` routers.
- Key files: `server/src/routes/auth.ts`, `server/src/routes/needs.ts`, `server/src/routes/donations.ts`, `server/src/routes/units.ts`, `server/src/routes/residents.ts`

**`server/src/controllers`:**
- Purpose: Request/response adaptation for domains with a controller layer.
- Contains: Needs and donations controller classes.
- Key files: `server/src/controllers/needs-controller.ts`, `server/src/controllers/donations-controller.ts`

**`server/src/services`:**
- Purpose: Backend domain behavior, validation, and service-level orchestration.
- Contains: Needs, donations, highlights, telemetry services and unit tests.
- Key files: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/services/highlights-service.ts`, `server/src/services/telemetry-service.ts`

**`server/src/repositories`:**
- Purpose: Prisma persistence access for domains using repository separation.
- Contains: Needs and donations repositories.
- Key files: `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts`

**`server/src/middleware`:**
- Purpose: Express middleware for authentication and centralized errors.
- Contains: JWT auth, admin guard, local auth bypass, not-found handler, error handler.
- Key files: `server/src/middleware/auth.ts`, `server/src/middleware/error-handler.ts`

**`server/src/config`:**
- Purpose: Environment and request security configuration.
- Contains: Production env validation, CORS origin checks, trusted origin and content-type guards.
- Key files: `server/src/config/env.ts`, `server/src/config/security.ts`

**`server/src/lib`:**
- Purpose: Backend shared libraries and small integration helpers.
- Contains: Prisma singleton, JWT signing/verification, session cookie options.
- Key files: `server/src/lib/prisma.ts`, `server/src/lib/jwt.ts`, `server/src/lib/session-cookie.ts`

**`server/prisma`:**
- Purpose: Database schema and migrations.
- Contains: Prisma schema, migration lock, timestamped SQL migrations.
- Key files: `server/prisma/schema.prisma`, `server/prisma/migrations/20260330212620_init/migration.sql`, `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`

**`scripts`:**
- Purpose: Root process wrappers for local development and static preview.
- Contains: Node scripts used by root `package.json`.
- Key files: `scripts/dev.mjs`, `scripts/dev-all.mjs`, `scripts/preview.mjs`

## Key File Locations

**Entry Points:**
- `index.html`: Browser HTML entrypoint and CSP metadata.
- `src/main.tsx`: React bootstrap.
- `src/app/router.tsx`: Frontend route table.
- `server/src/index.ts`: API process entrypoint.
- `server/src/app.ts`: Express application composition.

**Configuration:**
- `package.json`: Root frontend and orchestration scripts.
- `server/package.json`: Backend scripts and dependencies.
- `vite.config.js`: React plugin, preview host allowlist, and `/api` proxy to `http://localhost:3333`.
- `tsconfig.json`: Frontend TypeScript compiler settings.
- `server/tsconfig.json`: Backend TypeScript compiler settings.
- `server/src/config/env.ts`: Runtime environment validation.
- `server/src/config/security.ts`: CORS and request trust checks.
- `.env.example`: Root frontend environment template, existence only.
- `.env.production.example`: Root frontend production environment template, existence only.
- `server/.env.example`: Backend environment template, existence only.
- `server/.env.production.example`: Backend production environment template, existence only.

**Core Logic:**
- `src/lib/api.ts`: Browser API transport.
- `src/services/needs-service.ts`: Frontend needs API normalization.
- `src/services/donations-service.ts`: Frontend donation validation and registration.
- `src/services/units-service.ts`: Frontend unit API mapping.
- `server/src/controllers/needs-controller.ts`: Needs HTTP controller.
- `server/src/services/needs-service.ts`: Needs validation and pagination.
- `server/src/repositories/needs-repository.ts`: Needs Prisma queries.
- `server/src/controllers/donations-controller.ts`: Donations HTTP controller.
- `server/src/services/donations-service.ts`: Donations validation and permissions.
- `server/src/repositories/donations-repository.ts`: Donations Prisma queries.
- `server/prisma/schema.prisma`: Persistent domain model.

**Authentication and Security:**
- `server/src/routes/auth.ts`: Login, logout, and current-host endpoints.
- `server/src/middleware/auth.ts`: Auth middleware, admin guard, local bypass.
- `server/src/lib/jwt.ts`: JWT payload schema and signing/verification.
- `server/src/lib/session-cookie.ts`: Cookie options.
- `src/hooks/useAdminLogin.ts`: Frontend login workflow.
- `src/hooks/useDashboardData.ts`: Frontend current-host/dashboard loading workflow.
- `src/lib/auth.ts`: Frontend local auth bypass detection.

**Testing:**
- `server/src/services/needs-service.test.ts`: Node test coverage for needs service.
- `server/src/services/donations-service.test.ts`: Node test coverage for donations service.
- `server/src/services/highlights-service.test.ts`: Node test coverage for highlights service.
- `server/scripts/test-api.ts`: Backend API smoke script.

**Documentation:**
- `README.md`: Frontend and project usage notes.
- `server/README.md`: Backend setup, routes, and security notes.
- `DEPLOYMENT.md`: Production deployment checklist and environment guidance.
- `.planning/codebase/ARCHITECTURE.md`: Architecture map.
- `.planning/codebase/STRUCTURE.md`: Structure map.

## Naming Conventions

**Files:**
- React components use PascalCase filenames: `src/components/CapsCard.tsx`, `src/pages/AboutProject.tsx`.
- Route-level frontend pages use PascalCase: `src/pages/Home.tsx`, `src/pages/admin/Dashboard.tsx`.
- Frontend hooks use `useX.ts`: `src/hooks/useDashboardData.ts`, `src/hooks/useAdminLogin.ts`.
- Frontend and backend service modules use kebab-case with `-service`: `src/services/needs-service.ts`, `server/src/services/donations-service.ts`.
- Backend route modules use lowercase domain names: `server/src/routes/needs.ts`, `server/src/routes/auth.ts`.
- Backend controller and repository modules use kebab-case with suffixes: `server/src/controllers/needs-controller.ts`, `server/src/repositories/needs-repository.ts`.
- CSS files use PascalCase by page/area in `src/Styles`: `src/Styles/CapsPage.css`, `src/Styles/Dashboard.css`.
- Prisma migrations use timestamped folders under `server/prisma/migrations`.

**Directories:**
- Frontend feature categories are plural or role-based: `src/components`, `src/pages`, `src/services`, `src/hooks`, `src/types`.
- Admin frontend pages are nested under `src/pages/admin`.
- Shared smaller UI widgets live under `src/components/ui`.
- Backend layers are plural directories: `server/src/routes`, `server/src/services`, `server/src/repositories`, `server/src/controllers`.
- Backend infrastructure helpers live under `server/src/lib`, `server/src/config`, `server/src/middleware`, and `server/src/utils`.

## Where to Add New Code

**New Public Frontend Page:**
- Primary code: `src/pages`
- Route registration: `src/app/router.tsx`
- Shared layout navigation: `src/components/Layout.tsx`
- Styles: `src/Styles`
- API calls: `src/services`

**New Admin Frontend Page or Dashboard View:**
- Primary code: `src/pages/admin`
- Shared admin data loading: `src/hooks`
- API calls and DTO mapping: `src/services`
- Styles: `src/Styles/Dashboard.css` or a new area CSS file in `src/Styles`

**New Reusable UI Component:**
- Implementation: `src/components`
- Generic UI widget: `src/components/ui`
- Shared types: `src/types`
- Styles: existing area CSS in `src/Styles` or a matching new CSS file.

**New Frontend API Endpoint Wrapper:**
- Transport: reuse `src/lib/api.ts`
- Service: add or extend a file in `src/services`
- Normalized types: add to `src/types/index.ts` or `src/types/dashboard.ts` when used across modules.
- Page consumption: call services from pages or hooks, not directly from components unless the component owns the interaction.

**New Backend Domain Endpoint:**
- Route: `server/src/routes`
- Controller: `server/src/controllers`
- Service: `server/src/services`
- Repository: `server/src/repositories`
- Mount: `server/src/app.ts`
- Validation: use Zod in the service or route boundary.
- Errors: use `server/src/errors/app-error.ts` or `server/src/errors/validation-error.ts`.

**New Backend Auth-Protected Endpoint:**
- Route: `server/src/routes`
- Middleware: use `requireAuth` or `requireAdmin` from `server/src/middleware/auth.ts`
- Unit scoping: read `req.authHost!.unitId` and keep host data scoped by unit unless admin behavior is explicit.

**New Database Model or Field:**
- Schema: `server/prisma/schema.prisma`
- Migration: `server/prisma/migrations`
- Seed data: `server/src/prisma/seed.ts`
- Persistence access: `server/src/repositories`
- Frontend DTO mapping: `src/services` and `src/types`

**New Public Fallback Data:**
- Backend fallback: `server/src/data/public-fallback.ts`
- Frontend fallback: `src/data/mock.ts` or `src/data/mockData.ts` only when the UI needs last-resort data.
- Prefer matching backend and frontend shapes through service normalizers in `src/services`.

**Utilities:**
- Frontend shared helpers: `src/lib`
- Backend shared helpers: `server/src/utils` for general utilities, `server/src/lib` for integration-ish helpers.
- Backend config helpers: `server/src/config`

## Special Directories

**`dist`:**
- Purpose: Vite production build output.
- Generated: Yes, by `npm run build`.
- Committed: No tracked files detected.

**`node_modules`:**
- Purpose: Installed npm dependencies.
- Generated: Yes, by npm install.
- Committed: No.

**`.planning`:**
- Purpose: GSD project planning and codebase mapping artifacts.
- Generated: Yes, by GSD workflows.
- Committed: Project-dependent; current codebase map documents live in `.planning/codebase`.

**`.github/agents`:**
- Purpose: Repository-specific code review agent prompt files.
- Generated: No.
- Committed: Present in repository metadata path.

**`.codex-edge-profile`:**
- Purpose: Local browser/profile cache generated by Codex browser tooling.
- Generated: Yes.
- Committed: No tracked files detected.

**`public`:**
- Purpose: Vite static public assets reachable by root-relative URLs.
- Generated: No.
- Committed: Yes.

**`src/public`:**
- Purpose: Image assets importable from TypeScript/React modules.
- Generated: No.
- Committed: Yes.

**`server/prisma/migrations`:**
- Purpose: Database migration history.
- Generated: Yes, by Prisma migrate commands.
- Committed: Yes.

**`server/dist`:**
- Purpose: Backend TypeScript build output.
- Generated: Yes, by `npm --prefix server run build`.
- Committed: No tracked files detected.

---

*Structure analysis: 2026-05-19*
