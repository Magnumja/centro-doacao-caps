import test from 'node:test'
import assert from 'node:assert/strict'
import { DonationsService } from './donations-service'

test('DonationsService.listByHost falls back when pagination params are invalid', async () => {
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

  assert.equal(capturedSkip, 0)
  assert.equal(capturedTake, 20)
  assert.equal(result.page, 1)
  assert.equal(result.limit, 20)
})
