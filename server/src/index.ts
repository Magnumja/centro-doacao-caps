import 'dotenv/config'
import { execFileSync } from 'child_process'
import { validateEnv } from './config/env'
import app from './app'
import prisma from './lib/prisma'

validateEnv()

const PORT = Number(process.env.PORT) || 3333

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.log('Aplicando migrations pendentes...')
    execFileSync('node_modules/.bin/prisma', ['migrate', 'deploy'], { stdio: 'inherit' })
    console.log('✓ Migrations aplicadas.')
  }

  try {
    await prisma.$connect()
    console.log('✓ Banco de dados conectado.')
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err
    process.env.API_MOCK_MODE = 'true'
    console.warn('Aviso: banco indisponivel. API local iniciada com dados publicos de fallback.')
  }

  const server = app.listen(PORT, () => {
    console.log(`✓ Servidor rodando em http://localhost:${PORT}`)
  })

  async function shutdown(signal: string): Promise<void> {
    console.log(`${signal} recebido. Encerrando servidor...`)
    server.close(async () => {
      await prisma.$disconnect()
      console.log('✓ Conexoes encerradas. Saindo.')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => { void shutdown('SIGTERM') })
  process.on('SIGINT', () => { void shutdown('SIGINT') })
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})
