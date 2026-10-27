import test from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { DonorsService } from './donors-service'

function memoryRepository() {
  const donors: Array<{ id: string, name: string, email: string, password: string, createdAt: Date }> = []
  return {
    donors,
    findByEmail: async (email: string) => donors.find((donor) => donor.email === email) ?? null,
    findProfile: async (id: string) => donors.find((donor) => donor.id === id) ?? null,
    create: async (data: { name: string, email: string, password: string }) => {
      const donor = { id: `d${donors.length + 1}`, createdAt: new Date(), ...data }
      donors.push(donor)
      return { id: donor.id, name: donor.name, email: donor.email, createdAt: donor.createdAt }
    },
    listDonations: async () => [],
  }
}

test('DonorsService.register guarda hash (nunca a senha) e normaliza o e-mail', async () => {
  const repository = memoryRepository()
  const service = new DonorsService(repository as any)

  const donor = await service.register({ name: 'Ana', email: ' Ana@Exemplo.com ', password: 'senha-segura' })

  assert.equal(donor.email, 'ana@exemplo.com')
  assert.notEqual(repository.donors[0].password, 'senha-segura')
  assert.ok(await bcrypt.compare('senha-segura', repository.donors[0].password))
})

test('DonorsService.register recusa e-mail repetido e senha curta', async () => {
  const service = new DonorsService(memoryRepository() as any)
  await service.register({ name: 'Ana', email: 'ana@exemplo.com', password: 'senha-segura' })

  await assert.rejects(service.register({ name: 'Ana 2', email: 'ana@exemplo.com', password: 'outra-senha' }), { statusCode: 409 })
  await assert.rejects(service.register({ name: 'Bia', email: 'bia@exemplo.com', password: '123' }), { statusCode: 400 })
})

test('DonorsService.login aceita a senha certa e recusa a errada com a mesma mensagem', async () => {
  const service = new DonorsService(memoryRepository() as any)
  await service.register({ name: 'Ana', email: 'ana@exemplo.com', password: 'senha-segura' })

  const logged = await service.login({ email: 'ANA@exemplo.com', password: 'senha-segura' })
  assert.equal(logged.name, 'Ana')

  await assert.rejects(service.login({ email: 'ana@exemplo.com', password: 'errada!!' }), { statusCode: 401, message: 'E-mail ou senha incorretos.' })
  await assert.rejects(service.login({ email: 'ninguem@exemplo.com', password: 'qualquer' }), { statusCode: 401, message: 'E-mail ou senha incorretos.' })
})

test('DonorsService.listDonations agrupa itens da mesma intenção', async () => {
  const unit = { slug: 'c1', title: 'CAPS III Margarida' }
  const base = { isAnonymous: false, date: '2026-11-03', time: '09:00', registeredAt: new Date(), unit }
  const repository = {
    ...memoryRepository(),
    listDonations: async () => [
      { ...base, id: 'r1', groupId: 'g1', category: 'roupa', itemLabel: 'Roupas', quantity: '5' },
      { ...base, id: 'r2', groupId: 'g1', category: 'utensilios', itemLabel: 'Higiene pessoal', quantity: '3 kits' },
      { ...base, id: 'r3', groupId: null, category: 'comida', itemLabel: null, quantity: '2 kg' },
    ],
  }

  const groups = await new DonorsService(repository as any).listDonations('d1')

  assert.equal(groups.length, 2)
  assert.deepEqual(groups[0].items, [{ label: 'Roupas', quantity: '5' }, { label: 'Higiene pessoal', quantity: '3 kits' }])
  assert.deepEqual(groups[1].items, [{ label: 'Alimentos', quantity: '2 kg' }])
})
