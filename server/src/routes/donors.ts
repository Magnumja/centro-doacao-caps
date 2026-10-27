import { NextFunction, Request, Response, Router } from 'express'
import { signDonorToken } from '../lib/jwt'
import { sessionCookieOptions } from '../lib/session-cookie'
import { DONOR_COOKIE, DONOR_SESSION_MS, requireDonor } from '../middleware/donor-auth'
import { DonorProfile, DonorsService } from '../services/donors-service'
import { asyncHandler } from '../utils/async-handler'

const router = Router()
const service = new DonorsService()

// Contas precisam do banco; no modo de demonstração sem banco avisamos em vez de dar erro 500.
function requireDatabase(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.API_MOCK_MODE === 'true') {
    res.status(503).json({ error: 'Contas de doador estão indisponíveis: a API está sem banco de dados.' })
    return
  }
  next()
}

function startSession(res: Response, donor: DonorProfile): void {
  res
    .cookie(DONOR_COOKIE, signDonorToken({ donorId: donor.id }), sessionCookieOptions(DONOR_SESSION_MS))
    .json({ id: donor.id, name: donor.name, email: donor.email })
}

router.post('/register', requireDatabase, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const donor = await service.register(req.body)
  res.status(201)
  startSession(res, donor)
}))

router.post('/login', requireDatabase, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  startSession(res, await service.login(req.body))
}))

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(DONOR_COOKIE, sessionCookieOptions()).json({ message: 'Você saiu da sua conta.' })
})

router.get('/me', requireDatabase, requireDonor, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const donor = await service.getProfile(req.authDonor!.donorId)
  res.json({ id: donor.id, name: donor.name, email: donor.email })
}))

router.get('/me/donations', requireDatabase, requireDonor, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store')
  res.json(await service.listDonations(req.authDonor!.donorId))
}))

export default router
