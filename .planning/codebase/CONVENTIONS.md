# Coding Conventions

**Analysis Date:** 2026-05-29

## Naming Patterns

**Files:**
- Use PascalCase for React page and component files: `src/pages/Donate.tsx`, `src/pages/CapsPage.tsx`, `src/components/DonationRequestCard.tsx`, `src/components/AdminDashboard.tsx`.
- Use `use` + PascalCase for hook files and exported hook functions: `src/hooks/useDashboardData.ts`, `src/hooks/useAdminLogin.ts`.
- Use kebab-case for service and backend support modules: `src/services/needs-service.ts`, `src/services/donor-intentions-service.ts`, `server/src/services/highlights-service.ts`, `server/src/utils/async-handler.ts`.
- Use `.test.ts` beside the backend service under test: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`, `server/src/services/highlights-service.test.ts`.
- Use domain CSS names that mirror pages/components under `src/Styles/`: `src/Styles/Home.css`, `src/Styles/CapsPage.css`, `src/Styles/Dashboard.css`.

**Functions:**
- Export React components as default PascalCase functions returning `React.ReactElement`: `src/pages/Donate.tsx`, `src/components/DonationRequestCard.tsx`, `src/components/ui/NewsCarousel.tsx`.
- Export hooks as named camelCase functions prefixed with `use`: `useDashboardData` in `src/hooks/useDashboardData.ts`, `useAdminLogin` in `src/hooks/useAdminLogin.ts`.
- Use camelCase for service, utility, repository, and controller methods: `normalizeNeed`, `fetchNeedsPage`, `createNeed`, and `deleteNeed` in `src/services/needs-service.ts`; `listPaginated`, `create`, and `delete` in `server/src/services/needs-service.ts`.
- Use verb-based names for API calls and mutations: `fetchCurrentHost` in `src/services/auth-service.ts`, `registerDonations` in `src/services/donations-service.ts`, `removeDonorIntention` in `src/services/donor-intentions-service.ts`.

**Variables:**
- Use camelCase for local state, derived values, and handlers: `activeCategory`, `visibleNeeds`, `hasActiveFilters`, and `resetFilters` in `src/pages/Donate.tsx`.
- Use `is` and `has` prefixes for booleans: `isLoading` in `src/hooks/useAdminLogin.ts`, `isPaused` and `isPageVisible` in `src/components/ui/NewsCarousel.tsx`, `hasMore` in `server/src/services/needs-service.ts`.
- Use uppercase snake case only for module-level constants that behave as stable configuration: `BASE` and `MUTATION_HEADERS` in `src/lib/api.ts`, `STORAGE_KEY` in `src/services/donor-intentions-service.ts`.
- Use plural names for arrays and collections: `publishedNeeds`, `hostDonations`, and `residents` in `src/hooks/useDashboardData.ts`; `fallbackImages` in `server/src/services/highlights-service.ts`.

**Types:**
- Use PascalCase type aliases for domain types: `Cap`, `Need`, `Donation`, `Resident`, and `ProjectStats` in `src/types/index.ts`.
- Use a `Props` suffix for component prop types: `DonationRequestCardProps` in `src/components/DonationRequestCard.tsx`, `CategoryFilterProps` in `src/components/CategoryFilter.tsx`, `StatusBadgeProps` in `src/components/StatusBadge.tsx`.
- Use `Api*`, `Create*Payload`, and `*Response` names for API boundary types: `ApiNeed`, `CreateNeedPayload`, and `NeedsPageResponse` in `src/services/needs-service.ts`.
- Use backend class names ending in the role they own: `NeedsService` in `server/src/services/needs-service.ts`, `NeedsRepository` in `server/src/repositories/needs-repository.ts`, `NeedsController` in `server/src/controllers/needs-controller.ts`.

## Code Style

**Formatting:**
- No formatter configuration is present. There is no `.prettierrc`, `eslint.config.*`, `.eslintrc*`, or `biome.json` at repo root.
- Preserve the existing TypeScript style: two-space indentation, single quotes, no semicolons, and trailing commas in multiline calls/objects where already used.
- Keep JSX readable with one prop per line for multiline elements, as in `src/pages/Donate.tsx` and `src/components/DonationRequestCard.tsx`.
- Use explicit `React.ReactElement` return types for exported React components, matching `src/pages/Donate.tsx`, `src/components/Layout.tsx`, and `src/components/ui/NewsCarousel.tsx`.
- Keep strict TypeScript enabled. Frontend strictness is configured in `tsconfig.json`; backend strictness is configured in `server/tsconfig.json`.

**Linting:**
- Linting tool: Not detected.
- Type checking is the main static quality gate. Root scripts in `package.json` run `vite build`; backend scripts in `server/package.json` run `tsc` through `npm --prefix server run build`.
- Do not introduce path aliases unless `tsconfig.json` and `server/tsconfig.json` are updated together; current code uses relative imports only.

## Import Organization

**Order:**
1. External packages first: `react`, `react-router-dom`, `zod`, `express`, `@prisma/client`.
2. Internal domain modules next: components, services, hooks, data, repositories, errors, and types.
3. Side-effect imports last: CSS in frontend components/pages, such as `src/pages/Donate.tsx` importing `src/Styles/Home.css`, and Leaflet CSS in `src/components/CapsMap.tsx`.

**Path Aliases:**
- No path aliases are configured in `tsconfig.json` or `server/tsconfig.json`.
- Use relative imports from the current file: `../services/needs-service` in `src/pages/admin/Dashboard.tsx`, `../errors/app-error` in `server/src/services/needs-service.ts`, `./needs-service` in `server/src/services/needs-service.test.ts`.

## Error Handling

**Patterns:**
- Validate backend request and service payloads with Zod `safeParse`, then throw `ValidationError` or `AppError`: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/controllers/needs-controller.ts`.
- Route async failures through `asyncHandler` so Express reaches the shared error middleware: `server/src/utils/async-handler.ts`, `server/src/routes/needs.ts`, `server/src/routes/donations.ts`, `server/src/routes/highlights.ts`.
- Convert domain failures to HTTP responses through `AppError` in `server/src/errors/app-error.ts` and `errorHandler` in `server/src/middleware/error-handler.ts`.
- Use `ValidationError` for Zod field errors so responses include flattened `details`: `server/src/errors/validation-error.ts`.
- On the frontend, centralize fetch response parsing in `src/lib/api.ts`. Failed HTTP responses should throw `ApiError` with `message`, `status`, and optional `details`.
- In React hooks and pages, catch user-facing failures locally and update UI state, as in `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/pages/CapsPage.tsx`, and `src/pages/admin/Dashboard.tsx`.
- Guard browser-only APIs for SSR/build safety: `typeof window === 'undefined'` in `src/services/donor-intentions-service.ts`, `typeof document === 'undefined'` in `src/components/ui/NewsCarousel.tsx`.

## Logging

**Framework:** console

**Patterns:**
- Use `console.log`, `console.warn`, and `console.error` in backend process scripts and entrypoints only: `server/src/index.ts`, `server/src/prisma/seed.ts`, `server/scripts/test-api.ts`.
- Use `console.error` in `server/src/middleware/error-handler.ts` only for unhandled server errors; known `AppError` failures return structured JSON without logging.
- Use telemetry for frontend interaction tracking instead of console logging: `trackEvent` in `src/components/ui/NewsCarousel.tsx`, `src/lib/performance-metrics.ts`, and `src/services/telemetry-service.ts`.

## Comments

**When to Comment:**
- Keep comments sparse and explanatory. Existing comments document domain intent or non-obvious steps, such as the `Need` domain comment in `src/types/index.ts` and the API smoke-test steps in `server/scripts/test-api.ts`.
- Avoid restating obvious assignments. Add comments only when they clarify workflow, browser behavior, security, or domain context.

**JSDoc/TSDoc:**
- Not used. Existing code uses plain TypeScript types rather than JSDoc/TSDoc annotations.
- Prefer exported types in `src/types/index.ts`, `src/types/dashboard.ts`, and service-local type aliases over doc comments for API shape.

## Function Design

**Size:** Keep most utilities and service methods short and single-purpose. Larger UI pages already exist in `src/pages/CapsPage.tsx` and `src/pages/admin/Dashboard.tsx`; new behavior should be extracted to hooks, components, or services when it starts to duplicate patterns from those files.

**Parameters:** Pass object payloads for create/update operations and grouped options: `CreateNeedPayload` in `src/services/needs-service.ts`, `DonationFormInput` in `src/services/donations-service.ts`, and `NeedFilters` in `server/src/repositories/needs-repository.ts`.

**Return Values:** Return typed domain objects, arrays, or pagination contracts. Use `Promise<void>` for mutations with no response body, such as `deleteNeed` in `src/services/needs-service.ts` and `remove` in `server/src/controllers/needs-controller.ts`.

## Module Design

**Exports:** Use default exports for React components and named exports for hooks, services, utilities, backend classes, and domain types. Examples: default `DonationRequestCard` in `src/components/DonationRequestCard.tsx`, named `useDashboardData` in `src/hooks/useDashboardData.ts`, named `NeedsService` in `server/src/services/needs-service.ts`.

**Barrel Files:** Not used. Import modules directly from their concrete files: `src/app/router.tsx`, `src/pages/Home.tsx`, `server/src/routes/needs.ts`.

**Frontend Placement:** Put reusable UI in `src/components/`, route-level screens in `src/pages/`, frontend API adapters in `src/services/`, shared browser/domain helpers in `src/lib/`, and shared types in `src/types/`.

**Backend Placement:** Put Express route registration in `server/src/routes/`, request/response orchestration in `server/src/controllers/`, business rules in `server/src/services/`, Prisma access in `server/src/repositories/`, cross-cutting middleware in `server/src/middleware/`, and reusable errors/utilities in `server/src/errors/` and `server/src/utils/`.

---

*Convention analysis: 2026-05-29*
