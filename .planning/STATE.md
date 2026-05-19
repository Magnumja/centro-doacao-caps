# Project State

**Initialized:** 2026-05-19
**Current focus:** Backend Diagnostic
**Status:** Planning only. No implementation approved.

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-19)

**Core value:** O backend precisa registrar e proteger dados operacionais de doacoes, unidades, residentes e administradores de forma confiavel, segura e implantavel em producao.

## Current Phase

### Phase 1: Backend Diagnostic

Goal: document current backend structure, risks and validation signals without code changes.

Artifacts:

- `.planning/backend/ANALYSIS.md`
- `.planning/backend/IMPROVEMENT_PLAN.md`

## Guardrails

- Do not alter implementation files before user approval.
- Preserve existing backend behavior and API contracts.
- Use `.planning/codebase/` as baseline context before suggesting changes.
- Prefer tests before refactors in security-sensitive code.
- Keep Prisma migrations separate from non-schema refactors.

## Validation Signals

- `npm --prefix server run build` passed on 2026-05-19.
- `npm --prefix server run test:unit` passed on 2026-05-19 with 7 tests.
- `npm --prefix server audit --omit=dev --audit-level=moderate` found 0 vulnerabilities on 2026-05-19.

## Next Step

Review `.planning/backend/IMPROVEMENT_PLAN.md` with the user and ask for approval before any code changes.

---
*Last updated: 2026-05-19*
