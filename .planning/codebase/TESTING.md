# Testing Patterns

**Analysis Date:** 2026-05-19

## Test Framework

**Runner:**
- Node built-in test runner through `tsx --test`.
- Version source: `server/package.json` uses Node test imports in `server/src/services/*.test.ts` and the script `"test:unit": "tsx --test src/services/*.test.ts"`.
- Config: Not detected. There is no `jest.config.*`, `vitest.config.*`, or `playwright.config.*`.

**Assertion Library:**
- `node:assert/strict`, imported as `assert` in `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`, and `server/src/services/highlights-service.test.ts`.

**Run Commands:**
```bash
npm --prefix server run test:unit   # Run backend service unit tests
npm --prefix server run test:api    # Run manual API smoke script against localhost:3333
npm run build:all                   # Type-check/build frontend and backend
```

No watch-mode or coverage command is defined in `package.json` or `server/package.json`.

## Test File Organization

**Location:**
- Backend unit tests are co-located with services under `server/src/services/`.
- Generated compiled test files also exist under `server/dist/services/`; do not edit generated `server/dist/**` files.
- Frontend tests are not detected under `src/`.

**Naming:**
- Use `*.test.ts` for source unit tests: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`, `server/src/services/highlights-service.test.ts`.
- Test names are plain English strings naming the class and behavior: `NeedsService.listPaginated returns pagination contract`, `HighlightsService CRUD flow works`.

**Structure:**
```text
server/src/services/
├── donations-service.ts
├── donations-service.test.ts
├── highlights-service.ts
├── highlights-service.test.ts
├── needs-service.ts
└── needs-service.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import test from 'node:test'
import assert from 'node:assert/strict'
import { NeedsService } from './needs-service'

test('NeedsService.listPaginated returns pagination contract', async () => {
  const mockRepository = {
    listPaginated: async () => [[{ id: 'n1' }, { id: 'n2' }], 5],
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.listPaginated({}, '2', '2')

  assert.equal(result.page, 2)
  assert.equal(result.limit, 2)
})
```

**Patterns:**
- Tests are independent top-level `test(...)` calls, not nested `describe` suites.
- Arrange dependencies inline in each test. Repository doubles are plain object literals passed into service constructors.
- Use direct assertions with `assert.equal`, `assert.ok`, and `assert.rejects`.
- Prefer testing service behavior through public methods, not private helpers.
- Use async tests when the service method returns a promise: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`.
- Use synchronous tests for synchronous in-memory flows: `HighlightsService CRUD flow works` in `server/src/services/highlights-service.test.ts`.

## Mocking

**Framework:** Plain JavaScript object/function replacement. No Sinon, Jest, Vitest, MSW, or test-double library is installed.

**Patterns:**
```typescript
let capturedSkip: number | undefined
let capturedTake: number | undefined
const mockRepository = {
  listByUnit: async (_unitId: string, skip: number, take: number) => {
    capturedSkip = skip
    capturedTake = take
    return [[], 0]
  },
}

const service = new DonationsService(mockRepository as any)
const result = await service.listByHost('unit-1', 'abc', 'xyz')
```

```typescript
const originalFetch = globalThis.fetch
globalThis.fetch = async () => new Response(xml, {
  status: 200,
  headers: { 'Content-Type': 'application/rss+xml' },
})

try {
  const service = new HighlightsService([])
  const items = await service.listPublic()
  assert.equal(items.length, 1)
} finally {
  globalThis.fetch = originalFetch
}
```

**What to Mock:**
- Mock repositories when testing backend services that depend on Prisma repositories: `NeedsService` in `server/src/services/needs-service.test.ts`, `DonationsService` in `server/src/services/donations-service.test.ts`.
- Mock `globalThis.fetch` when testing feed/network behavior in `HighlightsService`: `server/src/services/highlights-service.test.ts`.
- Capture arguments in local variables when validating repository pagination behavior.

**What NOT to Mock:**
- Do not mock the service under test. Instantiate the real class: `new NeedsService(...)`, `new DonationsService(...)`, `new HighlightsService(...)`.
- Do not mock pure helpers when the public method naturally covers them, such as pagination through `listPaginated` and `listByHost`.
- Do not hit a real database in current unit tests. Repository doubles keep tests isolated from Prisma and migrations.
- Do not edit or assert against generated `server/dist/services/*.test.js` files.

## Fixtures and Factories

**Test Data:**
```typescript
const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <item>
        <title>CAPS Infantojuvenil amplia cuidado psicossocial</title>
        <description><![CDATA[Atendimento de saude mental em Campo Grande. <img src="https://cdn.example.test/caps.jpg" />]]></description>
        <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-infantojuvenil/</link>
        <pubDate>Wed, 10 Sep 2025 13:38:00 +0000</pubDate>
      </item>
    </channel>
  </rss>`
```

**Location:**
- Inline fixtures are used inside test files: `server/src/services/highlights-service.test.ts`, `server/src/services/needs-service.test.ts`.
- Production seed/fallback data is not used as a unit-test fixture source. It lives in `server/src/data/public-fallback.ts`, `server/src/data/highlights.ts`, `src/data/mock.ts`, and `src/data/mockData.ts`.
- The manual API script builds request payloads inline in `server/scripts/test-api.ts`.

## Coverage

**Requirements:** None enforced. No coverage threshold or coverage script is defined.

**View Coverage:**
```bash
# Not configured
```

If coverage is added, keep generated coverage output out of source directories and avoid committing build artifacts.

## Test Types

**Unit Tests:**
- Current automated tests are backend service unit tests only.
- Covered source files: `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, `server/src/services/highlights-service.ts`.
- Scope includes pagination fallback, validation errors, CRUD behavior, and RSS/news filtering behavior.

**Integration Tests:**
- No automated integration test runner is configured.
- `server/scripts/test-api.ts` is a manual smoke script that assumes the API is running at `http://localhost:3333`, logs in with seed credentials, creates a public donation, and lists authenticated donations.
- Use `npm --prefix server run test:api` only as an operator-driven local check. It is not isolated and may write to the configured database.

**E2E Tests:**
- Not used. No Playwright, Cypress, or browser E2E config was detected.

**Frontend Tests:**
- Not detected. There are no `*.test.tsx` or `*.spec.tsx` files under `src/`, and root `package.json` does not define a `test` script.
- Verify frontend changes with `npm run build` until a frontend test runner is added.

## Common Patterns

**Async Testing:**
```typescript
test('NeedsService.create throws ValidationError when payload is invalid', async () => {
  const mockRepository = {
    create: async () => ({ id: 'n1' }),
  }

  const service = new NeedsService(mockRepository as any)

  await assert.rejects(
    () => service.create({ title: 'x' }, 'unit-1'),
    (error: unknown) => error instanceof ValidationError,
  )
})
```

**Error Testing:**
```typescript
await assert.rejects(
  () => service.create({ title: 'x' }, 'unit-1'),
  (error: unknown) => error instanceof ValidationError,
)
```

**State Restoration:**
```typescript
const originalFetch = globalThis.fetch
globalThis.fetch = async () => new Response(xml, { status: 200 })

try {
  // assertions
} finally {
  globalThis.fetch = originalFetch
}
```

**Pagination Argument Capture:**
```typescript
let capturedSkip: number | undefined
let capturedTake: number | undefined

const mockRepository = {
  listPaginated: async (_filters: unknown, skip: number, take: number) => {
    capturedSkip = skip
    capturedTake = take
    return [[], 0]
  },
}
```

## Gaps To Respect When Adding Tests

- Add backend tests near the service being tested in `server/src/services/`.
- Add controller/route integration coverage only after choosing a request-level test tool; no supertest dependency exists.
- Add frontend component/hook tests only after adding and documenting a frontend runner; no Vitest/Jest/Testing Library setup exists.
- Avoid relying on `server/scripts/test-api.ts` for repeatable CI verification because it requires a running server and seed/database state.

---

*Testing analysis: 2026-05-19*
