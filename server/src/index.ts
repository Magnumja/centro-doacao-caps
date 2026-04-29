import 'dotenv/config'
import { validateEnv } from './config/env'
import app from './app'
import prisma from './lib/prisma'

validateEnv()

const PORT = Number(process.env.PORT) || 3333

// Conecta ao banco antes de subir o servidor.
async function main(): Promise<void> {
  await prisma.$connect()
  console.log('✓ Banco de dados conectado.')

  app.listen(PORT, () => {
    console.log(`✓ Servidor rodando em http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})
