import api from '../lib/api'
import { DonationStatus, DonationUrgency, Need } from '../types'

export type ApiNeed = {
  id: string
  title: string
  amount: number
  description: string
  category: string
  priority: 'alta' | 'media' | 'baixa'
  urgency?: DonationUrgency
  status?: DonationStatus
  donatedAmount?: number
  unitId?: string
  unit?: {
    id: string
    slug?: string
    title: string
  }
}

export type CreateNeedPayload = {
  title: string
  amount: number
  description: string
  category: string
  priority: 'alta' | 'media' | 'baixa'
}

export type NeedsPageResponse = {
  data: ApiNeed[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

const urgencyByPriority: Record<Need['priority'], DonationUrgency> = {
  alta: 'Urgente',
  media: 'Moderado',
  baixa: 'Baixa prioridade',
}

export function normalizeNeed(need: ApiNeed): Need {
  const unitId = need.unit?.slug ?? need.unitId ?? need.unit?.id ?? ''

  return {
    id: need.id,
    title: need.title,
    amount: need.amount,
    description: need.description,
    category: need.category,
    priority: need.priority,
    urgency: need.urgency ?? urgencyByPriority[need.priority],
    status: need.status ?? 'Pendente',
    donatedAmount: need.donatedAmount ?? 0,
    unitId,
    unitName: need.unit?.title ?? 'Unidade nao informada',
  }
}

export async function fetchNeeds(): Promise<ApiNeed[]> {
  const response = await api.get<ApiNeed[]>('/api/needs')
  return Array.isArray(response) ? response : []
}

export async function fetchNeedsPage(params: { page?: number, limit?: number, priority?: 'alta' | 'media' | 'baixa' }): Promise<NeedsPageResponse> {
  const query = new URLSearchParams({
    paginate: 'true',
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 12),
    ...(params.priority ? { priority: params.priority } : {}),
  })

  return api.get<NeedsPageResponse>(`/api/needs?${query.toString()}`)
}

export async function createNeed(payload: CreateNeedPayload): Promise<ApiNeed> {
  return api.post<ApiNeed>('/api/needs', payload)
}
