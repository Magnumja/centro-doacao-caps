import { Router } from 'express'
import { DonationsController } from '../controllers/donations-controller'
import { requireAuth } from '../middleware/auth'
import { asyncHandler } from '../utils/async-handler'

const router = Router()
const controller = new DonationsController()

router.post('/', asyncHandler(controller.create))
router.get('/', requireAuth, asyncHandler(controller.list))
router.delete('/:id', requireAuth, asyncHandler(controller.remove))

export default router
