import api from '../lib/api'

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

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
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

  if (input.anonymousDonation !== 'sim' && !isValidEmail(input.donorEmail)) {
    return 'Informe um e-mail válido, por exemplo nome@exemplo.com.'
  }

  return null
}

// Envia a intenção inteira de uma vez: o servidor grava todos os itens numa transação
// (tudo ou nada). Se o doador estiver logado, o cookie da sessão vincula ao histórico dele.
export async function registerDonations(input: DonationFormInput): Promise<void> {
  const isAnonymous = input.anonymousDonation === 'sim'

  await api.post('/api/donations/batch', {
    unitSlug: input.unitSlug,
    items: input.selectedItems.map((item) => ({
      category: categoryMap[item] ?? 'utensilios',
      label: item,
      quantity: input.itemQuantities[item],
    })),
    isAnonymous,
    donorName: isAnonymous ? undefined : input.donorName,
    donorEmail: isAnonymous ? undefined : input.donorEmail,
    date: input.donationDate,
    time: input.donationTime,
  })
}
