import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Schema de validação do body de login.
const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
})

// POST /auth/login
// Autentica um host; devolve cookie httpOnly com JWT.
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const { email, password } = parsed.data

  const host = await prisma.host.findUnique({ where: { email } })

  // Usa comparação constante mesmo em caso de host inexistente
  // para não vazar a existência da conta por timing attack.
  const dummyHash = '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXX'
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
})

// POST /auth/logout
// Invalida o cookie de sessão.
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token').json({ message: 'Logout realizado.' })
})

// GET /auth/me
// Retorna os dados do host logado (sem senha).
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const found = await prisma.host.findUnique({
    where: { id: req.authHost!.hostId },
    select: { id: true, name: true, email: true, role: true, unitId: true, contact: true },
  })

  if (!found) {
    res.status(404).json({ error: 'Host não encontrado.' })
    return
  }

  res.json(found)
})

export default router
