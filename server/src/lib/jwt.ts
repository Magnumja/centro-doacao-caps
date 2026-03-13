import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

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
