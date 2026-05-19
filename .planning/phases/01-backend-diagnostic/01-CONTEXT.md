# Phase 1: Backend Diagnostic - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>

## Phase Boundary

This phase closes the implementation context for the backend-first improvement work. It does not implement backend changes itself; it records the decisions that downstream planning must follow when creating the first executable backend improvement plan.

The phase is scoped to the existing Express/Prisma backend under `server/`, with emphasis on route organization, contract preservation, route-level tests, public donation abuse risk, PII handling, Prisma query planning and production deploy concerns.

</domain>

<decisions>

## Implementation Decisions

### Backend Organization Priority

- **D-01:** The next implementation plan should prioritize backend organization before security hardening or deploy cleanup.
- **D-02:** The target backend pattern is `route -> controller -> service -> repository` for all backend domains.
- **D-03:** Use the existing `needs` and `donations` layering as the local reference pattern, but do not assume those implementations are perfect.
- **D-04:** The first refactor should avoid sensitive security and Prisma files. Start with less-sensitive domains such as `units`, `residents`, `highlights` and `telemetry`.
- **D-05:** Do not modify `auth`, `middleware/auth`, `config/security`, `lib/jwt`, session cookie behavior, `schema.prisma` or migrations in the first refactor.
- **D-06:** Preserve API compatibility, but allow small response cleanup when it is clearly inconsistent, documented and covered by tests.

### Security and Testing

- **D-07:** Require route-level contract tests as the main safety net for refactors.
- **D-08:** Route contract tests should verify HTTP behavior: status codes, JSON response shape, auth requirements, error behavior and unit scoping.
- **D-09:** For public donations, keep the public endpoint concept but plan anti-spam mitigation now. Planning should evaluate CAPTCHA, honeypot or simple verification.
- **D-10:** PII handling should include a minimum retention posture now: collect only what is needed, preserve anonymous donation data clearing, avoid prolonged browser storage and provide a simple manual deletion path.
- **D-11:** Auth and security code should be mapped into a technical backlog only for the first refactor. Do not change those files in the first implementation cycle.

### Prisma, Data and Deploy

- **D-12:** Prisma schema and migrations remain frozen for the first implementation cycle.
- **D-13:** Planning may propose database indexes without changing model fields or relationships, especially around frequent filters such as `unitId`, `priority` and `registeredAt`.
- **D-14:** Protected/admin lists that can grow should be paginated now, especially `residents`.
- **D-15:** Pagination is allowed to change contracts only when explicitly planned, tested and coordinated with current frontend consumers.
- **D-16:** Production deploy is more important than local Docker setup in this cycle. Focus deploy review on Hostinger/Render/Node deployment, environment variables, proxy/cookie behavior, migrations and seed order.
- **D-17:** `highlights` and `telemetry` in-memory behavior is an accepted limitation for now. Document that state is lost on restart and divergent across multiple API instances, but do not persist them in the first implementation cycle.

### the agent's Discretion

- The planner may decide the exact order among `units`, `residents`, `highlights` and `telemetry`, but should prefer lowest behavioral risk first.
- The planner may choose test tooling details as long as route-level HTTP contracts are covered and existing commands continue to pass.
- The planner may defer pagination for a specific endpoint if preserving current frontend behavior would make the change too risky for the first implementation plan, but must document that tradeoff.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning

- `.planning/PROJECT.md` - Project context, backend-first guardrails and no-code-change approval constraint.
- `.planning/REQUIREMENTS.md` - Requirement IDs and phase traceability.
- `.planning/ROADMAP.md` - Phase boundaries, success criteria and future phase separation.
- `.planning/STATE.md` - Current workflow state and validation signals.
- `.planning/backend/ANALYSIS.md` - Backend diagnostic findings, risk priorities and validation results.
- `.planning/backend/IMPROVEMENT_PLAN.md` - Proposed staged improvement plan and file sensitivity notes.

### Codebase Map

- `.planning/codebase/STACK.md` - Backend stack, runtime, scripts and dependency baseline.
- `.planning/codebase/ARCHITECTURE.md` - Current backend layering and data flow.
- `.planning/codebase/STRUCTURE.md` - Directory layout and where to add code.
- `.planning/codebase/INTEGRATIONS.md` - External integrations, auth, storage, cache and deploy findings.
- `.planning/codebase/CONCERNS.md` - Known risks, security considerations and test gaps.
- `.planning/codebase/TESTING.md` - Existing backend test strategy and gaps.

### Backend Source Areas

- `server/src/app.ts` - Express composition, middleware, rate limits and route mounts.
- `server/src/routes/*.ts` - Current route behavior and direct Prisma/service usage.
- `server/src/controllers/*.ts` - Existing controller pattern for needs/donations.
- `server/src/services/*.ts` - Domain service behavior and current service tests.
- `server/src/repositories/*.ts` - Existing Prisma repository pattern.
- `server/src/config/env.ts` - Production env validation; do not modify in first refactor.
- `server/src/config/security.ts` - CORS/CSRF/trusted-origin logic; do not modify in first refactor.
- `server/src/middleware/auth.ts` - Auth and local bypass; do not modify in first refactor.
- `server/src/lib/jwt.ts` - JWT signing/verification; do not modify in first refactor.
- `server/src/lib/session-cookie.ts` - Cookie options; do not modify in first refactor.
- `server/prisma/schema.prisma` - Data model baseline; do not modify in first refactor.
- `server/prisma/migrations/*` - Migration history; do not modify in first refactor.
- `DEPLOYMENT.md` - Production deploy expectations.
- `server/README.md` - Backend setup and route documentation.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `server/src/controllers/needs-controller.ts` and `server/src/controllers/donations-controller.ts`: Existing controller class pattern with arrow-function handlers.
- `server/src/services/needs-service.ts` and `server/src/services/donations-service.ts`: Existing service-level Zod validation and domain error pattern.
- `server/src/repositories/needs-repository.ts` and `server/src/repositories/donations-repository.ts`: Existing repository boundary around Prisma.
- `server/src/utils/async-handler.ts`: Standard wrapper for async Express handlers.
- `server/src/errors/app-error.ts` and `server/src/errors/validation-error.ts`: Existing structured error mechanisms.
- `server/src/utils/pagination.ts`: Existing pagination helper used by needs and donations.

### Established Patterns

- Backend API composition happens centrally in `server/src/app.ts`.
- `needs` and `donations` already use layered route/controller/service/repository structure.
- `auth`, `units` and `residents` currently mix route behavior and Prisma access in route modules.
- `highlights` and `telemetry` use singleton services with process-local state.
- Validation uses Zod in services or route boundaries.
- Expected failures should use `AppError` or `ValidationError` and flow through `server/src/middleware/error-handler.ts`.
- Production security configuration is validated at startup through `server/src/config/env.ts`.

### Integration Points

- Public APIs are mounted under `/api/units`, `/api/needs`, `/api/donations`, `/api/highlights`, `/api/telemetry` and `/api/health`.
- Admin/session APIs are mounted under `/api/auth`, `/api/residents`, protected donation reads/deletes, protected need creation, protected highlight writes and telemetry summary.
- Frontend API wrappers depend on existing paths and response shapes, so compatibility must be checked before cleanup.
- Prisma access should remain centralized through `server/src/lib/prisma.ts`.
- Production deploy depends on `server/package.json`, `server/Dockerfile`, `DEPLOYMENT.md`, env examples and Prisma migrate/seed commands.

</code_context>

<specifics>

## Specific Ideas

- Prefer organization-first implementation, but avoid high-risk auth/security/Prisma files initially.
- Plan route-level contract tests as the safety net for any domain refactor.
- Treat anti-spam for public donations as a planning requirement, not an immediate endpoint shutdown.
- Treat minimum PII retention documentation as part of backend stabilization.
- Focus deploy work on production hosting and runtime correctness, not local Docker Compose.

</specifics>

<deferred>

## Deferred Ideas

- Auth/security refactor is deferred to a later phase or a separate approved plan.
- Prisma schema field changes, model changes and migrations are deferred.
- Persisting `highlights` and `telemetry` is deferred; current in-memory behavior is accepted with documentation.
- Docker Compose local setup is deferred.
- Full privacy workflows such as export, audit trail and formal retention automation are deferred.

</deferred>

---

*Phase: 1-Backend Diagnostic*
*Context gathered: 2026-05-19*
