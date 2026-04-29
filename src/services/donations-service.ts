import api from '../lib/api'

export type DonationFormInput = {
  unitSlug: string
  selectedItems: string[]
  itemQuantities: Record<string, string>
  donationDate: string
  donationTime: string
  anonymousDonation: 'sim' | 'nao' | 'nÃ£o'
  donorName: string
  donorEmail: string
}

const categoryMap: Record<string, 'roupa' | 'comida' | 'utensilios'> = {
  Roupas: 'roupa',
  Alimentos: 'comida',
  Comida: 'comida',
  'Higiene pessoal': 'utensilios',
  'Material de limpeza': 'utensilios',
  Utensilios: 'utensilios',
  Brinquedos: 'utensilios',
  Outros: 'utensilios',
}

export function validateDonationInput(input: DonationFormInput): string | null {
  if (!input.unitSlug || input.selectedItems.length === 0 || !input.donationDate || !input.donationTime) {
    return 'Preencha dia, horario e selecione ao menos um tipo de doacao.'
  }

  const missingQty = input.selectedItems.some((item) => !input.itemQuantities[item]?.trim())
  if (missingQty) {
    return 'Informe a quantidade para cada item selecionado.'
  }

  if (input.anonymousDonation !== 'sim' && (!input.donorName.trim() || !input.donorEmail.trim())) {
    return 'Preencha seu nome e e-mail para continuar.'
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

  await Promise.all(payloads.map((payload) => api.post('/api/donations', payload)))
}
