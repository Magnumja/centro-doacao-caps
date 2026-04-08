import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { verifyToken, JwtPayload } from '../lib/jwt'

// Estende o tipo Request do Express para carregar os dados do host autenticado.
// Usamos 'authHost' para não conflitar com req.host nativo do Express (string).
declare global {
  namespace Express {
    interface Request {
      authHost?: JwtPayload
    }
  }
}

function isLocalHostname(hostname?: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function canBypassLocalAuth(req: Request): boolean {
  const bypassEnabled = process.env.ENABLE_LOCAL_AUTH_BYPASS !== 'false'

  return (
    bypassEnabled
    && process.env.NODE_ENV !== 'production'
    && isLocalHostname(req.hostname)
  )
}

export async function attachLocalBypassAuth(req: Request): Promise<boolean> {
  if (!canBypassLocalAuth(req)) {
    return false
  }

  const localUnitSlug = process.env.LOCAL_AUTH_BYPASS_UNIT_SLUG ?? 'c1'
  const unit = await prisma.unit.findUnique({ where: { slug: localUnitSlug }, select: { id: true } })

  if (!unit) {
    return false
  }

  req.authHost = {
    hostId: 'local-dev-admin',
    unitId: unit.id,
    role: 'admin',
  }

  return true
}

// Middleware que valida o JWT enviado via cookie httpOnly.
// Rejeita requisições sem token ou com token inválido/expirado.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (await attachLocalBypassAuth(req)) {
    next()
    return
  }

  const token: string | undefined = req.cookies?.token

  if (!token) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    req.authHost = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Sessão expirada ou inválida.' })
  }
}

// Middleware que exige perfil de administrador (beyond host).
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.authHost?.role !== 'admin') {
      res.status(403).json({ error: 'Acesso restrito a administradores.' })
      return
    }
    next()
  })
}
