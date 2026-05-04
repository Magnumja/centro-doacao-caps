import prisma from '../lib/prisma'

type Priority = 'alta' | 'media' | 'baixa'

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

  listPaginated(filters: NeedFilters, skip: number, take: number) {
    return prisma.$transaction([
      prisma.need.findMany({
        where: {
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.unitId ? { unitId: filters.unitId } : {}),
        },
        include: {
          unit: { select: { id: true, slug: true, title: true } },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.need.count({
        where: {
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.unitId ? { unitId: filters.unitId } : {}),
        },
      }),
    ])
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
