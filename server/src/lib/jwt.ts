import jwt from 'jsonwebtoken'
import { z } from 'zod'

const DEV_SECRET = 'local-development-only-jwt-secret-32chars'
const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : DEV_SECRET)
const ISSUER = 'centro-doacao-caps-api'
const AUDIENCE = 'centro-doacao-caps-admin'

if (!SECRET || SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou muito curto. Defina ao menos 32 caracteres no ambiente.')
}

const jwtPayloadSchema = z.object({
  hostId: z.string().min(1),
  unitId: z.string().min(1),
  role: z.enum(['host', 'admin']),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: '8h',
    issuer: ISSUER,
    audience: AUDIENCE,
  })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  })

  return jwtPayloadSchema.parse(decoded)
}
