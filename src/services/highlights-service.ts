import api from '../lib/api'
import { HighlightItem, highlights as localHighlights } from '../data/highlights'

export async function fetchHighlights(): Promise<HighlightItem[]> {
  try {
    const response = await api.get<HighlightItem[]>('/api/highlights')
    return Array.isArray(response) && response.length > 0 ? response : localHighlights
  } catch {
    return localHighlights
  }
}
