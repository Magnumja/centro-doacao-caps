const isProduction = process.env.NODE_ENV === 'production'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`)
  }

  return value
}

function validateUrlList(name: string, value: string): void {
  const urls = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (urls.length === 0) {
    throw new Error(`${name} deve conter ao menos uma URL.`)
  }

  for (const origin of urls) {
    let parsed: URL
    try {
      parsed = new URL(origin)
    } catch {
      throw new Error(`${name} contem URL invalida: ${origin}`)
    }

    if (isProduction && parsed.protocol !== 'https:') {
      throw new Error(`${name} deve usar HTTPS em producao: ${origin}`)
    }
  }
}

function validateSessionCookie(): void {
  const sameSite = process.env.SESSION_COOKIE_SAMESITE?.trim().toLowerCase()
  if (sameSite && !['strict', 'lax', 'none'].includes(sameSite)) {
    throw new Error('SESSION_COOKIE_SAMESITE deve ser strict, lax ou none.')
  }

  if (!isProduction && sameSite === 'none') {
    throw new Error('SESSION_COOKIE_SAMESITE=none exige cookie Secure; use apenas em producao HTTPS.')
  }
}

function validateEnvAdminLogin(): void {
  if (process.env.ENABLE_ENV_ADMIN_LOGIN !== 'true') {
    return
  }

  requireEnv('SEED_ADMIN_EMAIL')
  requireEnv('SEED_ADMIN_CAP_SLUG')

  if (isProduction) {
    const hash = requireEnv('SEED_ADMIN_PASSWORD_HASH')
    if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
      throw new Error('SEED_ADMIN_PASSWORD_HASH deve ser um hash bcrypt valido em producao.')
    }
  }
}

export function validateEnv(): void {
  const jwtSecret = isProduction ? requireEnv('JWT_SECRET') : process.env.JWT_SECRET?.trim()

  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET deve ter ao menos 32 caracteres.')
  }

  validateSessionCookie()
  validateEnvAdminLogin()

  if (!isProduction) {
    return
  }

  requireEnv('DATABASE_URL')
  validateUrlList('FRONTEND_URL', requireEnv('FRONTEND_URL'))

  if (process.env.ENABLE_LOCAL_AUTH_BYPASS === 'true') {
    throw new Error('ENABLE_LOCAL_AUTH_BYPASS nao pode ficar ativo em producao.')
  }

  if (process.env.VITE_ENABLE_LOCAL_AUTH_BYPASS === 'true') {
    throw new Error('VITE_ENABLE_LOCAL_AUTH_BYPASS nao pode ficar ativo em producao.')
  }

  const seedPassword = process.env.SEED_ADMIN_PASSWORD?.trim()
  if (seedPassword && seedPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD deve ter ao menos 12 caracteres em producao.')
  }
}
