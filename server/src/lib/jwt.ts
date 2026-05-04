import jwt from 'jsonwebtoken'

const DEV_SECRET = 'local-development-only-jwt-secret-32chars'
const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : DEV_SECRET)

if (!SECRET || SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou muito curto. Defina ao menos 32 caracteres no ambiente.')
}

export type JwtPayload = {
  hostId: string
  unitId: string
  role: 'host' | 'admin'
}

// Gera um JWT com expiração curta para sessões administrativas.
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

// Verifica e decodifica o token; lança erro se inválido ou expirado.
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
