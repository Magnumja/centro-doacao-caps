// Representa uma unidade da rede (CAPS ou Residencia Terapeutica).
export type Cap = {
  id: string
  title: string
  unitType: 'CAPS' | 'Residencia Terapeutica' | 'Residência Terapêutica'
  address: string
  contact?: string
  whatsapp?: string
  operatingHours?: string
  needsSummary?: string
  description?: string
  capacity?: string
  privacyNote?: string
  lat?: number
  lng?: number
  photo?: string
}

export type DonationCategoryName =
  | 'Alimentos'
  | 'Roupas'
  | 'Higiene pessoal'
  | 'Material de limpeza'
  | 'Utensilios'
  | 'Brinquedos'
  | 'Outros'

export type DonationUrgency = 'Urgente' | 'Moderado' | 'Baixa prioridade'

export type DonationStatus = 'Pendente' | 'Parcialmente atendido' | 'Concluido'

// Necessidade publicada por uma unidade para captacao de doacoes.
export type Need = {
  id: string
  title: string
  amount: number
  description: string
  unitId: string
  unitName: string
  category: DonationCategoryName | string
  priority: 'alta' | 'media' | 'baixa'
  urgency?: DonationUrgency
  status?: DonationStatus
  donatedAmount?: number
}

export type ProjectStats = {
  capsCount: number
  activeRequests: number
  completedRequests: number
  registeredDonations: number
  urgentRequests: number
  topCategories: Array<{ category: DonationCategoryName | string, total: number }>
  topCapsDemands: Array<{ unitId: string, unitName: string, total: number }>
}

export type User = {
  id: string
  name: string
  email?: string
}

export type Host = {
  id: string
  name: string
  email: string
  password: string
  capId: string
  contact: string
  role: 'host' | 'admin'
}

export type Donation = {
  id: string
  capId: string
  category: 'roupa' | 'comida' | 'utensilios'
  quantity: string
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  date: string
  time: string
  registeredAt: string
}

export type Resident = {
  id: string
  name: string
  capId: string
  capName: string
  emergencyContact: string
  entryDate: string
  status?: 'ativo' | 'egresso'
}
