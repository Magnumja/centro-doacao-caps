import { Router, Request, Response } from 'express'
import { requireAdmin } from '../middleware/auth'
import { asyncHandler } from '../utils/async-handler'
import { telemetryService } from '../services/telemetry-service'

const router = Router()

router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  telemetryService.track(req.body)
  res.status(202).json({ accepted: true })
}))

router.get('/summary', requireAdmin, asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.json(telemetryService.summary())
}))

export default router
