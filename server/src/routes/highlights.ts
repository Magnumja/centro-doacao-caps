import { Router, Request, Response } from 'express'
import { requireAdmin } from '../middleware/auth'
import { highlightsService } from '../services/highlights-service'
import { asyncHandler } from '../utils/async-handler'

const router = Router()

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'public, max-age=120')
  res.json(await highlightsService.listPublic())
}))

router.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const created = highlightsService.create(req.body)
  res.status(201).json(created)
}))

router.put('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updated = highlightsService.update(req.params.id, req.body)
  res.json(updated)
}))

router.delete('/:id', requireAdmin, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  highlightsService.remove(req.params.id)
  res.status(204).send()
}))

export default router
