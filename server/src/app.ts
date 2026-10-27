import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import authRouter from './routes/auth'
import donorsRouter from './routes/donors'
import unitsRouter from './routes/units'
import needsRouter from './routes/needs'
import donationsRouter from './routes/donations'
import residentsRouter from './routes/residents'
import highlightsRouter from './routes/highlights'
import telemetryRouter from './routes/telemetry'
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { corsOriginDelegate, requireJsonContentType, requireTrustedOrigin } from './config/security'

const app = express()

const trustProxyValue = process.env.TRUST_PROXY
if (trustProxyValue === '1' || trustProxyValue === 'true') {
  app.set('trust proxy', 1)
} else {
  app.set('trust proxy', false)
}
app.disable('x-powered-by')

app.use(helmet())

app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Protection'],
  }),
)

// Limite geral por IP. Precisa comportar redes compartilhadas (Wi-Fi de evento, unidade
// de saúde, escola): todos saem pelo mesmo IP público. Telemetria tem limite próprio e
// não consome esta cota; health check também não.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/telemetry') || req.path === '/api/health',
    message: { error: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
  }),
)

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
})

// Contador separado para doadores: errar a senha da conta de doador não pode
// bloquear o login dos gestores (e vice-versa).
const donorAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
})

const donationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de cadastro de doacao. Tente novamente mais tarde.' },
})

const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitos eventos de telemetria.' },
})

app.use(cookieParser())
app.use(requireTrustedOrigin)
app.use(requireJsonContentType)
app.use(express.json({ limit: '64kb' }))

app.use('/api/auth/login', loginLimiter)
app.use('/api/donors/login', donorAuthLimiter)
app.use('/api/donors/register', donorAuthLimiter)
app.use('/api/donations', donationLimiter)
app.use('/api/telemetry', telemetryLimiter)
app.use('/api/auth', authRouter)
app.use('/api/donors', donorsRouter)
app.use('/api/units', unitsRouter)
app.use('/api/needs', needsRouter)
app.use('/api/donations', donationsRouter)
app.use('/api/residents', residentsRouter)
app.use('/api/highlights', highlightsRouter)
app.use('/api/telemetry', telemetryRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(notFoundHandler)
app.use(errorHandler)

export default app
