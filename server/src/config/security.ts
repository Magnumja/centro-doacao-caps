import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error'

const DEFAULT_FRONTEND_URL = 'http://localhost:5173,http://127.0.0.1:5173'
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function getAllowedOrigins(): string[] {
  return (process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL)
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '')
}

function getRequestOrigin(req: Request): string {
  return `${req.protocol}://${req.get('host')}`
}

function isAllowedOrigin(origin: string, req?: Request): boolean {
  const normalized = normalizeOrigin(origin)

  if (getAllowedOrigins().includes(normalized)) {
    return true
  }

  return req ? normalized === getRequestOrigin(req) : false
}

function originFromReferer(referer: string): string | null {
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

export function corsOriginDelegate(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  if (!origin || isAllowedOrigin(origin)) {
    callback(null, true)
    return
  }

  callback(new AppError('Origem nao permitida pelo CORS.', 403))
}

export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction): void {
  if (!UNSAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const origin = req.get('origin') ?? ''
  const refererOrigin = req.get('referer') ? originFromReferer(req.get('referer')!) : null
  const candidateOrigin = origin || refererOrigin
  const hasTrustedOrigin = candidateOrigin ? isAllowedOrigin(candidateOrigin, req) : false

  const isDevWithNoOrigin = !candidateOrigin && process.env.NODE_ENV !== 'production'
  if (!hasTrustedOrigin && !isDevWithNoOrigin) {
    res.status(403).json({ error: 'Origem da requisicao nao confiavel.' })
    return
  }

  if (req.get('x-csrf-protection') !== '1' && process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Cabecalho anti-CSRF ausente.' })
    return
  }

  next()
}

export function requireJsonContentType(req: Request, res: Response, next: NextFunction): void {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    next()
    return
  }

  const hasBody = (
    (req.get('content-length') !== undefined && req.get('content-length') !== '0')
    || req.get('transfer-encoding') !== undefined
  )
  if (!hasBody || req.is('application/json')) {
    next()
    return
  }

  res.status(415).json({ error: 'Content-Type deve ser application/json.' })
}
