import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'

const router = Router()

const ENV_ADMIN_TOKEN_PREFIX = 'env-admin:'

// Schema de validação do body de login.
const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
})

// POST /auth/login
// Autentica um host; devolve cookie httpOnly com JWT.
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors })
      return
    }

    const { email, password } = parsed.data

    // Fallback de autenticação via variáveis de ambiente (útil para bootstrap em produção).
    const envAdminEmail = process.env.SEED_ADMIN_EMAIL
    const envAdminPassword = process.env.SEED_ADMIN_PASSWORD
    const envAdminCapSlug = process.env.SEED_ADMIN_CAP_SLUG ?? 'c1'
    const envAdminName = process.env.SEED_ADMIN_NAME ?? ''

    if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
      const envAdminUnit = await prisma.unit.findUnique({ where: { slug: envAdminCapSlug } })

      if (!envAdminUnit) {
        res.status(500).json({ error: 'Unidade administrativa do ambiente não encontrada.' })
        return
      }

      const token = signToken({
        hostId: `${ENV_ADMIN_TOKEN_PREFIX}${envAdminEmail}`,
        unitId: envAdminUnit.id,
        role: 'admin',
      })

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 8 * 60 * 60 * 1000,
        })
        .json({
          message: 'Login realizado com sucesso.',
          role: 'admin',
          unitId: envAdminUnit.id,
          capId: envAdminCapSlug,
          name: envAdminName,
        })
      return
    }

    const host = await prisma.host.findUnique({ where: { email } })

    // Usa comparação constante mesmo em caso de host inexistente
    // para não vazar a existência da conta por timing attack.
    const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKxGhu1Uc1M4b5M7.l8F/9QnWMnGm6wib2MSe'
    const passwordMatch = await bcrypt.compare(password, host?.password ?? dummyHash)

    if (!host || !passwordMatch) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' })
      return
    }

    const token = signToken({ hostId: host.id, unitId: host.unitId, role: host.role as 'host' | 'admin' })

    res
      .cookie('token', token, {
        httpOnly: true,       // inAccessível via JS do navegador
        secure: process.env.NODE_ENV === 'production', // HTTPS somente em prod
        // Em produção (frontend possivelmente em domínio diferente) usamos 'none' + secure
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 8 * 60 * 60 * 1000, // 8 horas em ms
      })
      .json({ message: 'Login realizado com sucesso.', role: host.role, unitId: host.unitId })
  } catch (error) {
    console.error('Erro inesperado no login:', error)
    res.status(500).json({ error: 'Erro interno ao autenticar.' })
  }
})

// POST /auth/logout
// Invalida o cookie de sessão.
router.post('/logout', (_req: Request, res: Response): void => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
    .json({ message: 'Logout realizado.' })
})

// GET /auth/me
// Retorna os dados do host logado (sem senha).
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (req.authHost?.hostId === 'local-dev-admin') {
    const localUnitSlug = process.env.LOCAL_AUTH_BYPASS_UNIT_SLUG ?? 'c1'
    const localUnit = await prisma.unit.findUnique({ where: { slug: localUnitSlug } })

    if (!localUnit) {
      res.status(500).json({ error: 'Unidade configurada para bypass local não encontrada.' })
      return
    }

    res.json({
      id: 'local-dev-admin',
      name: 'Administrador local',
      email: 'local@localhost',
      role: 'admin',
      unitId: localUnit.id,
      capId: localUnit.slug,
      contact: '',
      password: '',
    })
    return
  }

  if (req.authHost!.hostId.startsWith(ENV_ADMIN_TOKEN_PREFIX)) {
    const envAdminEmail = process.env.SEED_ADMIN_EMAIL ?? ''
    const envAdminCapSlug = process.env.SEED_ADMIN_CAP_SLUG ?? 'c1'
    const envAdminName = process.env.SEED_ADMIN_NAME ?? ''

    res.json({
      id: req.authHost!.hostId,
      name: envAdminName,
      email: envAdminEmail,
      role: 'admin',
      unitId: req.authHost!.unitId,
      capId: envAdminCapSlug,
      contact: '',
      password: '',
    })
    return
  }

  const found = await prisma.host.findUnique({
    where: { id: req.authHost!.hostId },
    select: { id: true, name: true, email: true, role: true, unitId: true, contact: true, unit: { select: { slug: true } } },
  })

  if (!found) {
    res.status(404).json({ error: 'Host não encontrado.' })
    return
  }

  res.json({
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    unitId: found.unitId,
    capId: found.unit.slug,
    contact: found.contact ?? '',
    password: '',
  })
})

export default router
