# Centro Doacao CAPS

## What This Is

Centro Doacao CAPS e uma aplicacao web para conectar visitantes, unidades CAPS e residencias terapeuticas a necessidades de doacao, com area administrativa para gestores acompanharem doacoes, residentes e solicitacoes. O projeto ja possui frontend React/Vite, backend Express/Prisma e banco PostgreSQL.

O foco inicial deste ciclo e o backend: revisar a estrutura existente, documentar riscos e preparar um plano de melhoria sem alterar o funcionamento atual antes de aprovacao explicita.

## Core Value

O backend precisa registrar e proteger dados operacionais de doacoes, unidades, residentes e administradores de forma confiavel, segura e implantavel em producao.

## Requirements

### Validated

- Existing public API exposes units, needs, donations, highlights and healthcheck through Express routes.
- Existing admin auth uses httpOnly JWT cookie with host/admin roles and unit scoping.
- Existing persistence uses Prisma with PostgreSQL models for Unit, Need, Host, Donation and Resident.
- Existing backend build passes with `npm --prefix server run build`.
- Existing backend unit tests pass with `npm --prefix server run test:unit`.
- Existing production dependency audit reports zero moderate-or-higher vulnerabilities with `npm --prefix server audit --omit=dev --audit-level=moderate`.

### Active

- [ ] Analyze backend routes, controllers, services, middleware, Prisma schema, env configuration, integrations and deploy path.
- [ ] Identify backend correctness, organization, security, privacy, scaling and deployment risks.
- [ ] Propose a staged improvement plan that preserves current behavior.
- [ ] List files that would be modified before any implementation starts.
- [ ] Require explicit user approval before code changes.

### Out of Scope

- Frontend redesign or UI behavior changes - this cycle is backend-first.
- Immediate code edits - user requested analysis and plan only.
- Database schema migration execution - schema changes require a separate approved implementation phase.
- Replacing the stack - existing Express, Prisma, PostgreSQL and Vite architecture should be preserved unless a future decision explicitly changes it.

## Context

The codebase map in `.planning/codebase/` was created on 2026-05-19 and is the baseline for this project setup. It shows a split React frontend and Express backend with partial layered backend architecture.

Backend structure:

- API entrypoint: `server/src/index.ts`
- Express composition: `server/src/app.ts`
- Runtime config and request security: `server/src/config/env.ts`, `server/src/config/security.ts`
- Auth middleware and JWT/cookie helpers: `server/src/middleware/auth.ts`, `server/src/lib/jwt.ts`, `server/src/lib/session-cookie.ts`
- Routes: `server/src/routes/*.ts`
- Controllers: `server/src/controllers/*.ts`
- Services: `server/src/services/*.ts`
- Repositories: `server/src/repositories/*.ts`
- Prisma schema and migrations: `server/prisma/schema.prisma`, `server/prisma/migrations/*`

Important current findings:

- `needs` and `donations` follow route -> controller -> service -> repository.
- `auth`, `units`, `residents`, `highlights` and `telemetry` contain more route-local or in-memory logic.
- Production env validation is present and blocks local auth bypass in production.
- Public donation creation is intentionally unauthenticated but relies on origin, CSRF header, validation and rate limiting for abuse resistance.
- Highlights and telemetry are process-local; they are not durable across restarts or multiple API instances.
- Route-level security behavior has little automated coverage compared with service logic.
- Some source literals show encoding drift/mojibake and should be handled in a dedicated cleanup, not mixed into behavior changes.

## Constraints

- **No code changes yet**: Implementation files must not be changed before the user approves a clear plan.
- **Preserve behavior**: Refactors must keep current endpoints, response shapes, auth semantics and deployment expectations stable.
- **Backend first**: Prioritize server routes, services, Prisma, middleware, env and deployment over frontend concerns.
- **Production safety**: Security, cookies, CORS, CSRF, trusted proxy and env validation need regression tests before broad changes.
- **Data privacy**: Donation and resident data include PII, so changes must avoid increasing browser or server retention risk.
- **Current stack**: Express 4, Prisma 5, PostgreSQL, Node 20 and npm remain the working baseline.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with backend diagnostic and plan only | User explicitly requested no code changes yet | Pending approval |
| Use `.planning/codebase/` as required baseline | The repository has already been mapped and committed | Good |
| Preserve existing behavior before refactoring | App appears functional and backend build/tests pass | Pending implementation |
| Require explicit approval before edits to implementation files | User requested a clear plan with files before code changes | Pending approval |

## Evolution

This document evolves at phase transitions and milestone boundaries.

After each phase transition:
1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. What This Is still accurate? Update if drifted.

After each milestone:
1. Full review of all sections.
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-05-19 after backend-first project initialization*
