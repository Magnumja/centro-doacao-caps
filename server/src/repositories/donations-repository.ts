import prisma from '../lib/prisma'

export class DonationsRepository {
  findUnitBySlug(slug: string) {
    return prisma.unit.findUnique({ where: { slug }, select: { id: true } })
  }

  create(data: {
    unitId: string
    donorId?: string
    category: 'roupa' | 'comida' | 'utensilios'
    quantity: string
    isAnonymous: boolean
    donorName?: string
    donorEmail?: string
    date: string
    time: string
  }) {
    return prisma.donation.create({
      data: {
        unitId: data.unitId,
        category: data.category,
        quantity: data.quantity,
        isAnonymous: data.isAnonymous,
        donorName: data.isAnonymous ? null : data.donorName,
        donorEmail: data.isAnonymous ? null : data.donorEmail,
        date: data.date,
        time: data.time,
        donorId: data.donorId,
      },
    })
  }

  // Grava todos os itens de uma intenção numa transação: ou entram todos, ou nenhum.
  async createGroup(rows: Array<{
    unitId: string
    groupId: string
    donorId?: string
    category: 'roupa' | 'comida' | 'utensilios'
    itemLabel: string
    quantity: string
    isAnonymous: boolean
    donorName?: string
    donorEmail?: string
    date: string
    time: string
  }>): Promise<number> {
    const result = await prisma.donation.createMany({
      data: rows.map((row) => ({
        ...row,
        donorName: row.isAnonymous ? null : row.donorName,
        donorEmail: row.isAnonymous ? null : row.donorEmail,
      })),
    })
    return result.count
  }

  listByUnit(unitId: string, skip: number, take: number) {
    return prisma.$transaction([
      prisma.donation.findMany({
        where: { unitId },
        orderBy: { registeredAt: 'desc' },
        skip,
        take,
      }),
      prisma.donation.count({ where: { unitId } }),
    ])
  }

  findById(id: string) {
    return prisma.donation.findUnique({ where: { id } })
  }

  delete(id: string) {
    return prisma.donation.delete({ where: { id } })
  }
}
