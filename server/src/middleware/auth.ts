import { Request, Response, NextFunction } from 'express'
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

// Middleware que valida o JWT enviado via cookie httpOnly.
// Rejeita requisições sem token ou com token inválido/expirado.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
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
