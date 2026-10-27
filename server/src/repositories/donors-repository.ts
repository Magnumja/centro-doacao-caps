import prisma from '../lib/prisma'

export class DonorsRepository {
  findByEmail(email: string) {
    return prisma.donor.findUnique({ where: { email } })
  }

  findProfile(id: string) {
    return prisma.donor.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    })
  }

  create(data: { name: string, email: string, password: string }) {
    return prisma.donor.create({
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    })
  }

  // Últimas linhas de doação do doador; o agrupamento por intenção é feito no service.
  listDonations(donorId: string, take: number) {
    return prisma.donation.findMany({
      where: { donorId },
      orderBy: { registeredAt: 'desc' },
      take,
      select: {
        id: true,
        groupId: true,
        category: true,
        itemLabel: true,
        quantity: true,
        isAnonymous: true,
        date: true,
        time: true,
        registeredAt: true,
        unit: { select: { slug: true, title: true } },
      },
    })
  }
}
