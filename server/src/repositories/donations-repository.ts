import prisma from '../lib/prisma'

export class DonationsRepository {
  findUnitBySlug(slug: string) {
    return prisma.unit.findUnique({ where: { slug }, select: { id: true } })
  }

  create(data: {
    unitId: string
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
      },
    })
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
