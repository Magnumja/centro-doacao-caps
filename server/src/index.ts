import 'dotenv/config'
import { validateEnv } from './config/env'
import app from './app'
import prisma from './lib/prisma'

validateEnv()

const PORT = Number(process.env.PORT) || 3333

// Conecta ao banco antes de subir o servidor.
async function main(): Promise<void> {
  try {
    await prisma.$connect()
    console.log('✓ Banco de dados conectado.')
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      throw err
    }

    process.env.API_MOCK_MODE = 'true'
    console.warn('Aviso: banco indisponivel. API local iniciada com dados publicos de fallback.')
  }

  app.listen(PORT, () => {
    console.log(`✓ Servidor rodando em http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})
