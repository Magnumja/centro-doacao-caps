-- Contas de doador + itens agrupados por intenção.
-- Também cria índices que existiam no schema.prisma mas nunca entraram numa migration.

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "donorId" TEXT,
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "itemLabel" TEXT;

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Donation_unitId_registeredAt_idx" ON "Donation"("unitId", "registeredAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Donation_donorId_registeredAt_idx" ON "Donation"("donorId", "registeredAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Host_unitId_idx" ON "Host"("unitId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Need_unitId_idx" ON "Need"("unitId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Need_priority_idx" ON "Need"("priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Resident_unitId_idx" ON "Resident"("unitId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
