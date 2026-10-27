import { NextFunction, Request, Response } from 'express'
import { DonorJwtPayload, verifyDonorToken } from '../lib/jwt'

export const DONOR_COOKIE = 'donor_token'
export const DONOR_SESSION_MS = 30 * 24 * 60 * 60 * 1000

declare global {
  namespace Express {
    interface Request {
      authDonor?: DonorJwtPayload
    }
  }
}

// Lê a sessão do doador se existir, sem bloquear a requisição (doar não exige conta).
export function readDonorSession(req: Request): DonorJwtPayload | undefined {
  const token: string | undefined = req.cookies?.[DONOR_COOKIE]
  if (!token) return undefined

  try {
    return verifyDonorToken(token)
  } catch {
    return undefined
  }
}

export function requireDonor(req: Request, res: Response, next: NextFunction): void {
  const session = readDonorSession(req)

  if (!session) {
    res.status(401).json({ error: 'Entre na sua conta para continuar.' })
    return
  }

  req.authDonor = session
  next()
}
