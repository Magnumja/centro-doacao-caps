import test from 'node:test'
import assert from 'node:assert/strict'
import { NeedsService } from './needs-service'
import { ValidationError } from '../errors/validation-error'

test('NeedsService.listPaginated returns pagination contract', async () => {
  const mockRepository = {
    listPaginated: async () => [[{ id: 'n1' }, { id: 'n2' }], 5],
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.listPaginated({}, '2', '2')

  assert.equal(result.page, 2)
  assert.equal(result.limit, 2)
  assert.equal(result.total, 5)
  assert.equal(result.hasMore, true)
  assert.equal(result.data.length, 2)
})

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
