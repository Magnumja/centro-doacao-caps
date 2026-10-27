export type Cap = {
  id: string
  title: string
  unitType: 'CAPS' | 'Residência Terapêutica'
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
  | 'Utensílios'
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

export type Host = {
  id: string
  name: string
  email: string
  capId: string
  contact: string
  role: 'host' | 'admin'
}
