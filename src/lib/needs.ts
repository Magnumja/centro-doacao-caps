import { Need } from '../types'
import { needs as mockNeeds } from '../data/mock'
import { fetchNeeds, normalizeNeed } from '../services/needs-service'

export async function fetchPublicNeeds(): Promise<Need[]> {
  try {
    const response = await fetchNeeds()
    if (!Array.isArray(response) || response.length === 0) {
      return mockNeeds
    }

    return response.map((need) => normalizeNeed(need))
  } catch {
    return mockNeeds
  }
}
