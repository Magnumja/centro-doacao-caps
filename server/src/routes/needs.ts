import { Router } from 'express'
import { NeedsController } from '../controllers/needs-controller'
import { requireAuth } from '../middleware/auth'
import { asyncHandler } from '../utils/async-handler'

const router = Router()
const controller = new NeedsController()

router.get('/', asyncHandler(controller.list))
router.post('/', requireAuth, asyncHandler(controller.create))

export default router
