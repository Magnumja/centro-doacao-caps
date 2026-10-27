import api, { getErrorMessage } from '../lib/api'

export type DonationFormInput = {
  unitSlug: string
  selectedItems: string[]
  itemQuantities: Record<string, string>
  donationDate: string
  donationTime: string
  anonymousDonation: 'sim' | 'nao'
  donorName: string
  donorEmail: string
}

const categoryMap: Record<string, 'roupa' | 'comida' | 'utensilios'> = {
  Roupas: 'roupa',
  Alimentos: 'comida',
  Comida: 'comida',
  'Higiene pessoal': 'utensilios',
  'Material de limpeza': 'utensilios',
  'Utensílios': 'utensilios',
  Utensilios: 'utensilios',
  Brinquedos: 'utensilios',
  Outros: 'utensilios',
}

export function validateDonationInput(input: DonationFormInput): string | null {
  if (!input.unitSlug || input.selectedItems.length === 0 || !input.donationDate || !input.donationTime) {
    return 'Preencha dia, horário e selecione ao menos um tipo de doação.'
  }

  const missingQty = input.selectedItems.some((item) => !input.itemQuantities[item]?.trim())
  if (missingQty) {
    return 'Informe a quantidade para cada item selecionado.'
  }

  if (input.anonymousDonation !== 'sim' && (!input.donorName.trim() || !input.donorEmail.trim())) {
    return 'Preencha seu nome e e-mail para continuar.'
  }

  if (input.anonymousDonation !== 'sim' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.donorEmail.trim())) {
    return 'Informe um e-mail válido, por exemplo nome@exemplo.com.'
  }

  return null
}

export async function registerDonations(input: DonationFormInput): Promise<void> {
  const payloads = input.selectedItems.map((item) => ({
    unitSlug: input.unitSlug,
    category: categoryMap[item] ?? 'utensilios',
    quantity: input.itemQuantities[item],
    isAnonymous: input.anonymousDonation === 'sim',
    donorName: input.anonymousDonation === 'sim' ? undefined : input.donorName,
    donorEmail: input.anonymousDonation === 'sim' ? undefined : input.donorEmail,
    date: input.donationDate,
    time: input.donationTime,
  }))

  // A API registra um item por requisição. Usamos allSettled para saber exatamente
  // quais itens foram salvos caso só parte das requisições falhe.
  const results = await Promise.allSettled(payloads.map((payload) => api.post('/api/donations', payload)))
  const failed = results.flatMap((result, index) => (result.status === 'rejected' ? [{ item: input.selectedItems[index], reason: result.reason }] : []))

  if (failed.length === 0) return

  const reason = getErrorMessage(failed[0].reason, 'Não foi possível registrar a doação agora.')
  if (failed.length === results.length) {
    throw new Error(reason)
  }

  const saved = input.selectedItems.filter((item) => !failed.some((entry) => entry.item === item))
  throw new Error(`Registramos ${saved.join(', ')}, mas não ${failed.map((entry) => entry.item).join(', ')}. ${reason}`)
}
