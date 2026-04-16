import prisma from '../lib/prisma'

type Priority = 'alta' | 'media'

export type NeedFilters = {
  priority?: Priority
  unitId?: string
}

export class NeedsRepository {
  findMany(filters: NeedFilters) {
    return prisma.need.findMany({
      where: {
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.unitId ? { unitId: filters.unitId } : {}),
      },
      include: {
        unit: { select: { id: true, slug: true, title: true } },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    })
  }

  create(data: {
    title: string
    amount: number
    description: string
    category: string
    priority: Priority
    unitId: string
  }) {
    return prisma.need.create({ data })
  }
}
