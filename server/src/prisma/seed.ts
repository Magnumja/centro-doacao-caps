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

  // Hash da senha de exemplo — em produção trocar por credencial forte.
  const hash = await bcrypt.hash('senha123', 12)

  await prisma.host.upsert({
    where: { email: 'teste@caps.br' },
    update: {},
    create: {
      name: 'Teste',
      email: 'teste@caps.br',
      password: hash,
      contact: '(67) 99999-0001',
      role: 'host',
      unitId: c1.id,
    },
  })

  console.log('  ✓ 1 host inserido.')

  // ─── Necessidades ─────────────────────────────────────────────────────────

  const unitMap = Object.fromEntries(
    (await prisma.unit.findMany({ select: { id: true, slug: true } })).map((u) => [u.slug, u.id]),
  )

  const needsData = [
    { title: 'Cobertores', amount: 50, description: 'Reposição imediata para acolhimentos noturnos e salas de repouso.', unitSlug: 'c1', category: 'Acolhimento', priority: 'alta' as const },
    { title: 'Alimentos não perecíveis', amount: 120, description: 'Mantém lanches e refeições de usuários em atividades continuadas.', unitSlug: 'c3', category: 'Segurança alimentar', priority: 'alta' as const },
    { title: 'Kits de higiene', amount: 80, description: 'Atende acolhimentos prolongados e situações de maior vulnerabilidade.', unitSlug: 'c4', category: 'Cuidado diário', priority: 'alta' as const },
    { title: 'Materiais para oficinas', amount: 35, description: 'Suporta atividades terapêuticas em grupos e oficinas de reinserção social.', unitSlug: 'c2', category: 'Oficinas terapêuticas', priority: 'media' as const },
    { title: 'Produtos de limpeza', amount: 60, description: 'Reforça a manutenção dos espaços coletivos e das residências de apoio.', unitSlug: 'r1', category: 'Ambiente e cuidado', priority: 'alta' as const },
    { title: 'Toalhas de banho', amount: 24, description: 'Apoia acolhimentos em rotinas de higiene e permanência mais extensa.', unitSlug: 'c5', category: 'Apoio cotidiano', priority: 'media' as const },
  ]

  for (const { unitSlug, ...need } of needsData) {
    await prisma.need.create({ data: { ...need, unitId: unitMap[unitSlug] } })
  }

  console.log(`  ✓ ${needsData.length} necessidades inseridas.`)

  console.log('Seed concluído com sucesso.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
