import api from './api'
import { Need } from '../types'
import { needs as mockNeeds } from '../data/mock'

type ApiNeed = {
  id: string
  title: string
  amount: number
  description: string
  category: string
  priority: 'alta' | 'media'
  unitId?: string
  unit?: {
    id: string
    slug?: string
    title: string
  }
}

function normalizeNeed(need: ApiNeed): Need {
  const unitId = need.unit?.slug ?? need.unitId ?? need.unit?.id ?? ''

  return {
    id: need.id,
    title: need.title,
    amount: need.amount,
    description: need.description,
    category: need.category,
    priority: need.priority,
    unitId,
    unitName: need.unit?.title ?? 'Unidade não informada',
  }
}

export async function fetchPublicNeeds(): Promise<Need[]> {
  try {
    const response = await api.get('/api/needs')
    if (!Array.isArray(response) || response.length === 0) {
      return mockNeeds
    }

    return response.map((need) => normalizeNeed(need as ApiNeed))
  } catch {
    return mockNeeds
  }
}
