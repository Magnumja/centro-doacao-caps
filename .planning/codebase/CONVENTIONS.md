# Coding Conventions

**Analysis Date:** 2026-05-19

## Naming Patterns

**Files:**
- Use PascalCase for React component and page files: `src/components/DonationRequestCard.tsx`, `src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`.
- Use camelCase with `use` prefix for custom hooks: `src/hooks/useDashboardData.ts`, `src/hooks/useAdminLogin.ts`.
- Use kebab-case for frontend service/helper modules: `src/services/needs-service.ts`, `src/services/donor-intentions-service.ts`, `src/lib/performance-metrics.ts`.
- Use kebab-case for backend service, repository, route, middleware, config, and error modules: `server/src/services/needs-service.ts`, `server/src/repositories/needs-repository.ts`, `server/src/middleware/error-handler.ts`, `server/src/config/security.ts`.
- Use global page/component stylesheet files under `src/Styles/` with PascalCase names for page-level CSS: `src/Styles/Home.css`, `src/Styles/Dashboard.css`, `src/Styles/CapsPage.css`.
- Source tests are co-located with backend services using `*.test.ts`: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`, `server/src/services/highlights-service.test.ts`.

**Functions:**
- Use camelCase for functions and methods: `resolvePagination` in `server/src/utils/pagination.ts`, `normalizeNeed` and `fetchNeedsPage` in `src/services/needs-service.ts`, `validateDonationInput` and `registerDonations` in `src/services/donations-service.ts`.
- Use event-handler names prefixed with `handle` inside React pages: `handleLogout` and `handleNeedPublish` in `src/pages/admin/Dashboard.tsx`.
- Use `fetch*`, `create*`, `delete*`, `list*`, and `normalize*` verbs for service functions: `fetchCurrentHost` in `src/services/auth-service.ts`, `createNeed` in `src/services/needs-service.ts`, `listByHost` in `server/src/services/donations-service.ts`.
- Backend controller methods are class fields with arrow functions to preserve `this` when passed into `asyncHandler`: `list = async (...) => {}` and `create = async (...) => {}` in `server/src/controllers/needs-controller.ts`.

**Variables:**
- Use camelCase for local variables and derived values: `localAuthBypassEnabled` in `src/hooks/useDashboardData.ts`, `normalizedResidentSearch` and `pieChartBackground` in `src/pages/admin/Dashboard.tsx`.
- Use uppercase constants only for environment-like or module-wide fixed values: `BASE` and `MUTATION_HEADERS` in `src/lib/api.ts`, `ENV_ADMIN_TOKEN_PREFIX` in `server/src/routes/auth.ts`.
- Use explicit domain names for state setters and collections: `publishedNeeds`, `setPublishedNeeds`, `hostDonations`, and `residents` in `src/hooks/useDashboardData.ts`.

**Types:**
- Use PascalCase for TypeScript types and classes: `Need`, `DonationFormInput`, `NeedsPageResponse`, `AppError`, `ValidationError`.
- Keep public domain types in `src/types/index.ts` and backend query/filter types near their owning modules, such as `NeedFilters` in `server/src/repositories/needs-repository.ts`.
- Use literal union types for constrained domain values: `DonationUrgency`, `DonationStatus`, and `DonationCategoryName` in `src/types/index.ts`; `Priority` in `server/src/repositories/needs-repository.ts`.
- Use `Props` suffix for React component props types: `DonationRequestCardProps` in `src/components/DonationRequestCard.tsx`.

## Code Style

**Formatting:**
- Formatter config: Not detected. No `.prettierrc*`, `eslint.config.*`, `.eslintrc*`, or `biome.json` was found at repo root or below.
- Match the existing TypeScript style: two-space indentation, single quotes, no semicolons, trailing commas in multiline calls and object/array literals.
- Prefer multiline object/function signatures when parameters carry domain meaning, as in `fetchNeedsPage(params: { page?: number, limit?: number, priority?: ... })` in `src/services/needs-service.ts`.
- Preserve the current line-ending and quote style in touched files. Do not introduce broad formatting churn.
- CSS uses block comments and BEM-like class names for component sections, e.g. `.home-institutional-hero__content` and `.home-hero-button--primary` in `src/Styles/Home.css`.

**Linting:**
- Lint tool: Not detected.
- TypeScript strict mode is enabled for frontend and backend through `tsconfig.json` and `server/tsconfig.json`.
- Use `npm run build` for frontend type/build validation and `npm --prefix server run build` for backend type/build validation. Root `npm run build:all` runs both via `package.json`.
- Avoid adding new `any` in application code. Existing `any` appears in API boundary and untyped XML parsing code: `src/lib/api.ts`, `src/services/dashboard-service.ts`, `server/src/services/highlights-service.ts`.
- Test-only repository doubles currently use `as any` to satisfy service constructors: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`.

## Import Organization

**Order:**
1. External packages and Node built-ins first: `react`, `react-router-dom`, `zod`, `express`, `node:test`, `node:assert/strict`.
2. Internal modules next, using relative paths: `../services/needs-service`, `../types`, `../utils/pagination`.
3. Styles and static assets last in frontend files: `../Styles/Home.css`, `../public/logosesau.png`.

**Path Aliases:**
- No path aliases are configured. `tsconfig.json` and `server/tsconfig.json` do not define `paths`.
- Use relative imports consistently. Frontend imports use `../` and `../../`, such as `src/pages/admin/Dashboard.tsx`; backend imports use `../` or `./`, such as `server/src/routes/needs.ts`.

## Error Handling

**Patterns:**
- Backend domain validation uses `zod` schemas and `safeParse`, then throws `ValidationError` or `AppError`: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/errors/validation-error.ts`, `server/src/errors/app-error.ts`.
- Backend async route handlers must be wrapped with `asyncHandler` so thrown errors reach Express error middleware: `server/src/utils/async-handler.ts`, `server/src/routes/needs.ts`, `server/src/routes/donations.ts`.
- Backend error responses are centralized in `server/src/middleware/error-handler.ts`. Throw `AppError` for expected status codes and let unexpected errors become 500 responses.
- Some route modules respond directly for validation/auth cases instead of throwing: `server/src/routes/auth.ts`, `server/src/routes/residents.ts`. Match the local route style when editing those files.
- Frontend API requests should go through `src/lib/api.ts`, which parses JSON/text and throws `ApiError` on non-OK responses.
- Frontend page and hook code catches API errors near UI state updates and sets user-visible messages or fallback state: `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/pages/admin/Dashboard.tsx`, `src/pages/CapsPage.tsx`.
- Silent catch blocks are used only for fallback behavior and optional telemetry/performance paths: `src/services/telemetry-service.ts`, `src/lib/performance-metrics.ts`, `src/hooks/useDashboardData.ts`.

## Logging

**Framework:** console

**Patterns:**
- Backend startup and seed scripts use `console.log`, `console.warn`, and `console.error`: `server/src/index.ts`, `server/src/prisma/seed.ts`.
- Central unexpected error logging lives in `server/src/middleware/error-handler.ts`.
- Frontend app code generally avoids direct console logging. Telemetry is sent through `src/services/telemetry-service.ts` and `src/lib/performance-metrics.ts`.
- Manual API script output is console-based in `server/scripts/test-api.ts`; keep this style for diagnostic scripts only.

## Comments

**When to Comment:**
- Comments are used for user-facing workflow explanation in long UI files, especially `src/pages/admin/Dashboard.tsx`, and for script steps in `server/scripts/test-api.ts`.
- Prefer comments only when the code has non-obvious domain intent, UI derivation, or operational behavior. Example: `src/pages/admin/Dashboard.tsx` documents tab configuration, logout behavior, derived chart data, and accessibility text.
- Avoid comments that restate simple assignments or JSX structure.

**JSDoc/TSDoc:**
- Not used. Types and function names carry most documentation in `src/types/index.ts`, `src/types/dashboard.ts`, and service modules.
- Do not introduce JSDoc/TSDoc unless documenting a public helper contract that cannot be made clear by its type signature.

## Function Design

**Size:** Keep helpers small when possible. `server/src/utils/pagination.ts`, `src/lib/contact.ts`, and `src/services/needs-service.ts` show compact pure helpers. Large UI pages exist (`src/pages/CapsPage.tsx`, `src/pages/admin/Dashboard.tsx`); new logic should be extracted into hooks, services, or helpers instead of increasing these files.

**Parameters:** Prefer typed object parameters when a function has multiple optional or domain fields. Examples: `fetchNeedsPage(params: { ... })` in `src/services/needs-service.ts` and `DonationFormInput` in `src/services/donations-service.ts`.

**Return Values:** Prefer explicit return types for exported React components, hooks, backend controller methods, and service functions when they define a contract. Examples: `DonationRequestCard(...): React.ReactElement`, `useDashboardData(): UseDashboardDataResult`, `asyncHandler(...): void`, and `listPublic(): Promise<HighlightItem[]>`.

## Module Design

**Exports:** Use named exports for reusable services, hooks, helpers, and types. Examples: `export function normalizeNeed`, `export async function createNeed`, `export function useDashboardData`, `export class NeedsService`.

**Default Exports:** Use default exports for React page/component entry points and Express routers where the importer expects one module instance: `src/pages/Home.tsx`, `src/components/DonationRequestCard.tsx`, `server/src/routes/needs.ts`, `server/src/app.ts`.

**Barrel Files:** Not used. Import directly from owning modules. The closest shared type entry point is `src/types/index.ts`, which is imported as `../types`.

**Layer Boundaries:**
- Frontend API transport belongs in `src/lib/api.ts`; domain-specific frontend normalization belongs in `src/services/*.ts`.
- Frontend views should consume services/hooks rather than calling raw `fetch` directly, except isolated telemetry/performance helpers.
- Backend routes wire middleware/controllers only: `server/src/routes/needs.ts`.
- Backend controllers translate HTTP/query/body/auth state into service calls: `server/src/controllers/needs-controller.ts`.
- Backend services own validation and domain decisions: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`.
- Backend repositories own Prisma access: `server/src/repositories/needs-repository.ts`, `server/src/repositories/donations-repository.ts`.

---

*Convention analysis: 2026-05-19*
