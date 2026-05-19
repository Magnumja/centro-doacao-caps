import { CookieOptions } from 'express'

type SameSiteValue = 'strict' | 'lax' | 'none'

function resolveSameSite(): SameSiteValue {
  const configured = process.env.SESSION_COOKIE_SAMESITE?.trim().toLowerCase()

  if (configured === 'strict' || configured === 'lax' || configured === 'none') {
    return configured
  }

  return process.env.NODE_ENV === 'production' ? 'none' : 'strict'
}

export function sessionCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: resolveSameSite(),
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  }
}
