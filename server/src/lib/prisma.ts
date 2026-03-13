import { PrismaClient } from '@prisma/client'

// Instância singleton do Prisma — evita múltiplas conexões em dev com hot-reload.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export default prisma
