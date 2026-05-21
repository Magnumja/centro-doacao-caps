/**
 * Seed — popula o banco com os dados iniciais equivalentes ao mock.ts do front.
 * Execute: npm run db:seed
 */

import { PrismaClient, UnitType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('Iniciando seed...')

  // ─── Unidades ────────────────────────────────────────────────────────────

  const unitData = [
    { slug: 'c1', title: 'CAPS III Margarida', unitType: UnitType.CAPS, address: 'Rua Itambé, 2939 - Vila Rica / Jardim Vitrine', contact: '(67) 3314-3144', lat: -20.4810, lng: -54.6660, photo: '/capsmargarida.jpg' },
    { slug: 'c2', title: 'CAPS III Vila Almeida', unitType: UnitType.CAPS, address: 'Rua Marechal Hermes, 854 - Vila Almeida', contact: 'Contato não informado', lat: -20.4560, lng: -54.6200, photo: '/capsvilaalmeida.jpeg' },
    { slug: 'c3', title: 'CAPS III Afrodite Doris Contis', unitType: UnitType.CAPS, address: 'Rua São Paulo, 70 - Bairro São Francisco', contact: '(67) 3314-3185 / 3314-3188', lat: -20.4660, lng: -54.6135, photo: '/capsafrodite.jpeg' },
    { slug: 'c4', title: 'CAPS III Aero Rancho', unitType: UnitType.CAPS, address: 'Av. Manoel da Costa Lima, 3272 - Guanandi', contact: 'Contato não informado', lat: -20.5020, lng: -54.6350, photo: '/capsaerorancho.jpeg' },
    { slug: 'c5', title: 'CAPS AD IV - Álcool e Drogas', unitType: UnitType.CAPS, address: 'Rua Theotônio Rosa Pires, 19 - Jardim São Bento', contact: 'Contato não informado', lat: -20.4500, lng: -54.6380, photo: '/capsdrafatima.jpg' },
    { slug: 'c6', title: 'CAPS AD III - Márcia Zen', unitType: UnitType.CAPS, address: 'Av. Manoel da Costa Lima, 3272 - Guanandi', contact: 'Contato não informado', lat: -20.5025, lng: -54.6355, photo: '/capsmarciazen.jpg' },
    { slug: 'r1', title: 'Residência Terapêutica Moinho dos Ventos (Tipo II)', unitType: UnitType.RESIDENCIA_TERAPEUTICA, address: 'Bairro São Francisco - Rua São Paulo', capacity: 'Capacidade aproximada: até 10 moradores', lat: -20.4650, lng: -54.6130 },
  ]

  for (const unit of unitData) {
    await prisma.unit.upsert({ where: { slug: unit.slug }, update: unit, create: unit })
  }

  console.log(`  ✓ ${unitData.length} unidades inseridas.`)

  // ─── Hosts ────────────────────────────────────────────────────────────────

  const c1 = await prisma.unit.findUniqueOrThrow({ where: { slug: 'c1' } })

  const isProduction = process.env.NODE_ENV === 'production'
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.test'
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'dev-only-change-me'
  const seedAdminName = process.env.SEED_ADMIN_NAME ?? 'Administrador'

  if (isProduction && (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error('Em produção, defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD antes do seed.')
  }

  if (!isProduction) {
    // Usuário de demonstração só em ambientes locais.
    const demoHash = await bcrypt.hash('senha123', 12)

    await prisma.host.upsert({
      where: { email: 'teste@caps.br' },
      update: {},
      create: {
        name: '',
        email: 'teste@caps.br',
        password: demoHash,
        contact: '(67) 99999-0001',
        role: 'host',
        unitId: c1.id,
      },
    })
  }

  const requestedHash = await bcrypt.hash(seedAdminPassword, 12)

  await prisma.host.upsert({
    where: { email: seedAdminEmail },
    update: {
      name: seedAdminName,
      password: requestedHash,
      role: 'admin',
      unitId: c1.id,
    },
    create: {
      name: seedAdminName,
      email: seedAdminEmail,
      password: requestedHash,
      contact: '',
      role: 'admin',
      unitId: c1.id,
    },
  })

  console.log(`  ✓ hosts inseridos/atualizados (${isProduction ? 'producao' : 'desenvolvimento'}).`)

  // ─── Necessidades ─────────────────────────────────────────────────────────

  const unitMap = Object.fromEntries(
    (await prisma.unit.findMany({ select: { id: true, slug: true } })).map((u) => [u.slug, u.id]),
  )

  const needsData = [
    { title: 'Roupas (exemplo)', amount: 1, description: 'Exemplo de pedido de roupas. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c1', category: 'Roupas', priority: 'media' as const },
    { title: 'Alimentos (exemplo)', amount: 1, description: 'Exemplo de pedido de alimentos. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c3', category: 'Alimentos', priority: 'media' as const },
    { title: 'Higiene pessoal (exemplo)', amount: 1, description: 'Exemplo de pedido de higiene. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c4', category: 'Higiene pessoal', priority: 'media' as const },
    { title: 'Material de limpeza (exemplo)', amount: 1, description: 'Exemplo de pedido de limpeza. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'r1', category: 'Material de limpeza', priority: 'media' as const },
    { title: 'Utensílios (exemplo)', amount: 1, description: 'Exemplo de pedido de utensílios. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c2', category: 'Utensilios', priority: 'media' as const },
    { title: 'Brinquedos (exemplo)', amount: 1, description: 'Exemplo de pedido de brinquedos. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c6', category: 'Brinquedos', priority: 'baixa' as const },
    { title: 'Outros (exemplo)', amount: 1, description: 'Exemplo de pedido de outros itens. Pedidos reais são cadastrados pelos gestores de cada unidade.', unitSlug: 'c2', category: 'Outros', priority: 'baixa' as const },
  ]

  for (const { unitSlug, ...need } of needsData) {
    const unitId = unitMap[unitSlug]
    const existingNeed = await prisma.need.findFirst({
      where: {
        unitId,
        title: need.title,
      },
      select: { id: true },
    })

    if (existingNeed) {
      await prisma.need.update({
        where: { id: existingNeed.id },
        data: need,
      })
      continue
    }

    await prisma.need.create({ data: { ...need, unitId } })
  }

  console.log(`  ✓ ${needsData.length} necessidades inseridas.`)

  console.log('Seed concluído com sucesso.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
