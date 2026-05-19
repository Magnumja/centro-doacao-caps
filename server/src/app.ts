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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Protection'],
  }),
)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
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
app.use('/api/donations', donationLimiter)
app.use('/api/telemetry', telemetryLimiter)
app.use('/api/auth', authRouter)
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
