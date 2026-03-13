import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import authRouter from './routes/auth'
import unitsRouter from './routes/units'
import needsRouter from './routes/needs'
import donationsRouter from './routes/donations'
import residentsRouter from './routes/residents'

const app = express()

// ─── Segurança HTTP ───────────────────────────────────────────────────────────

// Helmet define Content-Security-Policy, X-Frame-Options, etc.
app.use(helmet())

// CORS — permite somente o front configurado em .env ; bloqueia outras origens.
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true, // necessário para cookies
  }),
)

// ─── Rate limiting ────────────────────────────────────────────────────────────

// Limite global: 200 req / 15 min por IP.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  }),
)

// Limite rigoroso para login: 10 tentativas / 15 min — bloqueia brute force.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
})

// ─── Parsing ──────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '64kb' })) // limita body para evitar DoS por payload grande
app.use(cookieParser())

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.use('/api/auth', loginLimiter, authRouter)
app.use('/api/units', unitsRouter)
app.use('/api/needs', needsRouter)
app.use('/api/donations', donationsRouter)
app.use('/api/residents', residentsRouter)

// ─── Healthcheck ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

export default app
